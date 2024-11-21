import { Module } from '@nestjs/common';
import { MinioModule } from 'nestjs-minio-client';
import { ConfigModule, ConfigType } from '@nestjs/config';

import { FilesService } from './files.service';
import { FilesRestController } from './files.rest.controller';
import { FilesTcpController } from './files.tcp.controller';
import { PrismaService } from '../services/prisma.service';
import { minioConfig } from '../config/minio.config';

@Module({
  imports: [
    MinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [minioConfig.KEY],
      useFactory: (config: ConfigType<typeof minioConfig>) => {
        return {
          endPoint: config.endpoint,
          port: config.port,
          useSSL: config.useSSL,
          accessKey: config.accessKey,
          secretKey: config.secretKey,
        };
      },
    }),
  ],
  controllers: [FilesRestController, FilesTcpController],
  providers: [PrismaService, FilesService],
  exports: [FilesService],
})
export class FilesModule {}
