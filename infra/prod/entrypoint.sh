#!/bin/sh

if [ -z "$1" ]; then
  echo "Usage: $0 APP_NAME"
  exit 1
fi

APP_NAME=$1

# Apply migrations if exists
if [ -f "/usr/src/app/.prisma/${APP_NAME}/client/schema.prisma" ]; then
  npx prisma migrate deploy --schema=/usr/src/app/.prisma/${APP_NAME}/client/schema.prisma

  echo "Migrations for $APP_NAME applied..."
fi

echo "Starting $APP_NAME service..."

node ./dist/apps/$APP_NAME/main.js
