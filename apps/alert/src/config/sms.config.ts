import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const SmsConfigSchema = z.object({
  expiration: z.string().default('3m'),
  login: z.string(),
  password: z.string(),
});

export const smsConfig = registerAs('sms', () => {
  const appConfig = {
    expiration: process.env.SMS_EXPIRATION,
    login: process.env.SMS_LOGIN,
    password: process.env.SMS_PASSWORD,
  };

  return SmsConfigSchema.parse(appConfig);
});
