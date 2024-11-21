import { Provider } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { servicesConfig, ServicesSchemaType } from '@erp-modul/shared/configs';

export const FILES_SERVICE = 'FILES_SERVICE';

export function createFilesServiceProvider(): Provider<ClientProxy> {
  return {
    provide: FILES_SERVICE,
    useFactory: (services: ServicesSchemaType) => {
      return ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: services.filesHost,
          port: services.tcpPort,
        },
      });
    },
    inject: [servicesConfig.KEY],
  };
}
