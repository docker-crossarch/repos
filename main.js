import path from 'path'
import {
  getLatestPublishedVersionRecord,
  setLatestPublishedVersion,
} from './lib/latest-published-version'
import { getTextFromEnv } from './lib/env'
import { runCommand } from './lib/shell'
import {
  generateTempName,
  createDirectory,
  copyFile,
  readFile,
  writeFile,
  deleteDirectory,
} from './lib/fs'
import { parseSemver } from './lib/semver'
import { log, info, warning, error } from './lib/log'
import settings from './repos/settings'

const BUILD_FOR_ARCHS = ['amd64', 'armhf']
const MULTIARCH_ALPINE_BRANCH = 'edge'
const MULTIARCH_UBUNTU_BRANCH = 'bionic-slim'

function failWithError(msg) {
  error(msg)
  process.exit(1)
}

async function main() {
  const BUILD = getTextFromEnv('BUILD')
  const DOCKER_USERNAME = getTextFromEnv('DOCKER_USERNAME')
  const DOCKER_PASSWORD = getTextFromEnv('DOCKER_PASSWORD')
  const AIRTABLE_BASE_URL = getTextFromEnv('AIRTABLE_BASE_URL')
  const AIRTABLE_API_KEY = getTextFromEnv('AIRTABLE_API_KEY')

  const airtableCreds = {
    baseUrl: AIRTABLE_BASE_URL,
    apiKey: AIRTABLE_API_KEY,
  }

  const isOsBuild = BUILD.startsWith('_')
  const buildName = isOsBuild ? BUILD.substring(1) : BUILD
  const buildPath = BUILD

  let buildSettings = null
  if (!isOsBuild) {
    buildSettings = settings[buildName]
  }

  info(`Building Crossarch images for ${BUILD_FOR_ARCHS.join(', ')}`)

  log('Registering QEMU...')

  await runCommand('docker', [
    'run',
    '--rm',
    '--privileged',
    'multiarch/qemu-user-static:register',
    '--reset',
  ])

  /*
   * Build
   */

  for (const arch of BUILD_FOR_ARCHS) {
    const tempDir = generateTempName('crossarch')
    await createDirectory(tempDir)

    await copyFile(
      path.join(__dirname, 'repos', buildPath, 'Dockerfile'),
      path.join(tempDir, 'Dockerfile')
    )

    let imageToUse
    if (!isOsBuild) {
      imageToUse = `crossarch/${buildSettings.image}:${arch}-latest`
    } else {
      if (buildName === 'alpine') {
        imageToUse = `multiarch/alpine:${arch}-${MULTIARCH_ALPINE_BRANCH}`
      } else if (buildName === 'ubuntu') {
        imageToUse = `multiarch/ubuntu-debootstrap:${arch}-${MULTIARCH_UBUNTU_BRANCH}`
      }
    }

    log(`Using ${imageToUse}`)

    const prepend = `\
FROM ${imageToUse}
ENV CROSSARCH_ARCH=${arch}
RUN echo "Building image for \${CROSSARCH_ARCH}"`

    const dockerfilePath = path.join(tempDir, 'Dockerfile')
    const dockerfileContent = await readFile(dockerfilePath)
    await writeFile(dockerfilePath, `${prepend}\n${dockerfileContent}`)

    log(`Building ${arch} image...`)

    await runCommand('docker', ['build', '--no-cache', '-t', `build:${arch}`, tempDir])
    await deleteDirectory(tempDir)
  }

  /*
   * Getting version
   */

  const repofile = await import(path.join(__dirname, 'repos', buildPath, 'Repofile.js')) // eslint-disable-line
  const call = args => runCommand('docker', ['run', '--rm', 'build:amd64'].concat(args), true)
  try {
    const version = await repofile.getVersion(call)
  } catch (err) {
    failWithError(`Could not find repo version: ${err.stack}`)
  }

  const publishedVersionRecord = await getLatestPublishedVersionRecord(airtableCreds, buildName)
  if (publishedVersionRecord.version === version && !isOsBuild) {
    warning('Software not updated since last push - skipping deployment')
    return
  }

  /*
   * Deployment
   */

  info(`Deploying ${buildName} (${version})`)

  log('Pushing images to Docker Hub...')

  await runCommand('docker', ['login', '-u', DOCKER_USERNAME, '-p', DOCKER_PASSWORD])
  for (const arch of BUILD_FOR_ARCHS) {
    // special case for Alpine
    const dockerTag = suffix =>
      runCommand('docker', ['tag', `build:${arch}`, `crossarch/${buildName}:${arch}-${suffix}`])
    const dockerPush = suffix =>
      runCommand('docker', ['push', `crossarch/${buildName}:${arch}-${suffix}`])
    const dockerTagAndPush = async suffix => {
      await dockerTag(suffix)
      await dockerPush(suffix)
    }

    const tags = ['latest']

    if (isOsBuild || buildSettings.versioning === 'as-is') {
      tags.push(version)
    } else {
      let manipulatedVersion = version
      if (buildSettings.versioning === 'major-minor') {
        manipulatedVersion += '.0'
      }

      const semver = parseSemver(manipulatedVersion)
      tags.push(semver.major)
      tags.push(`${semver.major}.${semver.minor}`)

      if (buildSettings.versioning === 'semver') {
        tags.push(`${semver.major}.${semver.minor}.${semver.patch}`)
      }
    }

    log(`Pushing tags ${tags.join(', ')}`)

    for (let tag of tags) {
      await dockerTagAndPush(tag)
    }
  }

  info('Updating latest published version...')
  await setLatestPublishedVersion(airtableCreds, publishedVersionRecord, version)
}

main()
  .then(() => {
    info('Done.')
  })
  .catch(err => {
    failWithError(err.stack)
  })
