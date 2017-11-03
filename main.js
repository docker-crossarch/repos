import path from 'path'
import {getLatestPublishedVersionRecord, setLatestPublishedVersion} from './lib/latest-published-version'
import {getTextFromEnv} from './lib/env'
import {runCommand} from './lib/shell'
import {generateTempName, createDirectory, copyFile, readFile, writeFile, deleteDirectory} from './lib/fs'
import {parseSemver} from './lib/semver'
import {log, info, warning, error} from './lib/log'

const BUILD_FOR_ARCHS = ['amd64', 'armhf']
const MULTIARCH_ALPINE_BRANCH = 'edge'

async function main () {
  const BUILD = getTextFromEnv('BUILD')
  const DOCKER_USERNAME = getTextFromEnv('DOCKER_USERNAME')
  const DOCKER_PASSWORD = getTextFromEnv('DOCKER_PASSWORD')
  const FIELDBOOK_BASE_URL = getTextFromEnv('FIELDBOOK_BASE_URL')
  const FIELDBOOK_USERNAME = getTextFromEnv('FIELDBOOK_USERNAME')
  const FIELDBOOK_PASSWORD = getTextFromEnv('FIELDBOOK_PASSWORD')

  const fieldbookCreds = {
    baseUrl: FIELDBOOK_BASE_URL,
    username: FIELDBOOK_USERNAME,
    password: FIELDBOOK_PASSWORD
  }

  info(`Building Crossarch images for ${BUILD_FOR_ARCHS.join(', ')} (on top of Alpine ${MULTIARCH_ALPINE_BRANCH})`)

  log('Registering QEMU...')

  await runCommand('docker', ['run', '--rm', '--privileged', 'multiarch/qemu-user-static:register', '--reset'])

  /*
  * Build
  */

  for (const arch of BUILD_FOR_ARCHS) {
    const tempDir = generateTempName('crossarch')
    await createDirectory(tempDir)

    await copyFile(path.join(__dirname, 'repos', BUILD, 'Dockerfile'), path.join(tempDir, 'Dockerfile'))

    let imageToUse = `crossarch/alpine:${arch}-${MULTIARCH_ALPINE_BRANCH}`
    // handle special alpine case
    if (BUILD === 'alpine') {
      imageToUse = 'multiarch/alpine'
      let multiarchAlpineArch
      if (arch === 'amd64') multiarchAlpineArch = 'x86_64'
      else if (arch === 'armhf') multiarchAlpineArch = 'armhf'

      imageToUse += `:${multiarchAlpineArch}-${MULTIARCH_ALPINE_BRANCH}`
    }

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

  const repofile = await import(path.join(__dirname, 'repos', BUILD, 'Repofile.js')) // eslint-disable-line
  const call = args => runCommand('docker', ['run', '--rm', 'build:amd64'].concat(args), true)
  const version = await repofile.getVersion(call)

  const publishedVersionRecord = await getLatestPublishedVersionRecord(fieldbookCreds, BUILD)
  if (publishedVersionRecord.version === version && BUILD !== 'alpine') {
    warning('Software not updated since last push - skipping deployment')
    return
  }

  /*
  * Deployment
  */

  info(`Deploying ${BUILD} (${version})`)

  let semver
  if (BUILD !== 'alpine') {
    semver = parseSemver(version)
    log(`Version major: ${semver.major}, minor: ${semver.minor}, patch: ${semver.patch}`)
  }

  log('Pushing images to Docker Hub...')

  await runCommand('docker', ['login', '-u', DOCKER_USERNAME, '-p', DOCKER_PASSWORD])
  for (const arch of BUILD_FOR_ARCHS) {
    // special case for Alpine
    const dockerTag = suffix => runCommand('docker', ['tag', `build:${arch}`, `crossarch/${BUILD}:${arch}-${suffix}`])
    const dockerPush = suffix => runCommand('docker', ['push', `crossarch/${BUILD}:${arch}-${suffix}`])
    const dockerTagAndPush = async suffix => {
      await dockerTag(suffix)
      await dockerPush(suffix)
    }

    if (BUILD !== 'alpine') {
      await dockerTagAndPush(semver.major)
      await dockerTagAndPush(`${semver.major}.${semver.minor}`)
      await dockerTagAndPush(`${semver.major}.${semver.minor}.${semver.patch}`)
      await dockerTagAndPush('latest')
    } else {
      await dockerTagAndPush(version)
      await dockerTagAndPush('latest')
    }
  }

  info('Updating latest published version...')
  await setLatestPublishedVersion(fieldbookCreds, publishedVersionRecord, version)
}

main().then(() => {
  info('Done.')
}).catch((err) => {
  error(err.stack)
  process.exit(1)
})
