export async function getVersion (call) {
  // (docker run --rm build:amd64 -h || true) | grep -oP "(?<=mosquitto version )(.+)(?=\(build)"
  const output = await call(['-h', '||', 'true'])
  console.log(output)
  process.exit(2)
}
