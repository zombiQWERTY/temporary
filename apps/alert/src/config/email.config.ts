import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const EmailConfigSchema = z.object({
  expiration: z.string().default('3m'),
  sendgridKey: z.string(),
  fromNoReply: z.string(),
  fromBackoffice: z.string(),
  fromName: z.string(),
});

export const emailConfig = registerAs('email', () => {
  const appConfig = {
    expiration: process.env.EMAIL_EXPIRATION,
    sendgridKey: process.env.SENDGRID_KEY,
    fromNoReply: process.env.FROM_NO_REPLY,
    fromBackoffice: process.env.FROM_BACKOFFICE,
    fromName: process.env.FROM_NAME,
  };

  return EmailConfigSchema.parse(appConfig);
});

export type EmailSchemaType = z.infer<typeof EmailConfigSchema>;
