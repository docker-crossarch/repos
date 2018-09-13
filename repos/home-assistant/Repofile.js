export async function getVersion(call) {
  const output = await call(['--version'])
  return output.trim()
}
