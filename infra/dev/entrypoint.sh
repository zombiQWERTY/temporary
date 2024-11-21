#!/bin/sh

if [ -z "$1" ]; then
  echo "Usage: $0 APP_NAME"
  exit 1
fi

APP_NAME=$1

# Generate Prisma files if schema exists
if [ -f "/usr/src/app/apps/$APP_NAME/prisma/schema.prisma" ]; then
  npx prisma generate --schema=/usr/src/app/apps/$APP_NAME/prisma/schema.prisma

  echo "Prisma files for $APP_NAME generated..."
fi

echo "Starting $APP_NAME service..."

npm run start:dev $APP_NAME
