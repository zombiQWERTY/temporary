import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../services/prisma.service';
import { SMSService } from '../services/sms.service';
import { OtpService } from './otp.service';

@Module({
  imports: [HttpModule, MailModule],
  controllers: [],
  providers: [PrismaService, OtpService, SMSService],
  exports: [OtpService],
})
export class OtpModule {}
