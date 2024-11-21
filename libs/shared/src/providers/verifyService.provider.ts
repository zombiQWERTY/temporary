import { Provider } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { servicesConfig, ServicesSchemaType } from '@erp-modul/shared/configs';

export const ALERT_SERVICE = 'ALERT_SERVICE';

export function createAlertServiceProvider(): Provider<ClientProxy> {
  return {
    provide: ALERT_SERVICE,
    useFactory: (services: ServicesSchemaType) => {
      return ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          host: services.alertHost,
          port: services.tcpPort,
        },
      });
    },
    inject: [servicesConfig.KEY],
  };
}
