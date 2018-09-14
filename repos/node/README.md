# Node.js Crossarch

⚠️ As of 2018-09-14, this image ships with the more maintained Node.js LTS instead of Current.

## Usage

```bash
docker run crossarch/node:amd64-latest --version
```

This image contains the latest stable version of Yarn.
**NPM is not installed** by choice: Yarn provides the same functionality and NPM is way too slow on `armhf`, which cause the CI build to fail.
