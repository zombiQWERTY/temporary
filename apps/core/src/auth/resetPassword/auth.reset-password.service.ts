import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { Prisma } from '../../../prisma/client';
import { AuthTriggersService } from '../auth.triggers.service';
import { AuthCommonService } from '../auth.common.service';
import { ResetPasswordResponseDto } from './dto/reset-password.response.dto';

@Injectable()
export class AuthResetPasswordService {
  constructor(
    private prisma: PrismaService,
    private authTriggersService: AuthTriggersService,
    private authCommonService: AuthCommonService,
  ) {}

  async resetPassword(
    where: Prisma.AuthWhereUniqueInput,
    method: 'sms' | 'email',
  ): Promise<ResetPasswordResponseDto> {
    const auth = await this.findAuthOrThrow(where);

    const identifier = method === 'sms' ? auth.phone : auth.email;

    return this.authCommonService.sendOtpCall({
      identifier,
      userId: auth.userId,
      type: 'RESET_PASSWORD',
      method,
    });
  }

  async confirmResetPassword(
    where: Prisma.AuthWhereUniqueInput,
    password: string,
    code: string,
    method: 'sms' | 'email',
  ): Promise<{ ok: boolean }> {
    const auth = await this.findAuthOrThrow(where);

    const identifier = method === 'sms' ? auth.phone : auth.email;

    await this.verifyOtpOrThrow({
      code,
      method,
      userId: auth.userId,
      identifier,
    });

    await this.updatePassword(auth.id, password);

    this.authTriggersService.postPasswordReset(auth, method);

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
      type: 'RESET_PASSWORD',
      userId,
      identifier,
    });

    if (!isConfirmed) {
      throw new BadRequestException(`Cannot confirm ${method}. Code not found`);
    }
  }

  private async updatePassword(
    authId: number,
    password: string,
  ): Promise<void> {
    const hashedPassword = await this.authCommonService.makePassword(password);

    await this.prisma.auth.update({
      where: { id: authId },
      data: { password: hashedPassword },
    });
  }
}
