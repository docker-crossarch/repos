RUN apk add --no-cache mosquitto \
 && mkdir -p /mosquitto/config /mosquitto/data

WORKDIR /mosquitto

VOLUME ["/mosquitto/config", "/mosquitto/data"]

# 1883 MQTT plain
# 8883 MQTT TLS
# 9001 MQTT WS
EXPOSE 1883 8883 9001

ENTRYPOINT ["mosquitto"]
CMD ["-c", "/mosquitto/config/mosquitto.conf"]
