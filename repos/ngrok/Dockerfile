# TODO: amd64 is broken, so we use i386
# See https://github.com/inconshreveable/ngrok/issues/565
RUN apk add --no-cache ca-certificates \
  && update-ca-certificates \
  && apk --no-cache add --virtual devs tar curl \
  && if [ "${CROSSARCH_ARCH}" = "armhf" ]; then ngrok_arch="arm"; \
  elif [ "${CROSSARCH_ARCH}" = "amd64" ]; then ngrok_arch="i386"; fi \
  && curl --silent --location "https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-${ngrok_arch}.tgz" | tar --extract --gzip --directory /usr/bin ngrok \
  && apk del --purge devs

ENTRYPOINT ["ngrok"]
