import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const AppConfigSchema = z.object({
  node_env: z.string().default('development'),
  tcpPort: z.number().default(3102),
  restPort: z.number().default(3101),
});

export const appConfig = registerAs('app', () => {
  const appConfig = {
    node_env: process.env.NODE_ENV,
    tcpPort: parseInt(process.env.SERVICE_TCP_PORT, 10),
    restPort: parseInt(process.env.SERVICE_REST_PORT, 10),
  };

  return AppConfigSchema.parse(appConfig);
});
