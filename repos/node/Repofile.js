export async function getVersion (call) {
  const output = await call(['--version']).trim()
  return output.substring(1)
}
