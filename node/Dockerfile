RUN apk add --no-cache nodejs-current \
  && apk --no-cache add --virtual devs tar curl \
  && mkdir /opt \
  && curl --silent --location https://yarnpkg.com/latest.tar.gz | tar --extract --gzip --directory /opt \
  && mv /opt/dist /opt/yarn \
  && ln -s /opt/yarn/bin/yarn /usr/local/bin \
  && apk del --purge devs

ENTRYPOINT ["node"]
