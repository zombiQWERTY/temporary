import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { smsConfig } from './config/sms.config';
import { AlertModule } from './alert/alert.module';
import { emailConfig } from './config/email.config';
import { OtpModule } from './otp/otp.module';
import { publicUrlConfig } from './config/publicUrl.config';
import { minioConfig } from './config/minio.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, smsConfig, emailConfig, publicUrlConfig, minioConfig],
      isGlobal: true,
      cache: true,
    }),
    OtpModule,
    AlertModule,
  ],
})
export class AppModule {}
