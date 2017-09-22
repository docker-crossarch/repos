export async function getVersion (call) {
  // docker run --rm build:amd64 --version | grep -oP "(?<=v)(.+)"

  const output = await call(['--version'])
  console.log(output)
  process.exit(2)
}
