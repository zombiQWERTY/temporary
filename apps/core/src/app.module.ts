import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig } from './config/app.config';
import { UsersModule } from './users/users.module';
import { servicesConfig } from '@erp-modul/shared';
import { secretsConfig } from './config/secrets.config';
import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { CountriesModule } from './countries/countries.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [secretsConfig, appConfig, servicesConfig],
      isGlobal: true,
      cache: true,
    }),
    AuthModule,
    BranchesModule,
    UsersModule,
    CountriesModule,
  ],
})
export class AppModule {}
