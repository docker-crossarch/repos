const REGEX_VERSION = /v([0-9]+.[0-9]+.[0-9]+)/

export async function getVersion(call) {
  const output = await call(['--version'])
  return REGEX_VERSION.exec(output.trim())[1]
}
