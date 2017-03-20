crossarch_build_get_version () {
  docker run --rm build:amd64 --version | grep -oP "(?<=v)(.+)"
}