import { Logger, Module } from '@nestjs/common';

import { RatesRestController } from './rates.rest.controller';
import { RatesService } from './rates.service';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [RatesRestController],
  providers: [Logger, RatesService, PrismaService],
  exports: [RatesService],
})
export class RatesModule {}
