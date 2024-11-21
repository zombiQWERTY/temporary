import { Module } from '@nestjs/common';

import { createMailProvider } from './mail.provider';
import { MailService } from './mail.service';

@Module({
  exports: [MailService],
  imports: [],
  providers: [MailService, createMailProvider()],
})
export class MailModule {}
