#!/bin/sh

npx prisma migrate dev --schema=/usr/src/app/apps/$APP_NAME/prisma/schema.prisma
