FROM node:22.2.0 as builder

WORKDIR /app
RUN npm install -g pnpm@9.7.0

COPY . .
RUN pnpm install
RUN pnpm run build


FROM caddy:2.8.1-alpine as runner
COPY Caddyfile /etc/caddy/Caddyfile
# Copy the built application to the web root
COPY --from=builder /app/dist /srv

# Run Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
