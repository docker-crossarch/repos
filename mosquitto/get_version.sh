crossarch_build_get_version () {
  (docker run --rm build:amd64 -h || true) | grep -oP "(?<=mosquitto version )(.+)(?=\(build)"
}