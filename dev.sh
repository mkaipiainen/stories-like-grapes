#!/bin/bash

# Kill all processes when the script exits
trap 'kill $(jobs -p)' EXIT

# Start PostgreSQL container
echo "Starting PostgreSQL..."
docker compose up -d


# Start the API and frontend in parallel
echo "Starting API and frontend..."
(pnpm dev)

# Wait for all background processes
wait