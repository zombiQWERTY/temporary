import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { FilesModule } from './files/files.module';
import { minioConfig } from './config/minio.config';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, minioConfig],
      isGlobal: true,
      cache: true,
    }),
    FilesModule,
    DocumentModule,
  ],
})
export class AppModule {}
