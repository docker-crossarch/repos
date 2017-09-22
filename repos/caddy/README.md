# Caddy Crossarch

## Usage

```bash
docker run -v caddy_config:/caddy/config -v caddy_tls:/caddy/tls -p 2015:2015 -p 80:80 -p 443:443 crossarch/caddy:amd64-latest
```

## Volumes

* `/caddy/config`: You can store your configuration there. By default, caddy is started with the `/caddy/config/Caddyfile` configuration file
* `/caddy/tls`: Usually `.caddy` folder, used to store and manage cryptographic assets 