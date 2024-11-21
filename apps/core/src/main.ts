import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { config as dotEnvConfig } from 'dotenv';
import { expand as dotEnvExpand } from 'dotenv-expand';
import * as process from 'process';
import { install as sourceMapInstall } from 'source-map-support';

import { AppModule } from './app.module';
import { makeLogger, GlobalExceptionsFilter } from '@erp-modul/shared';
import { NestExpressApplication } from '@nestjs/platform-express';

sourceMapInstall();

async function bootstrap() {
  dotEnvExpand(dotEnvConfig());

  const logger = makeLogger('Core');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });

  app.set('trust proxy', true);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.TCP,
      options: {
        host: process.env.CORE_APP_HOST,
        port: parseInt(process.env.SERVICE_TCP_PORT, 10),
      },
    },
    {
      inheritAppConfig: true,
    },
  );

  app.useGlobalFilters(new GlobalExceptionsFilter(logger));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.startAllMicroservices();
  await app.listen(parseInt(process.env.SERVICE_REST_PORT, 10));
}

bootstrap();
