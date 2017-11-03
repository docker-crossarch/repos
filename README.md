# Docker Crossarch builds

[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-repositories-0db7ed.svg?style=flat-square)](https://hub.docker.com/r/crossarch/)
[![Build status](https://img.shields.io/travis/docker-crossarch/repos/master.svg?style=flat-square)](https://travis-ci.org/docker-crossarch/repos)
[![Built daily](https://img.shields.io/badge/built-daily-yellow.svg?style=flat-square)](https://travis-ci.org/docker-crossarch/repos/requests)
[![Fieldbook](https://img.shields.io/badge/Fieldbook-versions-orange.svg?style=flat-square)](https://fieldbook.com/books/59c4cd5751a5870300f17e60)
[![dependencies Status](https://img.shields.io/david/docker-crossarch/repos.svg?style=flat-square)](https://david-dm.org/docker-crossarch/repos)

This repository contains the code required to build cross-architecture Docker images on a daily basis.
Images are built automatically on Travis CI.

## What does it do?

The build script emulates, using QEMU, all supported environments and triggers a Docker build of all Dockerfile. If the software follow semver, the following tags are pushed:

* `<arch>-<major>`
* `<arch>-<major>.<minor>`
* `<arch>-<major>.<minor>.<patch>`
* `<arch>-latest`

Otherwise:

* `<arch>-<version>`
* `<arch>-latest`

## Supported architectures

* amd64
* armhf

## Add a new software

Of course, we appreciate contributions.

### Instructions

* Fork the project
* Duplicate one of the current software folder in the `repos` directory. It contains:
  * A `Dockerfile`. It is a normal Dockerfile, except it does not have a `FROM` image
  * A `Repofile.js`. This contains a function that must return the version of the software
  * A `README.md`. It describes how to use your image
* Add a `BUILD=<yoursoftware>` job to the `.travis.yml` file
* Submit a PR

### Notes for Dockerfile

* A fresh (24h or less) Alpine edge image is used
* The `CROSSARCH_ARCH` environment variable is set to the currently being built architecture
