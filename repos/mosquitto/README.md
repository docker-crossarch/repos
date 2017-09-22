# Mosquitto Crossarch

## Usage

```bash
docker run -v mosquitto_config:/mosquitto/config -v mosquitto_data:/mosquitto/data -p 1883:1883 -p 8883:8883 -p 9001:9001 crossarch/mosquitto:amd64-latest
```

## Volumes

* `/mosquitto/config`: You can store your configuration there. By default, mosquitto is started with the `/mosquitto/config/mosquitto.conf` configuration file
* `/mosquitto/data`: You can the data of the broker there (with the `persistence_location` directive in `mosquitto.conf`)