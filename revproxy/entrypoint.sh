#!/bin/sh

# Export the CLOUDFLARE_API_KEY environment variable from the secret
if [ -f /run/secrets/CLOUDFLARE_API_KEY ]; then
  echo "Secret file found, setting CLOUDFLARE_API_KEY"
  export CLOUDFLARE_API_KEY=$(cat /run/secrets/CLOUDFLARE_API_KEY)
  echo "CLOUDFLARE_API_KEY is set to: $CLOUDFLARE_API_KEY"
else
  echo "Secret file not found, CLOUDFLARE_API_KEY not set"
fi

# Execute the command passed to the entrypoint
exec "$@"