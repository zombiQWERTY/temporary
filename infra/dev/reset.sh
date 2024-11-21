#!/bin/sh

npx prisma migrate reset --schema=/usr/src/app/apps/$APP_NAME/prisma/schema.prisma --force
