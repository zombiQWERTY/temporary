import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as R from 'ramda';
import { v4 as uuidv4 } from 'uuid';
import { ConfigType } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { addMilliseconds, getUnixTime } from 'date-fns';

import { PrismaService } from '../../services/prisma.service';
import { PasswordService } from '../../services/password.service';
import { Prisma, Role, UsersOnBranch } from '../../../prisma/client';
import { AuthTriggersService } from '../auth.triggers.service';
import { RoleEnum } from '@erp-modul/shared';
import { TokensResponseDto } from './dto/tokens.response.dto';
import { secretsConfig } from '../../config/secrets.config';

interface InternalTokenPayload {
  sub: number;
  mainRole: RoleEnum;
  mainBranchId: number | 'ALL';
  hostAuthId?: number;
  hostRole?: RoleEnum;
  hostBranchId?: number;
  userId: number;
  hostUserId?: number;
  expMs: StringValue;
  aud: 'access' | 'refresh';
  jti?: string;
}

type AuthWithRoles = Prisma.AuthGetPayload<typeof authWithRoles>;
export type EvolvedAuth = Omit<AuthWithRoles, 'password' | 'roles'> & {
  roles: Array<Role>;
  mainRole: RoleEnum;
};

const authWithRoles = Prisma.validator<Prisma.AuthDefaultArgs>()({
  include: {
    roles: {
      select: {
        role: true,
      },
      orderBy: {
        role: {
          weight: 'desc', // DO NOT EDIT
        },
      },
    },
  },
});

@Injectable()
export class AuthSignInService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private authTriggersService: AuthTriggersService,
    @Inject(secretsConfig.KEY)
    private secrets: ConfigType<typeof secretsConfig>,
  ) {}

  async login({
    target,
    identifier,
    loginMethod,
  }: {
    target: 'client' | 'admin';
    loginMethod: 'phone' | 'email';
    identifier: { phone?: string; email?: string; password: string };
  }): Promise<EvolvedAuth> {
    const auth = await this.findAuthWithRoles({
      phone: identifier.phone,
      email: identifier.email,
    });

    if (!auth) {
      throw new BadRequestException('Auth does not exist');
    }

    const passwordsMatch = await this.passwordService.verifyPassword(
      auth.password,
      identifier.password,
    );

    if (!passwordsMatch) {
      throw new BadRequestException('Incorrect password');
    }

    const evolvedAuth = this.transformAuth(auth);

    if (!target) {
      throw new BadRequestException('Invalid target');
    }

    const isClient = this.isClientRole(evolvedAuth.mainRole);

    const isValidTarget =
      (target === 'client' && isClient) || (target !== 'client' && !isClient);

    if (!isValidTarget) {
      throw new BadRequestException('Invalid role for target');
    }

    this.authTriggersService.postLogin(auth, loginMethod);

    return evolvedAuth;
  }

  makeTokens({
    roles,
    branches,
    ...params
  }: Omit<InternalTokenPayload, 'expMs' | 'aud'> & {
    roles: Role[];
    branches: UsersOnBranch[];
  }): TokensResponseDto {
    return {
      mainRole: params.mainRole,
      mainBranchId: params.mainBranchId,
      userId: params.userId,
      roles,
      branches,
      accessToken: this.createToken({
        ...params,
        expMs: this.secrets.accessTokenExp,
        aud: 'access',
      }),
      refreshToken: this.createToken({
        ...params,
        expMs: this.secrets.refreshTokenExp,
        aud: 'refresh',
      }),
    };
  }

  async selectRole(userId: number, role: RoleEnum): Promise<EvolvedAuth> {
    const auth = await this.findAuthWithRoles({
      userId,
    });

    if (!auth) {
      throw new BadRequestException('Auth does not exist');
    }

    if (!auth.roles.find((r) => r.role.slug === role)) {
      throw new BadRequestException('Role is not assigned');
    }

    return this.transformAuth(auth, role);
  }

  async proxyLogin(
    hostUserId: number,
    hostAuthRole: RoleEnum,
    proxyUserId: number,
  ): Promise<EvolvedAuth> {
    if (hostUserId === proxyUserId) {
      throw new BadRequestException('You cannot auth yourself');
    }

    // @TODO: add proxyAuthWeights; check for weights from host to proxy
    const auth = await this.findAuthWithRoles({
      userId: proxyUserId,
    });

    if (!auth) {
      throw new BadRequestException('Auth does not exist');
    }

    this.authTriggersService.postProxyLogin(auth, hostUserId, hostAuthRole);

    return this.transformAuth(auth);
  }

  async checkAuth(authId: number): Promise<EvolvedAuth> {
    const auth = await this.findAuthWithRoles({
      id: authId,
    });

    if (!auth) {
      throw new BadRequestException('Auth does not exist');
    }

    return this.transformAuth(auth);
  }

  private createToken({
    sub,
    mainRole,
    expMs,
    aud = 'access',
    jti = uuidv4(),
    ...params
  }: InternalTokenPayload) {
    return {
      ...params,
      sub: String(sub),
      roles: [mainRole],
      aud,
      jti,
      exp: this.addMillisecondsToCurrentDate(ms(expMs)),
    };
  }

  private addMillisecondsToCurrentDate(milliseconds: number): number {
    const currentDate = new Date();
    const newDate = addMilliseconds(currentDate, milliseconds);
    return getUnixTime(newDate);
  }

  private transformAuth(
    auth: AuthWithRoles,
    selectedRole?: RoleEnum,
  ): EvolvedAuth {
    const roles = auth.roles.map((r) => r.role);
    const mainRole = selectedRole || (roles?.[0]?.slug as RoleEnum);

    return R.pipe(
      R.omit(['password']),
      R.assoc('mainRole', mainRole),
      R.assoc('roles', roles),
    )(auth);
  }

  private isClientRole(role: RoleEnum): boolean {
    return [
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
      RoleEnum.Partner,
      RoleEnum.PartnerRepresentative,
    ].includes(role);
  }

  private findAuthWithRoles(where: Prisma.AuthWhereUniqueInput) {
    return this.prisma.auth.findUnique({
      where,
      ...authWithRoles,
    });
  }
}
