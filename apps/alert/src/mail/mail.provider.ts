import { Provider } from '@nestjs/common';
import * as SendgridMail from '@sendgrid/mail';

import { MailStub } from './mail.stub';
import { emailConfig, EmailSchemaType } from '../config/email.config';
import { appConfig, AppSchemaType } from '../config/app.config';

export const MAIL_PROVIDER_SERVICE = 'MAIL_PROVIDER_SERVICE';

export function createMailProvider(): Provider<SendgridMail.MailService> {
  return {
    inject: [appConfig.KEY, emailConfig.KEY],
    provide: MAIL_PROVIDER_SERVICE,
    useFactory: (
      appConfig: AppSchemaType,
      emailConfig: EmailSchemaType,
    ): SendgridMail.MailService => {
      if (appConfig.node_env === 'production') {
        SendgridMail.setApiKey(emailConfig.sendgridKey);
        return SendgridMail;
      }

      return new MailStub() as SendgridMail.MailService;
    },
  };
}
