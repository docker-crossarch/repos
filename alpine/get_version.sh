crossarch_build_get_version () {
  docker run --rm build:amd64 /bin/sh -c "source /etc/os-release; echo \${VERSION_ID}"
}