import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig } from './config/app.config';
import { AccountsModule } from './accounts/accounts.module';
import { servicesConfig } from '@erp-modul/shared';
import { RatesModule } from './rates/rates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, servicesConfig],
      isGlobal: true,
      cache: true,
    }),
    AccountsModule,
    RatesModule,
  ],
})
export class AppModule {}
