# Docker Crossarch builds

[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-repositories-0db7ed.svg?style=flat-square)](https://hub.docker.com/r/crossarch/)
[![Build status](https://img.shields.io/travis/docker-crossarch/repos/master.svg?style=flat-square)](https://travis-ci.org/docker-crossarch/repos)
[![Built daily](https://img.shields.io/badge/built-daily-yellow.svg?style=flat-square)](https://travis-ci.org/docker-crossarch/repos/requests)
[![Published versions](https://img.shields.io/badge/Published-versions-orange.svg?style=flat-square)](https://airtable.com/shr0t9RrpGUODInDX)
[![dependencies Status](https://img.shields.io/david/docker-crossarch/repos.svg?style=flat-square)](https://david-dm.org/docker-crossarch/repos)

This repository contains the code required to build cross-architecture Docker images on a daily basis.
Images are built automatically on Travis CI.

## What does it do?

The build script emulates, using QEMU, all supported environments and triggers a Docker build of all Dockerfile. Then, the following tags are pushed:

- `<arch>-<version>`
- `<arch>-latest`

If the release scheme of the software is MAJOR.MINOR, these tags are also pushed:

- `<arch>-<major>`
- `<arch>-<major>.<minor>`

Plus, if the software follows semver:

- `<arch>-<major>.<minor>.<patch>`

## Supported architectures

- amd64
- armhf

## Add a new software

Of course, we appreciate contributions.

### Instructions

- Fork the project
- Duplicate one of the current software folder in the [repos](./repos) directory. It contains:
  - A `Dockerfile`. It is a normal Dockerfile, except it does not have a `FROM` image
  - A `Repofile.js`. This contains a function that must return the version of the software
  - A `README.md`. It describes how to use your image
- Add a `<yoursoftware>` key to the [repos/settings.json](./repos/settings.json) file
  The following settings must be set:
  - `image`: The base image to use. Can be `alpine` or `ubuntu`
  - `versioning`: The versioning scheme of the software. Can be `as-is`, `major-minor`, or `semver`
- Add a `BUILD=<yoursoftware>` job to the `.travis.yml` file
- Submit a PR

### Notes for Dockerfile

- A fresh, up-to-date (24h or less) Alpine (edge) or Ubuntu (latest release) image is used
- The `CROSSARCH_ARCH` environment variable is set to the currently being built architecture
