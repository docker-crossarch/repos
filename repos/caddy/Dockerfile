RUN apk add --no-cache ca-certificates \
  && update-ca-certificates \
  && apk --no-cache add --virtual devs tar curl \
  && if [ "${CROSSARCH_ARCH}" = "armhf" ]; then caddy_arch="arm6"; \
  elif [ "${CROSSARCH_ARCH}" = "amd64" ]; then caddy_arch="amd64"; fi \
  && curl --silent --location "https://caddyserver.com/download/linux/${caddy_arch}" | tar --extract --gzip --directory /usr/bin caddy \
  && apk del --purge devs \
  && mkdir -p /caddy/config /caddy/tls

WORKDIR /caddy

ENV CADDYPATH="/caddy/tls"

VOLUME ["/caddy/config"]
VOLUME ["/caddy/tls"]

EXPOSE 2015 80 443

ENTRYPOINT ["caddy"]
CMD ["--conf", "/caddy/config/Caddyfile"]
