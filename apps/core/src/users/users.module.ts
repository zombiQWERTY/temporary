import { Logger, Module } from '@nestjs/common';

import { UsersService } from './users.service';
import { UsersRestController } from './users.rest.controller';
import { PrismaService } from '../services/prisma.service';
import { UsersTriggersService } from './usersTriggers.service';
import {
  createAuditLogServiceProvider,
  UserMetaService,
  createFilesServiceProvider,
  createAccountsServiceProvider,
  createAlertServiceProvider,
} from '@erp-modul/shared';
import { AuthModule } from '../auth/auth.module';
import { BranchesModule } from '../branches/branches.module';
import { CountriesModule } from '../countries/countries.module';
import { PasswordService } from '../services/password.service';

@Module({
  imports: [AuthModule, BranchesModule, CountriesModule],
  controllers: [UsersRestController],
  providers: [
    Logger,
    UsersService,
    UsersTriggersService,
    PasswordService,
    PrismaService,
    UserMetaService,
    createAlertServiceProvider(),
    createAccountsServiceProvider(),
    createFilesServiceProvider(),
    createAuditLogServiceProvider(),
  ],
})
export class UsersModule {}
