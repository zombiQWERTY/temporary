import { Provider } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { servicesConfig, ServicesSchemaType } from '@erp-modul/shared/configs';

export const PRODUCTS_TM_RMQ_SERVICE = 'PRODUCTS_TM_RMQ_SERVICE';
export const PRODUCTS_TM_RMQ_QUEUE_ACTIVATE_TRANSACTIONS =
  'PRODUCTS_TM_RMQ_QUEUE_ACTIVATE_TRANSACTIONS';

export function createProductsTMRMQServiceProvider(): Provider<ClientProxy> {
  return {
    provide: PRODUCTS_TM_RMQ_SERVICE,
    useFactory: (services: ServicesSchemaType) => {
      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: services.rabbitMQHosts,
          queue: PRODUCTS_TM_RMQ_QUEUE_ACTIVATE_TRANSACTIONS,
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
