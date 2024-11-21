import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../services/prisma.service';
import { Auth, Prisma, PrismaClient } from '../../../prisma/client';
import { AuthTriggersService } from '../auth.triggers.service';
import { RoleEnum } from '@erp-modul/shared';
import { CountriesService } from '../../countries/countries.service';
import { BranchesService } from '../../branches/branches.service';
import { AuthCommonService } from '../auth.common.service';
import { RegisterResponseDto } from './dto/register.response.dto';

type PrismaTransactionalClient = Prisma.TransactionClient | PrismaClient;

@Injectable()
export class AuthSignUpService {
  constructor(
    private prisma: PrismaService,
    private authCommonService: AuthCommonService,
    private authTriggersService: AuthTriggersService,
    private countriesService: CountriesService,
    private branchesService: BranchesService,
  ) {}

  async register(dto: {
    phone: string;
    email: string;
  }): Promise<RegisterResponseDto> {
    await this.checkAuthExists(dto);

    this.authTriggersService.postRegistration(dto);

    return this.authCommonService.sendOtpCall({
      identifier: dto.email,
      type: 'SIGN_UP',
      method: 'email',
    });
  }

  async confirmRegistered(args: {
    dto: { phone: string; email: string; password: string };
    inviteTags: {
      branchId: number | null;
      managerId: number | null;
      countryCode: string | null;
      lang: string | null;
    };
    utmTags: Prisma.UserSourceTrackingCreateWithoutUserInput;
    code: string;
    method: 'email' | 'sms';
  }): Promise<{ ok: boolean }> {
    const { dto, inviteTags, utmTags, code, method } = args;

    await this.checkAuthExists(dto);

    const isConfirmed = await this.authCommonService.verifyOtpCall({
      code,
      method,
      type: 'SIGN_UP',
      identifier: method === 'email' ? dto.email : dto.phone,
    });

    if (!isConfirmed) {
      throw new BadRequestException(`Cannot confirm ${method}. Code not found`);
    }

    const auth = await this.createAuthWithRole({
      dto,
      inviteTags,
      utmTags,
      roles: [RoleEnum.Client],
      byEmail: method === 'email',
      byPhone: method === 'sms',
    });

    this.postConfirmationTrigger(auth, method);
    return { ok: true };
  }

  private async checkAuthExists(dto: { phone: string; email: string }) {
    const authExists = await this.prisma.auth.findFirst({
      where: { OR: [{ phone: dto.phone }, { email: dto.email }] },
    });

    if (authExists) {
      throw new BadRequestException('Auth already exists', 'silent');
    }
  }

  private postConfirmationTrigger(auth: Auth, method: 'email' | 'sms') {
    const triggerMethod =
      method === 'email'
        ? 'postConfirmRegisteredEmail'
        : 'postConfirmRegisteredPhone';
    this.authTriggersService[triggerMethod](auth);
  }

  private async createAuthWithRole(params: {
    tx?: PrismaTransactionalClient;
    dto: { phone: string; email: string; password: string };
    inviteTags?: {
      branchId: number | null;
      managerId: number | null;
      countryCode: string | null;
      lang: string | null;
    };
    utmTags?: Prisma.UserSourceTrackingCreateWithoutUserInput;
    roles: RoleEnum[];
    byEmail?: boolean;
    byPhone?: boolean;
  }): Promise<Auth> {
    const transaction = this.authCommonService.runInTransaction(
      params.tx || this.prisma,
    );

    const hashedPassword = await this.authCommonService.makePassword(
      params.dto.password,
    );

    const [foundCountryIso] = this.countriesService.findCountryByCountryCode(
      params?.inviteTags?.countryCode,
    );

    return transaction(async (tx: PrismaTransactionalClient) => {
      const createdAuth = await tx.auth.create({
        data: this.buildAuthData(params, hashedPassword, foundCountryIso),
      });

      await this.authCommonService.assignRoles(
        tx,
        createdAuth.id,
        params.roles,
      );

      await this.branchesService.addUserToBranchesByParams({
        tx,
        userId: createdAuth.userId,
        roles: params.roles,
        branchId: params?.inviteTags?.branchId,
        countryCode: foundCountryIso,
      });

      return createdAuth;
    });
  }

  private buildAuthData(
    params: any,
    hashedPassword: string,
    foundCountryIso: string | undefined,
  ) {
    return {
      phone: params.dto.phone,
      email: params.dto.email,
      password: hashedPassword,
      emailConfirmed: params.byEmail ?? false,
      emailConfirmedAt: params.byEmail ? new Date() : undefined,
      // At this moment we do not need in phone confirmation. That's why we set it to true and with no date of confirmation
      phoneConfirmed: true,
      // phoneConfirmed: params.byPhone ?? false,
      // phoneConfirmedAt: params.byPhone ? new Date() : undefined,
      user: {
        create: {
          countryCode: foundCountryIso,
          lang: params?.inviteTags?.lang,
          managerId: params?.inviteTags?.managerId,
          sourceTracking: {
            create: { ...params.utmTags, ...params.inviteTags },
          },
        },
      },
    };
  }
}
