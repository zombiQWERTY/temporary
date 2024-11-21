import { Provider } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { servicesConfig, ServicesSchemaType } from '@erp-modul/shared/configs';

export const ACCOUNTS_SERVICE = 'ACCOUNTS_SERVICE';

export function createAccountsServiceProvider(): Provider<ClientProxy> {
  return {
    provide: ACCOUNTS_SERVICE,
    useFactory: (services: ServicesSchemaType) => {
      return ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: services.accountsHost,
          port: services.tcpPort,
        },
      });
    },
    inject: [servicesConfig.KEY],
  };
}
