import semver from 'semver'

export function parseSemver (version) {
  return {
    major: semver.major(version),
    minor: semver.minor(version),
    patch: semver.patch(version)
  }
}
