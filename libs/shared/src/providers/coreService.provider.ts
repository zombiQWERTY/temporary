import { Provider } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { servicesConfig, ServicesSchemaType } from '@erp-modul/shared/configs';

export const CORE_SERVICE = 'CORE_SERVICE';

export function createCoreServiceProvider(): Provider<ClientProxy> {
  return {
    provide: CORE_SERVICE,
    useFactory: (services: ServicesSchemaType) => {
      return ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: services.coreHost,
          port: services.tcpPort,
        },
      });
    },
    inject: [servicesConfig.KEY],
  };
}
