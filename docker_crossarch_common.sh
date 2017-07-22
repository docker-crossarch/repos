#!/usr/bin/env bash

__crossarch_common_version="1.1.0"

__crossarch_archs=("${CROSSARCH_ARCHS:="amd64 armhf"}")
__crossarch_alpine_branch=${CROSSARCH_ALPINE_BRANCH:="edge"}
__crossarch_use_multiarch_alpine=${CROSSARCH_USE_MULTIARCH_ALPINE:="false"}

__crossarch_build_is_semver=${CROSSARCH_BUILD_IS_SEMVER:="true"}
__crossarch_build_squash=${CROSSARCH_BUILD_SQUASH:="false"}

__die () {
  printf '  ❌ \033[1;31mERROR: %s\033[0m\n' "$@" >&2  # bold red
  exit 1
}

__info () {
  printf '  \033[1;36m> %s\033[0m\n' "$@" >&2  # bold cyan
}

__warn () {
  printf '  ⚠ \033[1;33mWARNING: %s\033[0m\n' "$@" >&2  # bold yellow
}

__crossarch_welcome () {
  local welcome
  welcome=$(cat <<EOF
  ____                                  _     
 / ___|_ __ ___  ___ ___  __ _ _ __ ___| |__  
| |   | '__/ _ \\/ __/ __|/ _\` | '__/ __| '_ \\ 
| |___| | | (_) \\__ \\__ \\ (_| | | | (__| | | |
 \\____|_|  \\___/|___/___/\\__,_|_|  \\___|_| |_|
 
Version ${__crossarch_common_version}
EOF
)

  printf '\033[1;35m%s\033[0m\n\n' "${welcome}" >&2
}

__crossarch_common_parse_semver () {
  local re='[^0-9]*\([0-9]*\)[.]\([0-9]*\)[.]\([0-9]*\)\([0-9A-Za-z-]*\)'
  # MAJOR
  # shellcheck disable=SC2001
  eval "${2}"="$(echo "${1}" | sed -e "s#${re}#\\1#")"
  # MINOR
  # shellcheck disable=SC2001
  eval "${3}"="$(echo "${1}" | sed -e "s#${re}#\\2#")"
  # MINOR
  # shellcheck disable=SC2001
  eval "${4}"="$(echo "${1}" | sed -e "s#${re}#\\3#")"
  # SPECIAL
  # shellcheck disable=SC2001
  eval "${5}"="$(echo "${1}" | sed -e "s#${re}#\\4#")"
}

crossarch_common_build () {
  local dockerfile="${1}"
  
  __crossarch_welcome
  
  __info "Building Crossarch images for ${__crossarch_archs[*]} (on top of Alpine ${__crossarch_alpine_branch})"
  
  __info "Registering QEMU..."
  docker run --rm --privileged multiarch/qemu-user-static:register --reset
  
  for arch in "${__crossarch_archs[@]}"; do
    local tmp_dir
    tmp_dir=$(mktemp -d -p /tmp crossarch.XXXXXX)

    cp "${dockerfile}" "${tmp_dir}/Dockerfile"
    
    local image_to_use
    image_to_use="crossarch/alpine:${arch}-${__crossarch_alpine_branch}"
    
    if [ "${__crossarch_use_multiarch_alpine}" = "true" ]; then
      image_to_use="multiarch/alpine"

      local multiarch_alpine_arch
      if [ "${arch}" = "amd64" ]; then
        multiarch_alpine_arch="x86_64"
      elif [ "${arch}" = "armhf" ]; then
        multiarch_alpine_arch="armhf"
      fi
      
      image_to_use="${image_to_use}:${multiarch_alpine_arch}-${__crossarch_alpine_branch}"
    fi
      
    local prepend
    prepend=$(cat <<EOF
FROM ${image_to_use}
ENV CROSSARCH_ARCH=${arch}
RUN echo "Building image for \${CROSSARCH_ARCH}"
EOF
)
    echo -e "${prepend}\\n$(cat "${tmp_dir}/Dockerfile")" > "${tmp_dir}/Dockerfile"
    
    local build_flags
    build_flags=(--no-cache)
    
    if [ "${__crossarch_build_squash}" = "true" ]; then
      build_flags+=(--squash)
    fi
    
    __info "Building ${arch} image..."
    docker build "${build_flags[@]}" -t "build:${arch}" "${tmp_dir}"
    rm -rf "${tmp_dir}"
  done
}

crossarch_common_deploy () {
  local docker_username="${1}"
  local docker_password="${2}"
  local build_name="${3}"
  local build_version="${4}"
  
  local build_version_major=0
  local build_version_minor=0
  local build_version_patch=0
  # shellcheck disable=SC2034
  local build_version_special=""
  
  __info "Deploying ${build_name} (${build_version})..."
    
  if [ "${__crossarch_build_is_semver}" = "true" ]; then
    __crossarch_common_parse_semver "${build_version}" build_version_major build_version_minor build_version_patch build_version_special
    
    __info "Version major: ${build_version_major}, minor: ${build_version_minor}, patch: ${build_version_patch}"
  fi

  
  __info "Pushing images to Docker Hub..."
  docker login -u "${docker_username}" -p "${docker_password}"
  for arch in "${__crossarch_archs[@]}"; do
    if [ "${__crossarch_build_is_semver}" = "true" ]; then
      docker tag "build:${arch}" "crossarch/${build_name}:${arch}-${build_version_major}"
      docker tag "build:${arch}" "crossarch/${build_name}:${arch}-${build_version_major}.${build_version_minor}"
      docker tag "build:${arch}" "crossarch/${build_name}:${arch}-${build_version_major}.${build_version_minor}.${build_version_patch}"
      docker tag "build:${arch}" "crossarch/${build_name}:${arch}-latest"
      docker push "crossarch/${build_name}:${arch}-${build_version_major}"
      docker push "crossarch/${build_name}:${arch}-${build_version_major}.${build_version_minor}"
      docker push "crossarch/${build_name}:${arch}-${build_version_major}.${build_version_minor}.${build_version_patch}"
      docker push "crossarch/${build_name}:${arch}-latest"
    else
      docker tag "build:${arch}" "crossarch/${build_name}:${arch}-${build_version}"
      docker tag "build:${arch}" "crossarch/${build_name}:${arch}-latest"
      docker push "crossarch/${build_name}:${arch}-${build_version}"
      docker push "crossarch/${build_name}:${arch}-latest"
    fi
  done
}
