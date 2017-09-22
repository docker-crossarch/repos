export async function getVersion (call) {
  // docker run --rm build:amd64 --version
  const output = await call(['--version'])
  console.log(output)
  process.exit(2)
}
