import { Provider } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { servicesConfig, ServicesSchemaType } from '@erp-modul/shared/configs';

export const AUDIT_LOG_SERVICE = 'AUDIT_LOG_SERVICE';

export function createAuditLogServiceProvider(): Provider<ClientProxy> {
  return {
    provide: AUDIT_LOG_SERVICE,
    useFactory: (services: ServicesSchemaType) => {
      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: services.rabbitMQHosts,
          queue: 'audit_log_queue',
          noAck: true,
          queueOptions: {
            durable: true,
          },
        },
      });
    },
    inject: [servicesConfig.KEY],
  };
}
