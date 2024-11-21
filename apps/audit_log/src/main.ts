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
  dotEnvExpand(dotEnvConfig());

  const logger = makeLogger('Audit_log');
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: process.env.RABBIT_MQ_HOSTS.split(','),
        queue: 'audit_log_queue',
        noAck: false,
        queueOptions: {
          durable: true,
        },
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
