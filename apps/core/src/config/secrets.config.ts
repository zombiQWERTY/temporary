import { registerAs } from '@nestjs/config';
import { z } from 'zod';
import { StringValue } from 'ms';

const SecretsSchema = z.object({
  passwordPepper: z.string(),
  accessTokenExp: z.string().transform((arg) => arg as StringValue),
  refreshTokenExp: z.string().transform((arg) => arg as StringValue),
});

export const secretsConfig = registerAs('secrets', () => {
  const secrets = {
    accessTokenExp: process.env.ACCESS_TOKEN_EXP,
    refreshTokenExp: process.env.REFRESH_TOKEN_EXP,
    passwordPepper: process.env.PASSWORD_PEPPER,
  };

  return SecretsSchema.parse(secrets);
});
