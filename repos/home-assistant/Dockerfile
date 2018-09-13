RUN apk add --no-cache python3 ca-certificates python3-dev build-base linux-headers libffi-dev \
  && update-ca-certificates \
  && python3 -m ensurepip \
  && pip3 --no-cache-dir install homeassistant \
  && mkdir -p /home-assistant

WORKDIR /home-assistant

VOLUME ["/home-assistant"]

EXPOSE 8123

ENTRYPOINT ["hass"]
CMD ["--config", "/home-assistant"]
