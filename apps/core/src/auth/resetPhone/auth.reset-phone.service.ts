import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { Auth, Prisma } from '../../../prisma/client';
import { AuthTriggersService } from '../auth.triggers.service';
import { AuthCommonService } from '../auth.common.service';
import { ResetPhoneResponseDto } from './dto/reset-phone.response.dto';

@Injectable()
export class AuthResetPhoneService {
  constructor(
    private prisma: PrismaService,
    private authTriggersService: AuthTriggersService,
    private authCommonService: AuthCommonService,
  ) {}

  async resetPhone(
    where: Prisma.AuthWhereUniqueInput,
  ): Promise<ResetPhoneResponseDto> {
    const authExists = await this.findAuthOrThrow(where);

    return this.authCommonService.sendOtpCall({
      identifier: authExists.phone,
      userId: authExists.userId,
      type: 'RESET_PHONE',
      method: 'sms',
    });
  }

  async confirmResetPhone(
    where: Prisma.AuthWhereUniqueInput,
    phone: string,
    code: string,
  ): Promise<{ ok: boolean }> {
    const authExists = await this.findAuthOrThrow(where);

    await this.verifyOtpOrThrow({
      code,
      method: 'sms',
      userId: authExists.userId,
      identifier: authExists.phone,
    });

    const auth = await this.updatePhone(authExists.id, phone);

    this.authTriggersService.postPhoneReset(authExists, auth);

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
      type: 'RESET_PHONE',
      userId,
      identifier,
    });

    if (!isConfirmed) {
      throw new BadRequestException(`Cannot confirm ${method}. Code not found`);
    }
  }

  private updatePhone(authId: number, phone: string): Promise<Auth> {
    return this.prisma.auth.update({
      where: { id: authId },
      data: {
        phone,
        phoneConfirmed: true,
        phoneConfirmedAt: new Date(),
      },
    });
  }
}
