import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { Auth, Prisma } from '../../../prisma/client';
import { AuthTriggersService } from '../auth.triggers.service';
import { AuthCommonService } from '../auth.common.service';
import { ResetEmailResponseDto } from './dto/reset-email.response.dto';

@Injectable()
export class AuthResetEmailService {
  constructor(
    private prisma: PrismaService,
    private authTriggersService: AuthTriggersService,
    private authCommonService: AuthCommonService,
  ) {}

  async resetEmail(
    where: Prisma.AuthWhereUniqueInput,
  ): Promise<ResetEmailResponseDto> {
    const authExists = await this.findAuthOrThrow(where);

    return this.authCommonService.sendOtpCall({
      identifier: authExists.email,
      userId: authExists.userId,
      type: 'RESET_EMAIL',
      method: 'email',
    });
  }

  async confirmResetEmail(
    where: Prisma.AuthWhereUniqueInput,
    email: string,
    code: string,
  ): Promise<{ ok: boolean }> {
    const authExists = await this.findAuthOrThrow(where);

    await this.verifyOtpOrThrow({
      code,
      method: 'email',
      userId: authExists.userId,
      identifier: authExists.email,
    });

    const auth = await this.updateEmail(authExists.id, email);

    this.authTriggersService.postEmailReset(authExists, auth);

    return { ok: true };
  }

  private async findAuthOrThrow(where: Prisma.AuthWhereUniqueInput) {
    const auth = await this.prisma.auth.findUnique({ where });
    if (!auth) {
      throw new BadRequestException('Auth does not exist');
    }

    return auth;
  }

  private async verifyOtpOrThrow({
    code,
    method,
    userId,
    identifier,
  }: {
    code: string;
    method: 'sms' | 'email';
    userId: number;
    identifier: string;
  }): Promise<void> {
    const isConfirmed = await this.authCommonService.verifyOtpCall({
      code,
      method,
      type: 'RESET_EMAIL',
      userId,
      identifier,
    });

    if (!isConfirmed) {
      throw new BadRequestException(`Cannot confirm ${method}. Code not found`);
    }
  }

  private updateEmail(authId: number, email: string): Promise<Auth> {
    return this.prisma.auth.update({
      where: { id: authId },
      data: {
        email,
        emailConfirmed: true,
        emailConfirmedAt: new Date(),
      },
    });
  }
}
