import { Injectable } from '@nestjs/common';

import { PrismaService } from '../services/prisma.service';
import { AuditLog } from '@erp-modul/shared';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  putLog(dto: AuditLog.PutLogRequestDto) {
    return this.prisma.auditLog.create({ data: dto });
  }
}
