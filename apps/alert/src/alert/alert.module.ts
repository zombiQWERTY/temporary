import { Module } from '@nestjs/common';

import { AlertService } from './alert.service';
import { AlertRestController } from './alert.rest.controller';
import { AlertTcpController } from './alert.tcp.controller';
import { OtpModule } from '../otp/otp.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [OtpModule, MailModule],
  controllers: [AlertRestController, AlertTcpController],
  providers: [AlertService],
})
export class AlertModule {}
