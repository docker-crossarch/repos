const REGEX_VERSION = /mosquitto version ([0-9]+.[0-9]+.[0-9]+)/

export async function getVersion(call) {
  const output = await call(['-h', '||', 'true'])
  return REGEX_VERSION.exec(output.trim())[1]
}
