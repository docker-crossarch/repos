RUN apk --no-cache add --virtual devs tar curl \
  && if [ "${CROSSARCH_ARCH}" = "armhf" ]; then caddy_arch="arm"; \
  elif [ "${CROSSARCH_ARCH}" = "amd64" ]; then caddy_arch="amd64"; fi \
  && curl --silent --location "https://caddyserver.com/download/build?os=linux&arch=${caddy_arch}&features=" | tar --extract --gzip --directory /usr/bin caddy \
  && apk del --purge devs \
  && mkdir -p /caddy/config /caddy/tls

WORKDIR /caddy

ENV CADDYPATH="/caddy/tls"

VOLUME ["/caddy/config"]
VOLUME ["/caddy/tls"]

EXPOSE 2015 80 443

ENTRYPOINT ["caddy"]
CMD ["--conf", "/caddy/config/Caddyfile"]
