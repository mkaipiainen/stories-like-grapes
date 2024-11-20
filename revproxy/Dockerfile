FROM caddy:2-builder as builder
RUN xcaddy build --with github.com/caddy-dns/cloudflare

FROM caddy:2-alpine as runner
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
ARG CLOUDFLARE_API_KEY=${CLOUDFLARE_API_KEY}
ENV CLOUDFLARE_API_KEY=${CLOUDFLARE_API_KEY}
COPY Caddyfile /etc/caddy/Caddyfile

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]