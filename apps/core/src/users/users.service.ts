import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as R from 'ramda';
import { isEmpty, omit } from 'ramda';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { format } from 'date-fns';

import { PrismaService } from '../services/prisma.service';
import { UsersTriggersService } from './usersTriggers.service';
import { UpdateMyProfileRequestDto } from './request-dto/updateMyProfileRequest.dto';
import {
  AccountStatusEnum,
  DocumentTypeEnum,
  Location as ILocation,
  Passport as IPassport,
  EconomicProfile as IEconomicProfile,
  TaxPayerProfile as ITaxPayerProfile,
  Prisma,
  PrismaClient,
  User,
  VerificationStageEnum,
} from '../../prisma/client';
import {
  ACCOUNTS_SERVICE,
  FILES_SERVICE,
  omitDeep,
  RoleEnum,
  UserMetadataParams,
  ALERT_SERVICE,
} from '@erp-modul/shared';
import { CreateProfileRequestDto } from './request-dto/createProfileRequest.dto';
import { ProvidePassportToVerificationRequestDto } from './request-dto/providePassportToVerificationRequestDto';
import { ProvideLocationToVerificationRequestDto } from './request-dto/provideLocationToVerificationRequestDto';
import { UpdateAuthService } from '../auth/auth.update-auth.service';
import { BranchesService } from '../branches/branches.service';
import { CountriesService } from '../countries/countries.service';
import { ProvideEconomicToVerificationRequestDto } from './request-dto/provideEconomicToVerificationRequestDto';
import { ProvideTaxToVerificationRequestDto } from './request-dto/provideTaxToVerificationRequestDto';
import { ConfirmVerificationRequestDto } from './request-dto/confirmVerificationRequest.dto';
import { PasswordService } from '../services/password.service';
import { Country } from 'country-list-js';
import { Passport } from './request-dto/common/passportRequest.dto';
import { Location } from './request-dto/common/locationRequest.dto';
import { Economic } from './request-dto/common/economicRequest.dto';
import { Tax } from './request-dto/common/taxRequest.dto';

export const getUpdateValue = <T extends object>(
  isSelfUpdate: boolean,
  newValue: T | null,
  originalValue: T | null,
): T => {
  return isSelfUpdate ? originalValue : newValue || originalValue;
};

export const updateCountryCode =
  (
    key: string,
    serviceMethod: (code: string) => [string, Country] | [null, null],
  ) =>
  (input: any) => {
    return R.assoc(
      key,
      R.head(serviceMethod(R.prop(key, input) as string)),
      input,
    );
  };

export const constructUpsert = <R, T extends object>(data: T): R | object => {
  return data
    ? {
        upsert: {
          create: data,
          update: data,
        },
      }
    : {};
};

export const makePassport = ({
  isSelfUpdate = false,
  raw = false,
  passport,
  originalPassport,
  serviceMethod,
}: {
  isSelfUpdate?: boolean;
  raw?: boolean;
  passport: Passport;
  originalPassport: IPassport | object;
  serviceMethod: (code: string) => [string, Country] | [null, null];
}) => {
  const passportToUpdate = getUpdateValue<Prisma.PassportUpdateInput>(
    isSelfUpdate,
    passport,
    omit(['userId'], originalPassport as IPassport),
  );

  if (isEmpty(passportToUpdate)) {
    return undefined;
  }

  const updateCitizenshipCountryCode = updateCountryCode(
    'citizenshipCountryCode',
    serviceMethod,
  );

  const updateOriginCountryCode = updateCountryCode(
    'originCountryCode',
    serviceMethod,
  );

  const passportUpdater = R.compose(
    R.when(R.has('citizenshipCountryCode'), updateCitizenshipCountryCode),
    R.when(R.has('originCountryCode'), updateOriginCountryCode),
  );

  return raw
    ? { create: passportToUpdate }
    : constructUpsert<
        Prisma.PassportUpdateOneWithoutUserNestedInput,
        Prisma.PassportUpdateInput
      >(passportUpdater(passportToUpdate));
};

export const makeLocation = ({
  isSelfUpdate = false,
  raw = false,
  location,
  originalLocation,
  serviceMethod,
}: {
  isSelfUpdate?: boolean;
  raw?: boolean;
  location: Location;
  originalLocation: ILocation | object;
  serviceMethod: (code: string) => [string, Country] | [null, null];
}) => {
  const locationToUpdate = getUpdateValue<Prisma.LocationUpdateInput>(
    isSelfUpdate,
    location,
    omit(['userId'], originalLocation as ILocation),
  );

  if (isEmpty(locationToUpdate)) {
    return undefined;
  }

  const updateCountryOfResidenceCode = updateCountryCode(
    'countryOfResidenceCode',
    serviceMethod,
  );

  const locationUpdater = R.when(
    R.has('countryOfResidenceCode'),
    updateCountryOfResidenceCode,
  );

  return raw
    ? { create: locationToUpdate }
    : constructUpsert<
        Prisma.LocationUpdateOneWithoutUserNestedInput,
        Prisma.LocationUpdateInput
      >(locationUpdater(locationToUpdate));
};

export const makeTaxPayerProfile = ({
  isSelfUpdate = false,
  taxPayerProfile,
  originalTaxPayerProfile,
  serviceMethod,
}: {
  isSelfUpdate?: boolean;
  taxPayerProfile: Tax;
  originalTaxPayerProfile: ITaxPayerProfile | object;
  serviceMethod: (code: string) => [string, Country] | [null, null];
}) => {
  const taxPayerProfileToUpdate =
    getUpdateValue<Prisma.TaxPayerProfileUpdateInput>(
      isSelfUpdate,
      taxPayerProfile,
      omit(['userId'], originalTaxPayerProfile as ITaxPayerProfile),
    );

  if (isEmpty(taxPayerProfileToUpdate)) {
    return undefined;
  }

  const updateCountryOfResidenceCode = updateCountryCode(
    'taxResidency',
    serviceMethod,
  );

  const taxUpdater = R.when(
    R.has('taxResidency'),
    updateCountryOfResidenceCode,
  );

  return constructUpsert<
    Prisma.TaxPayerProfileUpdateOneWithoutUserNestedInput,
    Prisma.TaxPayerProfileUpdateInput
  >(taxUpdater(taxPayerProfileToUpdate));
};

export const makeEconomicProfile = ({
  isSelfUpdate = false,
  economicProfile,
  originalEconomicProfile,
}: {
  isSelfUpdate?: boolean;
  economicProfile: Economic;
  originalEconomicProfile: IEconomicProfile | object;
}) => {
  const economicProfileToUpdate =
    getUpdateValue<Prisma.EconomicProfileUpdateInput>(
      isSelfUpdate,
      economicProfile,
      omit(['userId'], originalEconomicProfile as IEconomicProfile),
    );

  if (isEmpty(economicProfileToUpdate)) {
    return undefined;
  }

  return constructUpsert<
    Prisma.EconomicProfileUpdateOneWithoutUserNestedInput,
    Prisma.EconomicProfileUpdateInput
  >(economicProfileToUpdate);
};

type PrismaTransactionalClient = Prisma.TransactionClient | PrismaClient;

@Injectable()
export class UsersService {
  private createUserRolePermissions: Record<string, RoleEnum[] | '*'> = {
    [RoleEnum.Admin]: '*',
    [RoleEnum.BranchManager]: [RoleEnum.Client, RoleEnum.ClientRepresentative],
    [RoleEnum.HeadOfBranch]: [
      RoleEnum.BranchManager,
      RoleEnum.HeadOfBranch,
      RoleEnum.ComplianceManager,
      RoleEnum.SalesManager,
      RoleEnum.HeadOfSales,
      RoleEnum.SeniorSalesManager,
      RoleEnum.Trustee,
      RoleEnum.FinancialAnalyst,
      RoleEnum.Accountant,
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
    ],
    [RoleEnum.ComplianceManager]: [
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
    ],
    [RoleEnum.HeadOfSales]: [
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
      RoleEnum.SeniorSalesManager,
      RoleEnum.SalesManager,
    ],
    [RoleEnum.SeniorSalesManager]: [
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
      RoleEnum.SalesManager,
    ],
    [RoleEnum.SalesManager]: [RoleEnum.Client, RoleEnum.ClientRepresentative],
  };

  private updateUserRolePermissions: Record<string, RoleEnum[] | '*'> = {
    [RoleEnum.Admin]: '*',
    [RoleEnum.BranchManager]: [RoleEnum.Client, RoleEnum.ClientRepresentative],
    [RoleEnum.HeadOfBranch]: [
      RoleEnum.HeadOfBranch,
      RoleEnum.BranchManager,
      RoleEnum.ComplianceManager,
      RoleEnum.SalesManager,
      RoleEnum.HeadOfSales,
      RoleEnum.SeniorSalesManager,
      RoleEnum.Trustee,
      RoleEnum.FinancialAnalyst,
      RoleEnum.Accountant,
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
    ],
    [RoleEnum.ComplianceManager]: [
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
    ],
    [RoleEnum.HeadOfSales]: [
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
      RoleEnum.SeniorSalesManager,
      RoleEnum.SalesManager,
    ],
    [RoleEnum.SeniorSalesManager]: [
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
      RoleEnum.SalesManager,
    ],
    [RoleEnum.SalesManager]: [RoleEnum.Client, RoleEnum.ClientRepresentative],
  };

  private readUserRolePermissions: Record<string, RoleEnum[] | '*'> = {
    [RoleEnum.Admin]: '*',
    [RoleEnum.BranchManager]: [RoleEnum.Client, RoleEnum.ClientRepresentative],
    [RoleEnum.HeadOfBranch]: [
      RoleEnum.HeadOfBranch,
      RoleEnum.BranchManager,
      RoleEnum.ComplianceManager,
      RoleEnum.SalesManager,
      RoleEnum.HeadOfSales,
      RoleEnum.SeniorSalesManager,
      RoleEnum.Trustee,
      RoleEnum.FinancialAnalyst,
      RoleEnum.Accountant,
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
    ],
    [RoleEnum.ComplianceManager]: [
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
    ],
    [RoleEnum.HeadOfSales]: [
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
      RoleEnum.SeniorSalesManager,
      RoleEnum.SalesManager,
    ],
    [RoleEnum.SeniorSalesManager]: [
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
      RoleEnum.SalesManager,
    ],
    [RoleEnum.SalesManager]: [RoleEnum.Client, RoleEnum.ClientRepresentative],
    [RoleEnum.Accountant]: [RoleEnum.Client, RoleEnum.ClientRepresentative],
  };

  private readUserListRolePermissions: Record<string, RoleEnum[] | '*'> = {
    [RoleEnum.Admin]: '*',
    [RoleEnum.BranchManager]: [RoleEnum.Client, RoleEnum.ClientRepresentative],
    [RoleEnum.HeadOfBranch]: [
      RoleEnum.HeadOfBranch,
      RoleEnum.BranchManager,
      RoleEnum.ComplianceManager,
      RoleEnum.SalesManager,
      RoleEnum.HeadOfSales,
      RoleEnum.SeniorSalesManager,
      RoleEnum.Trustee,
      RoleEnum.FinancialAnalyst,
      RoleEnum.Accountant,
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
    ],
    [RoleEnum.ComplianceManager]: [
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
    ],
    [RoleEnum.HeadOfSales]: [
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
      RoleEnum.SeniorSalesManager,
      RoleEnum.SalesManager,
    ],
    [RoleEnum.SeniorSalesManager]: [
      RoleEnum.Client,
      RoleEnum.ClientRepresentative,
      RoleEnum.SalesManager,
    ],
    [RoleEnum.SalesManager]: [RoleEnum.Client, RoleEnum.ClientRepresentative],
    [RoleEnum.Accountant]: [RoleEnum.Client, RoleEnum.ClientRepresentative],
  };

  private logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private usersTriggersService: UsersTriggersService,
    private updateAuthService: UpdateAuthService,
    private branchesService: BranchesService,
    private passwordService: PasswordService,
    private countriesService: CountriesService,
    @Inject(FILES_SERVICE) private filesServiceClient: ClientProxy,
    @Inject(ACCOUNTS_SERVICE) private accountsServiceClient: ClientProxy,
    @Inject(ALERT_SERVICE) private alertServiceClient: ClientProxy,
  ) {}

  async throwErrorIfNotVerified(userId: number, role: RoleEnum) {
    if (![RoleEnum.Client, RoleEnum.ClientRepresentative].includes(role)) {
      return {};
    }

    const userProfile = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (userProfile.accountStatus !== AccountStatusEnum.Verified) {
      throw new BadRequestException('Client must be verified');
    }

    return {};
  }

  async getUserProfile(meta: UserMetadataParams, recipientId: number) {
    const isSelfGet = meta.userId === recipientId;

    const userProfile = await this.prisma.user.findUnique({
      where: {
        id: recipientId,
      },
      include: {
        auth: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
        branches: {
          include: {
            branch: true,
          },
        },
        passport: true,
        location: true,
        economicProfile: true,
        taxPayerProfile: true,
        documents: {
          select: {
            fileId: true,
            type: true,
          },
        },
      },
    });

    if (!isSelfGet) {
      this.checkBranchAndRoleRequirements({
        rolePermissions: this.readUserRolePermissions,
        meta,
        branches: userProfile.branches.map((b) => ({
          branchId: b.branchId,
          role: b.userRole as RoleEnum,
        })),
      });
    }

    if (!userProfile) {
      throw new BadRequestException('User does not exist');
    }

    return omitDeep(userProfile, ['password']);
  }

  async internalUserProfile(id: number) {
    const authProfile = await this.prisma.auth.findUnique({
      where: {
        userId: id,
      },
      select: { email: true, phone: true },
    });

    if (!authProfile) {
      throw new BadRequestException('User does not exist');
    }

    return authProfile;
  }

  async getProfilesList({
    // take = 20,
    ...params
  }: {
    meta: UserMetadataParams;
    targetRole: RoleEnum;
    skip: number;
    take: number;
  }): Promise<Omit<User, 'authId' | 'updatedAt'>[]> {
    if (!params.targetRole) {
      throw new BadRequestException('Target role is required');
    }

    this.checkRolePermissions(this.readUserListRolePermissions, {
      role: params.meta.role,
      targetRoles: [params.targetRole],
    });

    const records = await this.prisma.user.findMany({
      // skip: params.skip,
      // take,
      where: {
        branches:
          params.meta.role !== RoleEnum.Admin
            ? {
                some: {
                  branchId: params.meta.branchId,
                },
              }
            : undefined,
        auth: {
          roles: {
            some: {
              role: {
                slug: params.targetRole,
              },
            },
          },
        },
      },
      include: {
        branches: {
          include: {
            branch: true,
          },
        },
        auth: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!records?.length) {
      return [];
    }

    return records.map((r) => omitDeep(r, ['password']));
  }

  async getClientsList({
    // take = 20,
    ...params
  }: {
    meta: UserMetadataParams;
    skip: number;
    take: number;
  }): Promise<Omit<User, 'authId' | 'updatedAt'>[]> {
    const desiredAccountStatus =
      params.meta.role === RoleEnum.Accountant
        ? AccountStatusEnum.Verified
        : undefined;

    const everyBranch =
      params.meta.role === RoleEnum.Admin ||
      params.meta.role === RoleEnum.HeadOfSales ||
      params.meta.role === RoleEnum.ComplianceManager;

    const desiredBranch = everyBranch
      ? undefined
      : {
          some: {
            branchId: params.meta.branchId,
          },
        };

    // If salesManager then only his client or without attached manager
    const desiredManager =
      params.meta.role === RoleEnum.SalesManager
        ? { in: [params.meta.userId, null] }
        : undefined;

    const records = await this.prisma.user.findMany({
      // skip: params.skip,
      // take,
      where: {
        accountStatus: desiredAccountStatus,
        auth: {
          roles: {
            some: {
              role: {
                slug: { in: [RoleEnum.Client, RoleEnum.ClientRepresentative] },
              },
            },
          },
        },
        branches: desiredBranch,
        managerId: desiredManager,
      },
      include: {
        passport: true,
        location: true,
        branches: {
          include: {
            branch: true,
          },
        },
        auth: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!records?.length) {
      return [];
    }

    return records.map((r) => omitDeep(r, ['password']));
  }

  async updateUserProfile(
    meta: UserMetadataParams,
    recipientId: number,
    {
      passport,
      location,
      economicProfile,
      taxPayerProfile,
      roles,
      branches,
      phone,
      email,
      password,
      ...data
    }: UpdateMyProfileRequestDto,
  ): Promise<User> {
    const isSelfUpdate = meta.userId === recipientId;

    let filteredBranches: { branchId: number; role: RoleEnum }[] = [];

    const shouldCheckPermissions =
      !isSelfUpdate || meta.role === RoleEnum.Admin;

    if (shouldCheckPermissions) {
      this.checkRolePermissions(this.updateUserRolePermissions, {
        role: meta.role,
        targetRoles: roles || [],
      });

      filteredBranches = this.checkBranchAndRoleRequirements({
        rolePermissions: this.updateUserRolePermissions,
        meta,
        branches: branches || [],
        roles: roles || [],
      });
    }

    const [updated, original] = await this.prisma.$transaction(async (tx) => {
      const original = await tx.user.findUnique({
        where: { id: recipientId },
        include: {
          passport: true,
          location: true,
          economicProfile: true,
          taxPayerProfile: true,
        },
      });

      if (!original) {
        throw new BadRequestException('User not found');
      }

      if (
        original.accountStatus === AccountStatusEnum.Verified &&
        meta.role.toLowerCase().includes('sales')
      ) {
        throw new BadRequestException('Read only');
      }

      if (!isSelfUpdate && roles.length) {
        await this.updateAuthService.updateAuthWithRole({
          tx,
          userId: recipientId,
          roles,
          phone,
          password,
          email,
        });
      }

      const updated = await tx.user.update({
        where: {
          id: recipientId,
        },
        include: { passport: true, location: true },
        data: {
          ...data,
          needDataVerification: Boolean(passport || location),
          passport: makePassport({
            isSelfUpdate: false,
            passport,
            originalPassport: original.passport,
            serviceMethod: this.countriesService.findCountryByCountryCode,
          }),
          location: makeLocation({
            isSelfUpdate: false,
            location,
            originalLocation: original.location,
            serviceMethod: this.countriesService.findCountryByCountryCode,
          }),
          economicProfile: makeEconomicProfile({
            isSelfUpdate: false,
            economicProfile,
            originalEconomicProfile: original.economicProfile,
          }),
          taxPayerProfile: makeTaxPayerProfile({
            isSelfUpdate: false,
            taxPayerProfile,
            originalTaxPayerProfile: original.taxPayerProfile,
            serviceMethod: this.countriesService.findCountryByCountryCode,
          }),
        },
      });

      if (filteredBranches?.length && !isSelfUpdate) {
        await this.branchesService.addUserToBranches({
          tx,
          userId: updated.id,
          branches: filteredBranches,
        });
      }

      return [updated, original];
    });

    if (isSelfUpdate) {
      this.usersTriggersService.postUpdateSelfUser({ original, updated });
    } else {
      this.usersTriggersService.postUpdateUser({ original, updated });
    }

    return omitDeep(updated, ['password']);
  }

  checkBranchAndRoleRequirements(params: {
    rolePermissions: Record<string, RoleEnum[] | '*'>;
    meta: UserMetadataParams;
    branches: { branchId: number; role: RoleEnum }[];
    roles?: RoleEnum[];
  }) {
    const filteredBranches = params.branches?.filter(
      (b) => b.role !== RoleEnum.Admin, // && b.role !== RoleEnum.HeadOfBranch,
    );

    const filteredRoles = params.roles
      ? params.roles.filter(
          (r) => r !== RoleEnum.Admin, // && r !== RoleEnum.HeadOfBranch,
        )
      : undefined;

    // if (!filteredBranches?.length && params.meta.role !== RoleEnum.Admin) {
    //   throw new BadRequestException('Branch must be specified');
    // }

    if (filteredBranches?.length) {
      const rolesFromBranches = filteredBranches.map((b) => b.role);

      this.checkRolePermissions(params.rolePermissions, {
        role: params.meta.role,
        targetRoles: rolesFromBranches,
      });

      this.checkBranchesPermissions({
        role: params.meta.role,
        targetRoles: filteredRoles,
        branchId: params.meta.branchId,
        targetBranches: filteredBranches,
      });
    }

    return filteredBranches;
  }

  async createUserProfile(
    meta: UserMetadataParams,
    {
      passport,
      location,
      roles,
      phone,
      email,
      password,
      branches,
      ...data
    }: CreateProfileRequestDto,
  ) {
    const authExists = await this.prisma.auth.findFirst({
      where: {
        OR: [{ phone: phone }, { email: email }],
      },
    });

    if (authExists) {
      throw new BadRequestException('Auth already exists');
    }

    this.checkRolePermissions(this.createUserRolePermissions, {
      role: meta.role,
      targetRoles: roles,
    });

    const filteredBranches = this.checkBranchAndRoleRequirements({
      rolePermissions: this.createUserRolePermissions,
      meta,
      branches,
      roles,
    });

    const created = await this.prisma.$transaction(async (tx) => {
      const foundRoles = await tx.role.findMany({
        where: {
          slug: {
            in: roles,
          },
        },
      });

      const hashedPassword = await this.makePassword(password);

      const created = await tx.user.create({
        data: {
          ...data,
          createdById: meta.userId,
          needDataVerification: true,
          passport: makePassport({
            raw: true,
            isSelfUpdate: false,
            passport,
            originalPassport: {},
            serviceMethod: this.countriesService.findCountryByCountryCode,
          }),
          location: makeLocation({
            raw: true,
            isSelfUpdate: false,
            location,
            originalLocation: {},
            serviceMethod: this.countriesService.findCountryByCountryCode,
          }),
          auth: {
            create: {
              phone,
              email,
              password: hashedPassword,
              roles: {
                createMany: {
                  data: foundRoles.map((r) => ({ roleId: r.id })),
                },
              },
            },
          },
        },
      });

      if (filteredBranches?.length) {
        await this.branchesService.addUserToBranches({
          tx,
          userId: created.id,
          branches: filteredBranches,
        });
      }

      return created;
    });

    this.usersTriggersService.postCreateUser({
      user: created,
      roles,
      branches,
    });

    return { ok: true };
  }

  async makePassword(password: string): Promise<string> {
    const salt = await this.passwordService.generateSalt();
    return this.passwordService.hashPassword(password, salt);
  }

  async changeAccountStatus(params: {
    tx?: PrismaTransactionalClient;
    userId: number;
    branchId: number;
    managerId: number;
    status: AccountStatusEnum;
    failReason?: string;
    role: RoleEnum;
  }) {
    const transaction = params.tx
      ? (cb: (tx: PrismaTransactionalClient) => Promise<User>) => cb(params.tx)
      : (cb: (tx: PrismaTransactionalClient) => Promise<User>) =>
          this.prisma.$transaction((tx) => cb(tx));

    if (params.role !== RoleEnum.Admin && !params.branchId) {
      throw new BadRequestException('Branch must be specified');
    }

    return transaction(async (tx) => {
      const original = await tx.user.findUnique({
        where: {
          id: params.userId,
          // branches:
          //   params.role !== RoleEnum.Admin
          //     ? {
          //         some: {
          //           branch: {
          //             id: params.branchId,
          //           },
          //         },
          //       }
          //     : undefined,
        },
        include: {
          auth: true,
        },
      });

      if (!original) {
        throw new BadRequestException('User not found');
      }

      const isUnconfirmed =
        params.status === AccountStatusEnum.Registered ||
        params.status === AccountStatusEnum.VerificationInProgress;

      const dataIfNotVerified = isUnconfirmed
        ? {
            needDataVerification: false,
            agreedToApplicationTerms: false,
            agreedToApplicationTermsDate: null,
            agreedToServiceGeneralRules: false,
            agreedToServiceGeneralRulesDate: null,
            agreedToClaimsRegistrationRules: false,
            agreedToClaimsRegistrationRulesDate: null,
            agreedToMarginTradesRules: false,
            agreedToMarginTradesRulesDate: null,
            verificationFailedReason: params.failReason,
            verificationStage:
              original.accountStatus !== AccountStatusEnum.Verified
                ? VerificationStageEnum.Passport
                : undefined,
          }
        : {};

      const updated = await tx.user.update({
        where: {
          id: params.userId,
        },
        data: {
          accountStatus: params.status,
          verifiedBy: { connect: { id: params.managerId } },
          needDataVerification: false,
          verificationFailedReason: null,
          ...dataIfNotVerified,
        },
      });

      if (isUnconfirmed) {
        await this.sendRawEmail(
          original.auth.email,
          'Account verification failed',
          `Account verification failed with reason: ${params.failReason || 'N/A'}`,
          { fromBackoffice: true },
        );
      }

      if (params.status === AccountStatusEnum.Verified) {
        await this.createInitialAccount(params.userId);
        try {
          const verificationMeta = await this.verificationMeta(original.id);
          await this.sendRawEmail(
            original.auth.email,
            'Account verified successfully',
            `You can download your agreement by this link: ${verificationMeta.applicationFormForNaturalPersons}`,
            { fromBackoffice: true },
          );
        } catch (e) {
          this.logger.error(e);
        }
      }

      this.usersTriggersService.postChangeAccountStatus({ original, updated });

      return updated;
    });
  }

  async assignClientToSalesManager(params: {
    tx?: PrismaTransactionalClient;
    userId: number;
    managerId: number;
    branchId: number;
    initiatorId: number;
  }) {
    const transaction = params.tx
      ? (cb: (tx: PrismaTransactionalClient) => Promise<any>) => cb(params.tx)
      : (cb: (tx: PrismaTransactionalClient) => Promise<any>) =>
          this.prisma.$transaction((tx) => cb(tx));

    if (!params.userId || !params.managerId || !params.branchId) {
      throw new BadRequestException('Data must be valid');
    }

    return transaction(async (tx) => {
      const originalInitiator = await tx.user.findUnique({
        where: {
          id: params.initiatorId,
          branches: {
            some: {
              branch: {
                id: params.branchId,
              },
            },
          },
        },
      });

      if (!originalInitiator) {
        throw new BadRequestException(
          'You can access users only in your branch',
        );
      }

      const original = await tx.user.findUnique({
        where: {
          id: params.userId,
          branches: {
            some: {
              branch: {
                id: params.branchId,
              },
            },
          },
        },
      });

      if (!original) {
        throw new BadRequestException('User not found');
      }

      const originalManager = await tx.user.findUnique({
        where: {
          id: params.managerId,
          branches: {
            some: {
              branch: {
                id: params.branchId,
              },
            },
          },
          auth: {
            roles: {
              some: {
                role: {
                  slug: RoleEnum.SalesManager,
                },
              },
            },
          },
        },
      });

      if (!originalManager) {
        throw new BadRequestException('Manager not found');
      }

      return tx.user.update({
        where: {
          id: params.userId,
        },
        data: {
          managerId: params.managerId,
        },
      });
    });
  }

  async providePassportToVerification(
    userId: number,
    {
      firstPackFileIds,
      secondPackFileIds,
      ...dto
    }: ProvidePassportToVerificationRequestDto,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const originalUser = await tx.user.findUnique({
        where: {
          id: userId,
        },
        select: { accountStatus: true, verificationStage: true },
      });

      const newAccountStatus =
        originalUser.accountStatus !== AccountStatusEnum.Verified
          ? AccountStatusEnum.VerificationInProgress
          : undefined;

      const newVerificationStage =
        originalUser.verificationStage !== VerificationStageEnum.Contract
          ? VerificationStageEnum.Residence
          : undefined;

      const firstPack = firstPackFileIds.map((fileId) => ({
        fileId,
        userId,
        type: DocumentTypeEnum.IdentityFirstPack,
      }));

      const secondPack = secondPackFileIds.map((fileId) => ({
        fileId,
        userId,
        type: DocumentTypeEnum.IdentitySecondPack,
      }));

      await tx.document.createMany({
        data: [...firstPack, ...secondPack],
      });

      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { auth: true },
      });

      const [countryCode] = this.countriesService.findCountryByCountryCode(
        dto.citizenshipCountryCode,
      );

      const roles = await tx.rolesOnAuth.findMany({
        where: { authId: user.auth.id },
        include: { role: true },
      });

      await this.branchesService.addUserToBranchesByParams({
        tx,
        userId,
        countryCode,
        roles: roles.map((r) => r.role.slug) as RoleEnum[],
      });

      await tx.passport.deleteMany({
        where: {
          userId,
        },
      });

      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          countryCode,
          needDataVerification: true,
          verificationStage: newVerificationStage,
          accountStatus: newAccountStatus,
          passport: makePassport({
            isSelfUpdate: false,
            passport: dto,
            originalPassport: {},
            serviceMethod: this.countriesService.findCountryByCountryCode,
          }),
        },
      });
    });

    return { ok: true };
  }

  async provideLocationToVerification(
    userId: number,
    { fileIds, ...dto }: ProvideLocationToVerificationRequestDto,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const originalUser = await tx.user.findUnique({
        where: {
          id: userId,
        },
        select: { accountStatus: true, verificationStage: true },
      });

      const newAccountStatus =
        originalUser.accountStatus !== AccountStatusEnum.Verified
          ? AccountStatusEnum.VerificationInProgress
          : undefined;

      const newVerificationStage =
        originalUser.verificationStage !== VerificationStageEnum.Contract
          ? VerificationStageEnum.Economic
          : undefined;

      await tx.document.createMany({
        data: fileIds.map((fileId) => ({
          fileId,
          userId,
          type: DocumentTypeEnum.Location,
        })),
      });

      await tx.location.deleteMany({
        where: {
          userId,
        },
      });

      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          needDataVerification: true,
          verificationStage: newVerificationStage,
          accountStatus: newAccountStatus,
          location: makeLocation({
            isSelfUpdate: false,
            location: dto,
            originalLocation: {},
            serviceMethod: this.countriesService.findCountryByCountryCode,
          }),
        },
      });
    });

    return { ok: true };
  }

  async provideTaxToVerification(
    userId: number,
    { fileIds, ...dto }: ProvideTaxToVerificationRequestDto,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const originalUser = await tx.user.findUnique({
        where: {
          id: userId,
        },
        select: { accountStatus: true, verificationStage: true },
      });

      const newAccountStatus =
        originalUser.accountStatus !== AccountStatusEnum.Verified
          ? AccountStatusEnum.VerificationInProgress
          : undefined;

      const newVerificationStage =
        originalUser.verificationStage !== VerificationStageEnum.Contract
          ? VerificationStageEnum.Contract
          : undefined;

      await tx.document.createMany({
        data: fileIds.map((fileId) => ({
          fileId,
          userId,
          type: DocumentTypeEnum.Other,
        })),
      });

      await tx.taxPayerProfile.deleteMany({
        where: {
          userId,
        },
      });

      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          accountStatus: newAccountStatus,
          verificationStage: newVerificationStage,
          needDataVerification: true,
          taxPayerProfile: {
            create: dto,
          },
        },
      });
    });

    return { ok: true };
  }

  async provideExtraToVerification(userId: number, fileIds: number[]) {
    await this.prisma.$transaction(async (tx) => {
      const originalUser = await tx.user.findUnique({
        where: {
          id: userId,
        },
        select: { accountStatus: true },
      });

      const newAccountStatus =
        originalUser.accountStatus !== AccountStatusEnum.Verified
          ? AccountStatusEnum.VerificationInProgress
          : undefined;

      await tx.document.createMany({
        data: fileIds.map((fileId) => ({
          fileId,
          userId,
          type: DocumentTypeEnum.Other,
        })),
      });

      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          accountStatus: newAccountStatus,
          needDataVerification: true,
        },
      });
    });

    return { ok: true };
  }

  async provideEconomicToVerification(
    userId: number,
    { fileIds, ...dto }: ProvideEconomicToVerificationRequestDto,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const originalUser = await tx.user.findUnique({
        where: {
          id: userId,
        },
        select: { accountStatus: true, verificationStage: true },
      });

      const newAccountStatus =
        originalUser.accountStatus !== AccountStatusEnum.Verified
          ? AccountStatusEnum.VerificationInProgress
          : undefined;

      const newVerificationStage =
        originalUser.verificationStage !== VerificationStageEnum.Contract
          ? VerificationStageEnum.Taxpayer
          : undefined;

      await tx.document.createMany({
        data: fileIds.map((fileId) => ({
          fileId,
          userId,
          type: DocumentTypeEnum.Economic,
        })),
      });

      await tx.economicProfile.deleteMany({
        where: {
          userId,
        },
      });

      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          accountStatus: newAccountStatus,
          verificationStage: newVerificationStage,
          needDataVerification: true,
          economicProfile: {
            create: dto,
          },
        },
      });
    });

    return { ok: true };
  }

  async confirmVerification(
    userId: number,
    dto: ConfirmVerificationRequestDto,
  ) {
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: {
          id: userId,
        },
        include: {
          auth: true,
        },
        data: {
          needDataVerification: true,
          agreedToApplicationTerms: dto.agreedToApplicationTerms,
          agreedToApplicationTermsDate: now,

          agreedToServiceGeneralRules: dto.agreedToServiceGeneralRules,
          agreedToServiceGeneralRulesDate: now,

          agreedToClaimsRegistrationRules: dto.agreedToClaimsRegistrationRules,
          agreedToClaimsRegistrationRulesDate: now,

          agreedToMarginTradesRules: dto.agreedToMarginTradesRules,
          agreedToMarginTradesRulesDate: now,
          // verificationStage: VerificationStageEnum.Passport,
        },
      });

      const isConfirmed = await this.confirmCodeFromEmail(
        updated.auth.email,
        userId,
        dto.code,
        'SIGN_VERIFICATION_DOCUMENTS',
      );

      if (!isConfirmed) {
        throw new BadRequestException('Can not confirm data. Code not found');
      }
    });

    return { ok: true };
  }

  async verificationMeta(userId: number) {
    const url = await this.prisma.$transaction(async (tx) => {
      const document = await tx.document.findFirst({
        where: {
          userId,
          type: DocumentTypeEnum.ApplicationFormForNaturalPersons,
        },
      });

      if (document) {
        const doc = await this.getFilesUrls([document.fileId]);
        return doc?.[0]?.url;
      }

      const economicProfile = await tx.economicProfile.findUnique({
        where: { userId },
      });

      const taxPayerProfile = await tx.taxPayerProfile.findUnique({
        where: { userId },
      });

      const passport = await tx.passport.findUnique({ where: { userId } });
      const location = await tx.location.findUnique({ where: { userId } });
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { auth: true },
      });

      const [, citizenShipCountry] = passport?.citizenshipCountryCode
        ? this.countriesService.findCountryByCountryCode(
            passport.citizenshipCountryCode,
          )
        : [null, null];

      const [, locationCountry] = location?.countryOfResidenceCode
        ? this.countriesService.findCountryByCountryCode(
            location.countryOfResidenceCode,
          )
        : [null, null];

      const data = {
        clientId: String(userId),
        firstName: user?.firstName || 'N/A',
        lastName: user?.lastName || 'N/A',
        citizenShip: citizenShipCountry?.name,
        placeOfBirth: passport?.placeOfBirth,
        dateOfBirth: user?.birthdate
          ? format(user.birthdate, 'MM/dd/yyyy')
          : 'N/A',
        passportNumber: passport.documentNumber,
        passportIssuedAt: passport?.authorityDate
          ? format(passport?.authorityDate, 'MM/dd/yyyy')
          : 'N/A',
        address: [
          locationCountry?.name,
          location?.zipCode,
          location?.region,
          location?.city,
          location?.street,
          location?.streetNo,
          location?.flatNo,
        ].join(', '),
        phone: user.auth.phone,
        email: user.auth.email,
        taxNumber: taxPayerProfile?.individualTaxpayerNumber,
        assignDate: format(new Date(), 'MM/dd/yyyy'),
        marketExperience: economicProfile?.marketExperience,
        investedInstruments: economicProfile?.investedInstruments
          ? economicProfile?.investedInstruments.join(', ')
          : 'N/A',
        investmentDuration: economicProfile?.investmentDuration,
        educationLevel: economicProfile?.educationLevel,
        investmentGoals: economicProfile?.investmentGoals,
        tradeFrequency: economicProfile?.tradeFrequency,
        expectedTurnover: economicProfile?.expectedTurnover,
        sourceOfFunds: economicProfile?.sourceOfFunds
          ? economicProfile?.sourceOfFunds.join(', ')
          : 'N/A',
        annualIncome: economicProfile?.annualIncome,
        initialInvestment: economicProfile?.initialInvestment,
        totalAssetValue: economicProfile?.totalAssetValue,
        employerNameAddress: economicProfile?.employerNameAddress,
        industrySector: economicProfile?.industrySector,
        fundTransferOrigin: economicProfile?.fundTransferOrigin,
        expectedTransferDestination:
          economicProfile?.expectedTransferDestination,
        politicallyExposed: economicProfile?.politicallyExposed,
        usaResident: taxPayerProfile.isUSTaxResident,
      };

      if (
        !user?.lastName ||
        !passport?.documentNumber ||
        !location?.countryOfResidenceCode ||
        !taxPayerProfile?.taxResidency
      ) {
        return null;
      }

      const { id, url } = await this.makeDocument({
        userId,
        fileName: 'applicationFormForNaturalPersons.docx',
        assetName: 'agreements/applicationFormForNaturalPersons',
        data,
      });

      await tx.document.create({
        data: {
          userId,
          type: DocumentTypeEnum.ApplicationFormForNaturalPersons,
          fileId: id,
        },
      });

      return url;
    });

    return {
      applicationFormForNaturalPersons: url,
    };
  }

  async getUsersWithDocuments(params: {
    take: number;
    skip: number;
    branchId: number;
    search: string;
    phone: string;
    needDataVerification: boolean | null;
    accountStatus: AccountStatusEnum;
  }) {
    const makeSearch = (field: string, search: string) => {
      return search
        ? { [field]: { contains: search, mode: 'insensitive' } }
        : null;
    };

    const makeIdSearch = (search: string) => {
      const id = parseInt(search, 10);
      return isNaN(id) ? null : { id };
    };

    const fieldSearchConditions = ['firstName', 'middleName', 'lastName']
      .map((field) => makeSearch(field, params.search))
      .filter(Boolean);

    const idSearchCondition = makeIdSearch(params.search);
    const accountStatusCondition = params.accountStatus
      ? { accountStatus: params.accountStatus }
      : null;

    const needDataVerificationCondition =
      params.needDataVerification !== null
        ? {
            needDataVerification: params.needDataVerification,
          }
        : null;

    const searchConditions =
      idSearchCondition ||
      accountStatusCondition ||
      needDataVerificationCondition
        ? [
            ...fieldSearchConditions,
            idSearchCondition,
            accountStatusCondition,
            needDataVerificationCondition,
          ].filter(Boolean)
        : fieldSearchConditions;

    const clients = await this.prisma.user.findMany({
      // take: params.take,
      // skip: params.skip,
      where: {
        auth: {
          roles: {
            some: {
              role: {
                slug: { in: [RoleEnum.Client, RoleEnum.ClientRepresentative] },
              },
            },
          },
        },
        OR:
          searchConditions.length > 0
            ? searchConditions
            : [{ id: { not: -1 } }],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        accountStatus: true,
        createdAt: true,
        needDataVerification: true,
        documents: {
          select: {
            id: true,
            type: true,
            fileId: true,
            isReviewed: true,
            reviewedAt: true,
          },
        },
        location: true,
        passport: true,
        economicProfile: true,
        taxPayerProfile: true,
        branches: {
          include: {
            branch: true,
          },
        },
        auth: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            documents: { where: { isReviewed: false } },
          },
        },
      },
      orderBy: { documents: { _count: 'desc' } }, // @TODO: check if it works
    });

    if (!clients.length) {
      return [];
    }

    const documentIds = R.chain(
      R.pluck('fileId'),
      R.pluck('documents', clients),
    ) as number[];

    const documentUrls = documentIds.length
      ? await this.getFilesUrls(documentIds)
      : [];

    const normalizeFiles = R.pipe(
      R.map<(typeof documentUrls)[0], [number, (typeof documentUrls)[0]]>(
        (a) => [a.id, a],
      ),
      R.fromPairs,
    );

    const normalizedFiles = normalizeFiles(documentUrls);

    return clients.map(({ _count, ...c }) =>
      omitDeep(
        {
          ...c,
          countUnverifiedDocuments: _count.documents,
          documents: c.documents
            .map(({ fileId, ...d }) =>
              normalizedFiles[fileId]?.url
                ? {
                    ...d,
                    url: normalizedFiles[fileId].url,
                  }
                : null,
            )
            .filter(Boolean),
        },
        ['password'],
      ),
    );
  }

  async getUserDocuments(userId: number) {
    const documents = await this.prisma.document.findMany({
      select: {
        id: true,
        fileId: true,
        type: true,
      },
      where: {
        userId,
      },
    });

    if (!documents.length) {
      return { documents: [] };
    }

    const documentIds = R.pluck('fileId', documents);

    const documentUrls = documentIds.length
      ? await this.getFilesUrls(documentIds)
      : [];

    const normalizeFiles = R.pipe(
      R.map<(typeof documentUrls)[0], [number, (typeof documentUrls)[0]]>(
        (a) => [a.id, a],
      ),
      R.fromPairs,
    );

    const normalizedFiles = normalizeFiles(documentUrls);

    const result = documents
      .map(({ fileId, ...d }) =>
        normalizedFiles[fileId]?.url
          ? {
              ...d,
              fileId,
              url: normalizedFiles[fileId].url,
              thumbnailUrl: normalizedFiles[fileId].thumbnailUrl,
              fileName: normalizedFiles[fileId].name,
              size: normalizedFiles[fileId].size,
              mimeType: normalizedFiles[fileId].mimeType,
            }
          : null,
      )
      .filter(Boolean);

    return { documents: result };
  }

  async searchUsers(params: {
    take: number;
    skip: number;
    branchId?: number;
    term: string;
    role: RoleEnum;
  }) {
    const makeSearch = (field: string, term: string) => {
      return term ? { [field]: { contains: term, mode: 'insensitive' } } : null;
    };

    const makeIdSearch = (term: string) => {
      const id = parseInt(term, 10);
      return isNaN(id) ? null : { id };
    };

    const fieldSearchConditions = ['firstName', 'middleName', 'lastName']
      .map((field) => makeSearch(field, params.term))
      .filter(Boolean);

    const idSearchCondition = makeIdSearch(params.term);

    const searchConditions = idSearchCondition
      ? [...fieldSearchConditions, idSearchCondition].filter(Boolean)
      : fieldSearchConditions;

    const clients = await this.prisma.user.findMany({
      // take: params.take,
      // skip: params.skip,
      where: {
        OR:
          searchConditions.length > 0
            ? searchConditions
            : [{ id: { not: -1 } }],
        auth: {
          roles: {
            some: {
              role: {
                slug: params.role,
              },
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
      },
    });

    if (!clients.length) {
      return [];
    }

    return clients.map((c) => omitDeep(c, ['password']));
  }

  async verificateDocument(
    userId: number,
    documentId: number,
    branchId: number,
    reviewerId: number,
    verified: boolean,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const found = await tx.document.findUnique({
        where: {
          userId,
          id: documentId,
          user: {
            branches: {
              some: {
                branchId,
              },
            },
          },
        },
      });

      if (!found) {
        throw new BadRequestException('Document is not under your branch');
      }

      await tx.document.update({
        where: {
          id: found.id,
        },
        data: {
          isReviewed: verified,
          reviewedBy: { connect: { id: reviewerId } },
          reviewedAt: verified ? new Date() : null,
        },
      });
    });

    this.usersTriggersService.postVerificateUserDocument({
      clientId: userId,
      documentId,
      documentVerified: verified,
    });
  }

  checkRolePermissions(
    rolePermissions: Record<string, RoleEnum[] | '*'>,
    meta: {
      role: RoleEnum;
      targetRoles: RoleEnum[];
    },
  ): boolean {
    const allowedRoles = rolePermissions[meta.role];
    if (!allowedRoles) {
      throw new BadRequestException('Permission denied: roles');
    }

    if (allowedRoles === '*') {
      return true;
    }

    const hasPermission = meta.targetRoles.every((role) =>
      allowedRoles.includes(role),
    );

    if (!hasPermission) {
      throw new BadRequestException('Permission denied: roles');
    }

    return hasPermission;
  }

  checkBranchesPermissions(meta: {
    branchId: number;
    role: RoleEnum;
    targetRoles?: RoleEnum[];
    targetBranches: { branchId: number; role: RoleEnum }[];
  }) {
    if (meta.role !== RoleEnum.Admin) {
      const branchIdsMatches = meta.targetBranches.every(
        (b) => b.branchId === meta.branchId,
      );

      // @TODO: maybe remove accountant?
      // case: client is under two different branches
      if (
        meta.role !== RoleEnum.ComplianceManager &&
        meta.role !== RoleEnum.Accountant &&
        meta.role !== RoleEnum.HeadOfBranch
      ) {
        if (!branchIdsMatches) {
          throw new BadRequestException('You can use only yours branch');
        }
      }

      if (meta.targetRoles) {
        const branchRoles = meta.targetBranches.map((b) => b.role);
        const rolesMatches = R.equals(meta.targetRoles, branchRoles);

        if (!rolesMatches) {
          throw new BadRequestException(
            'Roles inside branches must match user roles',
          );
        }
      }
    }
  }

  getFilesUrls(fileIds: number[]) {
    return firstValueFrom(
      this.filesServiceClient
        .send<
          {
            id: number;
            url: string;
            thumbnailUrl: string;
            name: string;
            size: number;
            mimeType: string;
          }[]
        >({ cmd: 'get_files_urls' }, { fileIds })
        .pipe(timeout(5000)),
    );
  }

  makeDocument(params: {
    assetName: string;
    fileName: string;
    userId: number;
    data: Record<string, string>;
  }) {
    return firstValueFrom(
      this.filesServiceClient
        .send<{
          url: number;
          id: number;
        }>({ cmd: 'make_document' }, params)
        .pipe(timeout(5000)),
    );
  }

  createInitialAccount(userId: number) {
    return firstValueFrom(
      this.accountsServiceClient
        .send<{ ok: boolean }>({ cmd: 'create_account' }, { userId })
        .pipe(timeout(5000)),
    );
  }

  async confirmCodeFromEmail(
    email: string,
    userId: number,
    code: string,
    type: string,
  ): Promise<boolean> {
    return firstValueFrom(
      this.alertServiceClient
        .send<boolean>(
          { cmd: 'verify_otp_by_email' },
          { email, code, type, userId },
        )
        .pipe(timeout(5000)),
    );
  }

  sendRawEmail(
    email: string,
    subject: string,
    text: string,
    extra?: {
      useHtmlTemplate?: boolean;
      templateId?: string;
      fromBackoffice?: boolean;
      data?: Record<string, any>;
    },
  ): Promise<{ success: boolean }> {
    return firstValueFrom(
      this.alertServiceClient
        .send<{
          success: boolean;
        }>({ cmd: 'send_raw_email' }, { email, subject, text, extra })
        .pipe(timeout(5000)),
    );
  }
}
