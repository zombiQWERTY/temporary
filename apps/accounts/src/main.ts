import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { config as dotEnvConfig } from 'dotenv';
import { expand as dotEnvExpand } from 'dotenv-expand';
import * as process from 'process';
import { install as sourceMapInstall } from 'source-map-support';

import { AppModule } from './app.module';
import { makeLogger, GlobalExceptionsFilter } from '@erp-modul/shared';

sourceMapInstall();

async function bootstrap() {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };

  dotEnvExpand(dotEnvConfig());

  const logger = makeLogger('Accounts');
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.TCP,
      options: {
        host: process.env.ACCOUNTS_APP_HOST,
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
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.startAllMicroservices();
  await app.listen(parseInt(process.env.SERVICE_REST_PORT, 10));
}

bootstrap();
