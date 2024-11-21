import { Provider } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { servicesConfig, ServicesSchemaType } from '@erp-modul/shared/configs';

export const PRODUCTS_TM_SERVICE = 'PRODUCTS_TM_SERVICE';

export function createProductsTMServiceProvider(): Provider<ClientProxy> {
  return {
    provide: PRODUCTS_TM_SERVICE,
    useFactory: (services: ServicesSchemaType) => {
      return ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: services.productsTMHost,
          port: services.tcpPort,
        },
      });
    },
    inject: [servicesConfig.KEY],
  };
}
