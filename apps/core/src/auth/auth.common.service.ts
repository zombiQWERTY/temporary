import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

import { PasswordService } from '../services/password.service';
import { ALERT_SERVICE, RoleEnum } from '@erp-modul/shared';
import { PrismaService } from '../services/prisma.service';
import { Auth, Prisma, PrismaClient } from '../../prisma/client';

type PrismaTransactionalClient = Prisma.TransactionClient | PrismaClient;

@Injectable()
export class AuthCommonService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    @Inject(ALERT_SERVICE) private alertServiceClient: ClientProxy,
  ) {}

  async makePassword(password: string): Promise<string> {
    const salt = await this.passwordService.generateSalt();
    return this.passwordService.hashPassword(password, salt);
  }

  findCredentials(userId: number) {
    return this.prisma.auth.findUnique({
      where: {
        userId,
      },
      select: { email: true, phone: true },
    });
  }

  async assignRoles(
    tx: PrismaTransactionalClient,
    authId: number,
    roles: RoleEnum[],
  ) {
    const foundRoles = await tx.role.findMany({
      where: { slug: { in: roles } },
    });

    if (foundRoles.length === 0) {
      throw new BadRequestException('No roles found for the provided slugs');
    }

    await tx.rolesOnAuth.deleteMany({
      where: {
        authId,
      },
    });

    const roleAssociationsPromises = foundRoles.map((role) =>
      tx.rolesOnAuth.create({
        data: { authId, roleId: role.id },
      }),
    );

    await Promise.all(roleAssociationsPromises);
  }

  runInTransaction(tx: PrismaTransactionalClient) {
    return (cb: (tx: PrismaTransactionalClient) => Promise<Auth>) => cb(tx);
  }

  sendOtpCall({
    identifier,
    type,
    userId,
    method,
  }: {
    identifier: string;
    userId?: number;
    type: string;
    method: 'sms' | 'email';
  }): Promise<{ code: string; ttl: number }> {
    const command = method === 'sms' ? 'send_otp_by_sms' : 'send_otp_by_email';
    const payload =
      method === 'sms'
        ? { phone: identifier, type, userId }
        : { email: identifier, type, userId };

    return this.sendAlertCommand(command, payload);
  }

  verifyOtpCall({
    identifier,
    userId,
    method,
    code,
    type,
  }: {
    identifier: string;
    userId?: number;
    code: string;
    type: string;
    method: 'sms' | 'email';
  }): Promise<boolean> {
    const command =
      method === 'sms' ? 'verify_otp_by_sms' : 'verify_otp_by_email';
    const payload =
      method === 'sms'
        ? { phone: identifier, code, type, userId }
        : {
            email: identifier,
            code,
            type,
            userId,
          };

    return this.sendAlertCommand(command, payload);
  }

  private sendAlertCommand<T>(command: string, payload: any): Promise<T> {
    return firstValueFrom(
      this.alertServiceClient
        .send<T>({ cmd: command }, payload)
        .pipe(timeout(5000)),
    );
  }
}
