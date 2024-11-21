import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const PublicUrlSchema = z.object({
  url: z.string(),
});

export const publicUrlConfig = registerAs('publicUrl', () => {
  const publicUrlConfig = {
    url: process.env.PUBLIC_URL,
  };

  return PublicUrlSchema.parse(publicUrlConfig);
});

export type PublicUrlSchemaType = z.infer<typeof PublicUrlSchema>;
