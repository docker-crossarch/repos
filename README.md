# Common script for Docker Crossarch builds

[![Build Status](https://travis-ci.org/docker-crossarch/repos.svg?branch=master)](https://travis-ci.org/docker-crossarch/repos)

This repository contains the common code used in all Crossarch builds.

## Supported architectures

* amd64
* armhf

## Usage

```bash
wget https://raw.githubusercontent.com/docker-crossarch/_common/master/docker_crossarch_common.sh
chmod +x ./docker_crossarch_common.sh
source ./docker_crossarch_common.sh

# This command builds the Dockerfile for all archs
# The resulting images are tagged as `build:${arch}`
crossarch_common_build "./Dockerfile"

# This command deploys all images
# For each arch are pushed 4 different tags on the `crossarch/${build-name}` repo, prefixed with `${arch}-`:
# * `${build-version_major}`
# * `${build-version_major}.${build-version_minor}`
# * `${build-version_major}.${build-version_minor}.${build-version_patch}`
# * `latest`
crossarch_common_deploy "docker-username" "docker-password" "build-name" "build-version"
```

## Notes for Dockerfile

* The [multiarch/alpine:edge](https://hub.docker.com/r/multiarch/alpine/) image is used.
* The `CROSSARCH_ARCH` is set to the currently being built architecture