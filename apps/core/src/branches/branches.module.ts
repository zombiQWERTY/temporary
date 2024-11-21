import { Logger, Module } from '@nestjs/common';

import { BranchesService } from './branches.service';
import { BranchesRestController } from './branches.rest.controller';
import { PrismaService } from '../services/prisma.service';
import { UserMetaService } from '@erp-modul/shared';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [CountriesModule],
  controllers: [BranchesRestController],
  providers: [Logger, BranchesService, PrismaService, UserMetaService],
  exports: [BranchesService],
})
export class BranchesModule {}
