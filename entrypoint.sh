#!/bin/sh

# This script is used as the entrypoint for the Docker container.
# It ensures that the database schema is synchronized before starting the Next.js app.

echo "Running Prisma DB Push..."
npx prisma db push --schema=prisma/schema.prisma --accept-data-loss

echo "Starting Next.js..."
exec node server.js
