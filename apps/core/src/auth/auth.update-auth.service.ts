import { Injectable } from '@nestjs/common';

import { PrismaService } from '../services/prisma.service';
import { Auth, Prisma, PrismaClient } from '../../prisma/client';
import { RoleEnum } from '@erp-modul/shared';
import { AuthCommonService } from './auth.common.service';

type PrismaTransactionalClient = Prisma.TransactionClient | PrismaClient;

@Injectable()
export class UpdateAuthService {
  constructor(
    private prisma: PrismaService,
    private authCommonService: AuthCommonService,
  ) {}

  async updateAuthWithRole(params: {
    tx?: PrismaTransactionalClient;
    userId: number;
    phone: string;
    email: string;
    password: string;
    roles: RoleEnum[];
  }): Promise<Auth> {
    const transaction = this.authCommonService.runInTransaction(
      params.tx || this.prisma,
    );

    const hashedPassword = params.password
      ? await this.authCommonService.makePassword(params.password)
      : undefined;

    return transaction(async (tx: PrismaTransactionalClient) => {
      const updatedAuth = await tx.auth.update({
        where: { userId: params.userId },
        data: {
          phone: params.phone,
          email: params.email,
          password: hashedPassword,
          phoneConfirmed: true,
        },
      });

      await this.authCommonService.assignRoles(
        tx,
        updatedAuth.id,
        params.roles,
      );

      return updatedAuth;
    });
  }
}
