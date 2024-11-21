import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const ServicesSchema = z.object({
  tcpPort: z.number(),
  rabbitMQHosts: z.string().array(),
  coreHost: z.string(),
  alertHost: z.string(),
  filesHost: z.string(),
  accountsHost: z.string(),
  productsTMHost: z.string(),
});

export type ServicesSchemaType = z.infer<typeof ServicesSchema>;

export const servicesConfig = registerAs('services', () => {
  const secrets = {
    tcpPort: parseInt(process.env.SERVICE_TCP_PORT, 10),
    rabbitMQHosts: process.env.RABBIT_MQ_HOSTS.split(','),
    alertHost: process.env.ALERT_APP_HOST,
    coreHost: process.env.CORE_APP_HOST,
    filesHost: process.env.FILES_APP_HOST,
    accountsHost: process.env.ACCOUNTS_APP_HOST,
    productsTMHost: process.env.PRODUCTS_TM_APP_HOST,
  };

  return ServicesSchema.parse(secrets);
});
