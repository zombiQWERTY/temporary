import { Logger, Module } from '@nestjs/common';

import { AccountsService } from './accounts.service';
import { AccountsRestController } from './accounts.rest.controller';
import { PrismaService } from '../services/prisma.service';
import { AccountsTriggersService } from './accountsTriggers.service';
import { AccountsTcpController } from './accounts.tcp.controller';
import {
  createAuditLogServiceProvider,
  createCoreServiceProvider,
  createFilesServiceProvider,
  createProductsTMServiceProvider,
  createAlertServiceProvider,
  UserMetaService,
} from '@erp-modul/shared';
import { ProductsTmService as SCProductsTmService } from '@app/service-connector';
import { RatesModule } from '../rates/rates.module';
import { WalletNumberService } from '../services/wallet-number.service';

@Module({
  imports: [RatesModule],
  controllers: [AccountsRestController, AccountsTcpController],
  providers: [
    Logger,
    AccountsService,
    AccountsTriggersService,
    PrismaService,
    WalletNumberService,
    UserMetaService,
    SCProductsTmService,
    createProductsTMServiceProvider(),
    createCoreServiceProvider(),
    createAlertServiceProvider(),
    createFilesServiceProvider(),
    createAuditLogServiceProvider(),
  ],
})
export class AccountsModule {}
