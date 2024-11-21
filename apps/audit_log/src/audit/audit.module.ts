import { Module } from '@nestjs/common';

import { AuditService } from './audit.service';
import { AuditRmqController } from './audit.rmq.controller';
import { PrismaService } from '../services/prisma.service';

@Module({
  controllers: [AuditRmqController],
  providers: [AuditService, PrismaService],
})
export class AuditModule {}
