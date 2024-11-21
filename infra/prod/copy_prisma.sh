#!/bin/sh

for APP_PATH in /usr/src/app/apps/*/ ; do
  APP=$(basename "$APP_PATH")

  if [ -f "/usr/src/app/apps/${APP}/prisma/schema.prisma" ]; then
    mkdir -p /usr/src/app/.prisma/${APP}/client
    cp /usr/src/app/apps/${APP}/prisma/client/schema.prisma /usr/src/app/.prisma/${APP}/client

    if [ -d "/usr/src/app/apps/${APP}/prisma/migrations" ]; then
      cp -R /usr/src/app/apps/${APP}/prisma/migrations /usr/src/app/.prisma/${APP}/client/migrations
    fi

    cp /usr/src/app/apps/${APP}/prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node /usr/src/app/.prisma/${APP}/client

    rm -rf /usr/src/app/apps/${APP}

    mkdir -p /usr/src/app/apps/${APP}/prisma
    cp -R /usr/src/app/.prisma/${APP}/client /usr/src/app/apps/${APP}/prisma
  fi
done
