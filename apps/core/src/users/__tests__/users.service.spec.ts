import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ClientProxy } from '@nestjs/microservices';
import { BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Country } from 'country-list-js';
import { of, throwError } from 'rxjs';
import * as R from 'ramda';

import {
  constructUpsert,
  getUpdateValue,
  makeLocation,
  makePassport,
  updateCountryCode,
  UsersService,
} from '../users.service';
import { PrismaService } from '../../services/prisma.service';
import { UsersTriggersService } from '../usersTriggers.service';
import { UpdateAuthService } from '../../auth/auth.update-auth.service';
import { BranchesService } from '../../branches/branches.service';
import {
  AccountStatusEnum,
  Dependants,
  DocumentTypeEnum,
  EducationLevel,
  IndustrySector,
  InvestedInstruments,
  InvestmentDuration,
  InvestmentGoals,
  InvestmentRanges,
  MarketExperience,
  PoliticallyExposed,
  PositionHeld,
  SourceOfFunds,
  SourceOfInfo,
  TradeFrequency,
  User,
  USTaxResident,
  VerificationStageEnum,
} from '../../../prisma/client';
import { UpdateMyProfileRequestDto } from '../request-dto/updateMyProfileRequest.dto';
import { CreateProfileRequestDto } from '../request-dto/createProfileRequest.dto';
import { ProvidePassportToVerificationRequestDto } from '../request-dto/providePassportToVerificationRequestDto';
import { ProvideLocationToVerificationRequestDto } from '../request-dto/provideLocationToVerificationRequestDto';
import {
  ACCOUNTS_SERVICE,
  FILES_SERVICE,
  RoleEnum,
  UserMetadataParams,
  ALERT_SERVICE,
} from '@erp-modul/shared';
import { CountriesService } from '../../countries/countries.service';
import { ProvideEconomicToVerificationRequestDto } from '../request-dto/provideEconomicToVerificationRequestDto';
import { ProvideTaxToVerificationRequestDto } from '../request-dto/provideTaxToVerificationRequestDto';
import { ConfirmVerificationRequestDto } from '../request-dto/confirmVerificationRequest.dto';
import { PasswordService } from '../../services/password.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let usersTriggersServiceMock: DeepMockProxy<UsersTriggersService>;
  let filesServiceClientMock: DeepMockProxy<ClientProxy>;
  let accountsServiceClientMock: DeepMockProxy<ClientProxy>;
  let countriesServiceMock: DeepMockProxy<CountriesService>;
  let branchesServiceMock: DeepMockProxy<BranchesService>;
  let verifyServiceClientMock: DeepMockProxy<ClientProxy>;
  let passwordServiceMock: DeepMockProxy<PasswordService>;

  beforeEach(async () => {
    passwordServiceMock = mockDeep<PasswordService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        {
          provide: UsersTriggersService,
          useValue: mockDeep<UsersTriggersService>(),
        },
        { provide: UpdateAuthService, useValue: mockDeep<UpdateAuthService>() },
        { provide: BranchesService, useValue: mockDeep<BranchesService>() },
        { provide: CountriesService, useValue: mockDeep<CountriesService>() },
        {
          provide: PasswordService,
          useValue: passwordServiceMock,
        },
        { provide: FILES_SERVICE, useValue: mockDeep<ClientProxy>() },
        { provide: ALERT_SERVICE, useValue: mockDeep<ClientProxy>() },
        { provide: ACCOUNTS_SERVICE, useValue: mockDeep<ClientProxy>() },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaMock = module.get(PrismaService);
    usersTriggersServiceMock = module.get(UsersTriggersService);
    countriesServiceMock = module.get(CountriesService);
    branchesServiceMock = module.get(CountriesService);
    filesServiceClientMock = module.get(FILES_SERVICE);
    accountsServiceClientMock = module.get(ACCOUNTS_SERVICE);
    verifyServiceClientMock = module.get(ALERT_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('throwErrorIfNotVerified', () => {
    it('should throw error if user is not verified', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        accountStatus: AccountStatusEnum.VerificationInProgress,
      } as User);

      await expect(
        service.throwErrorIfNotVerified(1, RoleEnum.Client),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return empty object if user is not client role', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        accountStatus: AccountStatusEnum.Verified,
      } as User);

      const result = await service.throwErrorIfNotVerified(
        1,
        RoleEnum.Accountant,
      );
      expect(result).toEqual({});
    });

    it('should return empty object if user is verified', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        accountStatus: AccountStatusEnum.Verified,
      } as User);

      const result = await service.throwErrorIfNotVerified(1, RoleEnum.Client);
      expect(result).toEqual({});
    });
  });

  describe('getUserProfile', () => {
    const userMetadata: UserMetadataParams = {
      userId: 1,
      authId: 1,
      branchId: 1,
      role: RoleEnum.Client,
    };

    it('should return user profile if user exists', async () => {
      const userProfile = {
        id: 1,
        auth: { roles: [] },
        branches: [],
      };
      prismaMock.user.findUnique.mockResolvedValue(userProfile as any);

      const result = await service.getUserProfile(userMetadata, 1);
      expect(result).toEqual(userProfile);
    });

    it('should throw error if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserProfile(userMetadata, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('internal getUserProfile', () => {
    it('should return user profile if user exists', async () => {
      const userProfile = {
        id: 1,
      };
      prismaMock.auth.findUnique.mockResolvedValue(userProfile as any);

      const result = await service.internalUserProfile(1);
      expect(result).toEqual(userProfile);
    });

    it('should throw error if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.internalUserProfile(1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('UsersService - getProfilesList', () => {
    it('should retrieve profiles as admin', async () => {
      const meta = { userId: 1, authId: 1, role: RoleEnum.Admin, branchId: 1 };
      const params = {
        meta,
        skip: 0,
        take: 20,
        targetRole: RoleEnum.Client,
      };

      const userProfiles = [
        { id: 1, authId: 1, name: 'John Doe', email: 'john@example.com' },
      ];

      prismaMock.user.findMany.mockResolvedValue(userProfiles);

      const result = await service.getProfilesList(params);

      expect(result).toEqual([
        {
          id: 1,
          authId: 1,
          name: 'John Doe',
          email: 'john@example.com',
        },
      ]);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should throw an error if users do not specify target role', async () => {
      const meta = { userId: 1, authId: 1, role: RoleEnum.Admin, branchId: 1 };
      const params = {
        meta,
        skip: 0,
        take: 20,
        targetRole: undefined,
      };

      await expect(service.getProfilesList(params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should retrieve profiles for non-admin with specified target role', async () => {
      const meta = {
        userId: 1,
        authId: 1,
        role: RoleEnum.BranchManager,
        branchId: 1,
      };
      const params = {
        meta,
        skip: 0,
        take: 20,
        targetRole: RoleEnum.Client,
      };

      service.checkRolePermissions = jest.fn(); // Assume it passes permissions check
      const userProfiles = [
        { id: 101, authId: 1, name: 'John Doe', email: 'john@example.com' },
      ];

      prismaMock.user.findMany.mockResolvedValue(userProfiles);

      const result = await service.getProfilesList(params);

      expect(result).toEqual([
        {
          id: 101,
          authId: 1,
          name: 'John Doe',
          email: 'john@example.com',
        },
      ]);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should retrieve profiles for Sales Manager without specified branch', async () => {
      const meta = {
        userId: 1,
        authId: 1,
        role: RoleEnum.SalesManager,
        branchId: 1,
      };

      const params = {
        meta,
        skip: 0,
        take: 20,
        targetRole: RoleEnum.Client,
      };

      service.checkRolePermissions = jest.fn(); // Assume it passes permissions check
      const userProfiles = [
        { id: 101, authId: 1, name: 'John Doe', email: 'john@example.com' },
      ];

      prismaMock.user.findMany.mockResolvedValue(userProfiles);

      const result = await service.getProfilesList(params);

      expect(result).toEqual([
        {
          id: 101,
          authId: 1,
          name: 'John Doe',
          email: 'john@example.com',
        },
      ]);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('updateUserProfile', () => {
    const userMetadata: UserMetadataParams = {
      userId: 1,
      authId: 1,
      branchId: 1,
      role: RoleEnum.Client,
    };

    it('should update user profile and return the updated profile', async () => {
      const updateDto: UpdateMyProfileRequestDto = {
        firstName: 'Updated',
      };

      const updatedUser = {
        ...updateDto,
        id: 1,
      };

      prismaMock.$transaction.mockImplementation(async (fn) => {
        return fn(prismaMock);
      });

      prismaMock.user.update.mockResolvedValue(updatedUser);
      prismaMock.user.findUnique.mockResolvedValue(updatedUser);

      const result = await service.updateUserProfile(
        userMetadata,
        1,
        updateDto,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw error if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(async (fn) => {
        return fn(prismaMock);
      });

      await expect(
        service.updateUserProfile(userMetadata, 1, {
          firstName: 'Updated',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createUserProfile', () => {
    const userMetadata: UserMetadataParams = {
      userId: 1,
      authId: 1,
      branchId: 1,
      role: RoleEnum.Admin,
    };

    it('should create user profile and return ok', async () => {
      const createDto: CreateProfileRequestDto = {
        firstName: 'New',
        lastName: 'User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password',
        roles: [RoleEnum.Client],
      };
      prismaMock.$transaction.mockImplementation(async (fn) => {
        return fn(prismaMock);
      });

      prismaMock.role.findMany.mockResolvedValue([{ slug: RoleEnum.Client }]);
      prismaMock.user.create.mockResolvedValue({ id: 1 } as User);

      const result = await service.createUserProfile(userMetadata, createDto);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('changeAccountStatus', () => {
    it('should change the account status of a user', async () => {
      const originalUser = {
        id: 1,
        accountStatus: AccountStatusEnum.VerificationInProgress,
        auth: {
          email: 'test@test.com',
        },
      } as unknown as User;

      const updatedUser = {
        ...originalUser,
        accountStatus: AccountStatusEnum.Verified,
      } as User;

      prismaMock.$transaction.mockImplementation(async (fn) => {
        return fn(prismaMock);
      });
      prismaMock.user.findUnique.mockResolvedValue(originalUser);
      prismaMock.user.update.mockResolvedValue(updatedUser);

      jest.spyOn(service, 'sendRawEmail').mockResolvedValue({ success: true });
      jest
        .spyOn(service, 'verificationMeta')
        .mockResolvedValue({ applicationFormForNaturalPersons: 'link' });

      accountsServiceClientMock.send.mockReturnValue(of({ ok: true }));

      const result = await service.changeAccountStatus({
        userId: 2,
        branchId: 1,
        status: AccountStatusEnum.Verified,
        managerId: 1,
        role: RoleEnum.Accountant,
      });

      expect(accountsServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'create_account' },
        { userId: 2 },
      );

      expect(result).toEqual(updatedUser);
    });

    it('should throw error if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(async (fn) => {
        return fn(prismaMock);
      });

      await expect(
        service.changeAccountStatus({
          userId: 2,
          branchId: 1,
          status: AccountStatusEnum.Verified,
          role: RoleEnum.Accountant,
          managerId: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('UsersService - providePassportToVerification', () => {
    const dto: ProvidePassportToVerificationRequestDto = {
      documentNumber: '1',
      citizenshipCountryCode: 'US',
      authorityDate: new Date().toDateString(),
      authority: '1',
      originCountryCode: 'RU',
      noExpirationDate: true,
      expiryAt: null,
      placeOfBirth: 'Russia',
      firstPackFileIds: [1, 2, 3],
      secondPackFileIds: [1, 2, 3],
    };

    it('should provide passport for verification', async () => {
      const userId = 1;

      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );
      prismaMock.document.createMany.mockResolvedValue([]);

      prismaMock.user.findUnique.mockResolvedValue({
        id: userId,
        auth: { id: 1 },
        passport: { citizenshipCountryCode: 'US', originCountryCode: 'RU' },
      });
      branchesServiceMock.addUserToBranchesByParams.mockResolvedValue(void 0);
      prismaMock.rolesOnAuth.findMany.mockResolvedValue([
        { role: { slug: RoleEnum.Client } },
      ]);

      countriesServiceMock.findCountryByCountryCode
        .mockReturnValueOnce(['US', { name: 'United States' } as Country])
        .mockReturnValueOnce(['RU', { name: 'Russia' } as Country])
        .mockReturnValueOnce(['US', { name: 'United States' } as Country]);

      await service.providePassportToVerification(userId, dto);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.document.createMany).toHaveBeenCalledWith({
        data: [
          ...dto.firstPackFileIds.map((fileId) => ({
            fileId,
            userId,
            type: DocumentTypeEnum.IdentityFirstPack,
          })),
          ...dto.secondPackFileIds.map((fileId) => ({
            fileId,
            userId,
            type: DocumentTypeEnum.IdentitySecondPack,
          })),
        ],
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: {
          id: userId,
        },
        data: {
          needDataVerification: true,
          countryCode: 'US',
          verificationStage: VerificationStageEnum.Residence,
          accountStatus: AccountStatusEnum.VerificationInProgress,
          passport: {
            upsert: {
              create: R.omit(['firstPackFileIds', 'secondPackFileIds'], dto),
              update: R.omit(['firstPackFileIds', 'secondPackFileIds'], dto),
            },
          },
        },
      });
    });

    it('should handle transaction errors', async () => {
      const userId = 1;

      prismaMock.$transaction.mockRejectedValue(new Error('Transaction error'));

      await expect(
        service.providePassportToVerification(userId, dto),
      ).rejects.toThrow('Transaction error');

      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('UsersService - provideLocationToVerification', () => {
    const userId = 1;
    const fileIds = [1, 2, 3];
    const dto: ProvideLocationToVerificationRequestDto = {
      city: '',
      zipCode: '',
      countryOfResidenceCode: 'US',
      flatNo: '1',
      region: 'Eu',
      street: '',
      streetNo: '1',
      fileIds,
    };

    it('should provide location for verification and update user details', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      await prismaMock.document.createMany.mockResolvedValue([]);
      await prismaMock.user.findUnique.mockResolvedValue({
        verificationStage: VerificationStageEnum.Residence,
      });

      countriesServiceMock.findCountryByCountryCode.mockReturnValueOnce([
        'US',
        { name: 'United States' } as Country,
      ]);

      await service.provideLocationToVerification(userId, dto);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.document.createMany).toHaveBeenCalledWith({
        data: fileIds.map((fileId) => ({
          fileId,
          type: DocumentTypeEnum.Location,
          userId,
        })),
      });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          needDataVerification: true,
          verificationStage: VerificationStageEnum.Economic,
          accountStatus: AccountStatusEnum.VerificationInProgress,
          location: {
            upsert: {
              create: R.omit(['fileIds'], dto),
              update: R.omit(['fileIds'], dto),
            },
          },
        },
      });
    });

    it('should handle transaction errors', async () => {
      prismaMock.$transaction.mockRejectedValue(new Error('Transaction error'));

      await expect(
        service.provideLocationToVerification(userId, dto),
      ).rejects.toThrow('Transaction error');

      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('UsersService - provideTaxToVerification', () => {
    const userId = 1;
    const fileIds = [1, 2, 3];
    const dto: ProvideTaxToVerificationRequestDto = {
      individualTaxpayerNumber: '123456789',
      taxResidency: 'EN',
      isUSTaxResident: USTaxResident.Yes,
      howDidYouHearAboutUs: SourceOfInfo.FromOnlineAdvertisements,
      fileIds,
    };

    it('should provide location for verification and update user details', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      await prismaMock.document.createMany.mockResolvedValue([]);

      await prismaMock.user.findUnique.mockResolvedValue({
        verificationStage: VerificationStageEnum.Taxpayer,
      });

      await service.provideTaxToVerification(userId, dto);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.document.createMany).toHaveBeenCalledWith({
        data: fileIds.map((fileId) => ({
          fileId,
          type: DocumentTypeEnum.Other,
          userId,
        })),
      });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          needDataVerification: true,
          verificationStage: VerificationStageEnum.Contract,
          accountStatus: AccountStatusEnum.VerificationInProgress,
          taxPayerProfile: {
            create: R.omit(['fileIds'], dto),
          },
        },
      });
    });

    it('should handle transaction errors', async () => {
      prismaMock.$transaction.mockRejectedValue(new Error('Transaction error'));

      await expect(
        service.provideTaxToVerification(userId, dto),
      ).rejects.toThrow('Transaction error');

      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('UsersService - provideExtraToVerification', () => {
    const userId = 1;
    const fileIds = [1, 2, 3];

    it('should provide extra for verification and update user details', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      await prismaMock.document.createMany.mockResolvedValue([]);
      await prismaMock.user.findUnique.mockResolvedValue({
        accountStatus: AccountStatusEnum.VerificationInProgress,
      });

      await service.provideExtraToVerification(userId, fileIds);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.document.createMany).toHaveBeenCalledWith({
        data: fileIds.map((fileId) => ({
          fileId,
          type: DocumentTypeEnum.Other,
          userId,
        })),
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          accountStatus: AccountStatusEnum.VerificationInProgress,
          needDataVerification: true,
        },
      });
    });

    it('should handle transaction errors', async () => {
      prismaMock.$transaction.mockRejectedValue(new Error('Transaction error'));

      await expect(
        service.provideExtraToVerification(userId, fileIds),
      ).rejects.toThrow('Transaction error');

      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('UsersService - provideEconomicToVerification', () => {
    const userId = 1;
    const fileIds = [1, 2, 3];
    const dto: ProvideEconomicToVerificationRequestDto = {
      fileIds,
      marketExperience: MarketExperience.LessThanTwoYears,
      investedInstruments: [
        InvestedInstruments.StocksBonds,
        InvestedInstruments.NotDecided,
      ],
      educationLevel: EducationLevel.HighSchool,
      investmentGoals: InvestmentGoals.CapitalSaving,
      investmentDuration: InvestmentDuration.LessThanAYear,
      tradeFrequency: TradeFrequency.OneToFifty,
      initialInvestment: InvestmentRanges.LessThan25K,
      expectedTurnover: InvestmentRanges.Range25K100K,
      annualIncome: InvestmentRanges.Range100K300K,
      totalAssetValue: InvestmentRanges.Range300K1M,
      sourceOfFunds: [SourceOfFunds.Wage, SourceOfFunds.Savings],
      employerNameAddress: '123 Main St, Anytown, AT 12345',
      industrySector: IndustrySector.Financials,
      positionHeld: PositionHeld.MiddleLink,
      fundTransferOrigin: 'US',
      expectedTransferDestination: 'UK',
      politicallyExposed: PoliticallyExposed.NoNotLinked,
      dependants: Dependants.None,
    };

    it('should provide location for verification and update user details', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      await prismaMock.document.createMany.mockResolvedValue([]);

      await prismaMock.user.findUnique.mockResolvedValue({
        verificationStage: VerificationStageEnum.Contract,
      });
      await service.provideEconomicToVerification(userId, dto);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.document.createMany).toHaveBeenCalledWith({
        data: fileIds.map((fileId) => ({
          fileId,
          type: DocumentTypeEnum.Economic,
          userId,
        })),
      });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          needDataVerification: true,
          accountStatus: AccountStatusEnum.VerificationInProgress,
          economicProfile: {
            create: R.omit(['fileIds'], dto),
          },
        },
      });
    });

    it('should handle transaction errors', async () => {
      prismaMock.$transaction.mockRejectedValue(new Error('Transaction error'));

      await expect(
        service.provideEconomicToVerification(userId, dto),
      ).rejects.toThrow('Transaction error');

      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('UserService - confirmVerification', () => {
    const userId = 1;
    const dto: ConfirmVerificationRequestDto = {
      agreedToApplicationTerms: true,
      agreedToServiceGeneralRules: true,
      agreedToClaimsRegistrationRules: true,
      agreedToMarginTradesRules: true,
      code: '123456',
    };

    it('should update user verification details and confirm email code', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );
      prismaMock.user.update.mockResolvedValue({
        auth: { email: 'test@example.com' },
      });

      jest.spyOn(service, 'confirmCodeFromEmail').mockResolvedValue(true);

      const result = await service.confirmVerification(userId, dto);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        include: { auth: true },
        data: {
          needDataVerification: true,
          agreedToApplicationTerms: dto.agreedToApplicationTerms,
          agreedToApplicationTermsDate: expect.any(Date),
          agreedToServiceGeneralRules: dto.agreedToServiceGeneralRules,
          agreedToServiceGeneralRulesDate: expect.any(Date),
          agreedToClaimsRegistrationRules: dto.agreedToClaimsRegistrationRules,
          agreedToClaimsRegistrationRulesDate: expect.any(Date),
          agreedToMarginTradesRules: dto.agreedToMarginTradesRules,
          agreedToMarginTradesRulesDate: expect.any(Date),
          // verificationStage: VerificationStageEnum.Passport,
        },
      });

      expect(service.confirmCodeFromEmail).toHaveBeenCalledWith(
        'test@example.com',
        userId,
        dto.code,
        'SIGN_VERIFICATION_DOCUMENTS',
      );
      expect(result).toEqual({ ok: true });
    });

    it('should throw BadRequestException if email code confirmation fails', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );
      prismaMock.user.update.mockResolvedValue({
        auth: { email: 'test@example.com' },
      });

      jest.spyOn(service, 'confirmCodeFromEmail').mockResolvedValue(false);

      await expect(service.confirmVerification(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.confirmCodeFromEmail).toHaveBeenCalledWith(
        'test@example.com',
        userId,
        dto.code,
        'SIGN_VERIFICATION_DOCUMENTS',
      );
    });

    it('should handle transaction errors', async () => {
      prismaMock.$transaction.mockRejectedValue(new Error('Transaction error'));

      await expect(service.confirmVerification(userId, dto)).rejects.toThrow(
        'Transaction error',
      );

      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });

  describe('UsersService: getUsersWithDocuments', () => {
    const params = {
      take: 10,
      skip: 0,
      branchId: 1,
      search: 'John',
      phone: '+1234567890',
      accountStatus: AccountStatusEnum.Verified,
      needDataVerification: true,
    };

    it('should fetch users with documents successfully', async () => {
      const clients = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          documents: [{ fileId: 'file1', id: 'file1', isReviewed: false }],
          auth: {
            phone: params.phone,
          },
          _count: {
            documents: 1,
          },
        },
      ];
      const documentUrls = [{ id: 'file1', url: 'example.com/file1' }];

      prismaMock.user.findMany.mockResolvedValue(clients);
      prismaMock.document.findMany.mockResolvedValue([]);

      filesServiceClientMock.send.mockReturnValue(of(documentUrls));

      const result = await service.getUsersWithDocuments(params);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].auth.phone).toBe(params.phone);
      expect(result[0].documents).toHaveLength(1);
      expect(result[0].documents[0].id).toBe('file1');
      expect(result[0].documents[0].url).toBe('example.com/file1');

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        // take: params.take,
        // skip: params.skip,
        where: {
          auth: expect.any(Object),
          OR: [
            {
              firstName: { contains: params.search, mode: 'insensitive' },
            },
            {
              middleName: { contains: params.search, mode: 'insensitive' },
            },
            {
              lastName: { contains: params.search, mode: 'insensitive' },
            },
            {
              accountStatus: AccountStatusEnum.Verified,
            },
            {
              needDataVerification: true,
            },
          ],
        },
        select: expect.any(Object),
        orderBy: { documents: { _count: 'desc' } },
      });
      expect(filesServiceClientMock.send).toHaveBeenCalledWith(
        expect.any(Object),
        { fileIds: ['file1'] },
      );
    });

    it('should handle no users with documents found', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      service.getFilesUrls = jest.fn().mockResolvedValue([]);

      const result = await service.getUsersWithDocuments(params);

      expect(result).toHaveLength(0);
      expect(prismaMock.document.findMany).not.toHaveBeenCalled();
      expect(filesServiceClientMock.send).not.toHaveBeenCalled();
    });

    it('should handle an empty search query', async () => {
      const emptySearchParams = {
        ...params,
        search: null,
        accountStatus: null,
      };

      const clients = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          documents: [{ fileId: 'file1', id: 'file1', isReviewed: false }],
          auth: {
            phone: params.phone,
          },
          _count: {
            documents: 1,
          },
        },
      ];
      const documentUrls = [{ id: 'file1', url: 'example.com/file1' }];

      prismaMock.user.findMany.mockResolvedValue(clients);
      prismaMock.document.findMany.mockResolvedValue([]);
      filesServiceClientMock.send.mockReturnValue(of(documentUrls));

      const result = await service.getUsersWithDocuments(emptySearchParams);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].auth.phone).toBe(emptySearchParams.phone);
      expect(result[0].documents).toHaveLength(1);
      expect(result[0].documents[0].id).toBe('file1');
      expect(result[0].documents[0].url).toBe('example.com/file1');

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        // take: emptySearchParams.take,
        // skip: emptySearchParams.skip,
        where: {
          auth: expect.any(Object),
          OR: [
            {
              needDataVerification: true,
            },
          ],
        },
        select: expect.any(Object),
        orderBy: { documents: { _count: 'desc' } },
      });
      expect(filesServiceClientMock.send).toHaveBeenCalledWith(
        expect.any(Object),
        { fileIds: ['file1'] },
      );
    });

    it('should handle no documents found for users', async () => {
      const clients = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          documents: [],
          auth: {
            phone: params.phone,
          },
          _count: { documents: 0 },
        },
      ];

      prismaMock.user.findMany.mockResolvedValue(clients);
      prismaMock.document.findMany.mockResolvedValue([]);

      filesServiceClientMock.send.mockReturnValue(of([]));

      const result = await service.getUsersWithDocuments(params);

      expect(result).toHaveLength(1);
      expect(result[0].documents).toHaveLength(0);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.any(Object));
      expect(filesServiceClientMock.send).not.toHaveBeenCalled();
    });

    it('should handle a scenario with multiple users and documents', async () => {
      const clients = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          documents: [{ fileId: 'file1', id: 'file1', isReviewed: false }],
          auth: {
            phone: params.phone,
          },
          _count: {
            documents: 1,
          },
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Doe',
          documents: [{ fileId: 'file2', id: 'file2', isReviewed: true }],
          auth: {
            phone: params.phone,
          },
          _count: {
            documents: 1,
          },
        },
      ];
      const documentUrls = [
        { id: 'file1', url: 'example.com/file1' },
        { id: 'file2', url: 'example.com/file2' },
      ];

      prismaMock.user.findMany.mockResolvedValue(clients);
      prismaMock.document.findMany.mockResolvedValue([]);

      filesServiceClientMock.send.mockReturnValue(of(documentUrls));

      const result = await service.getUsersWithDocuments(params);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].auth.phone).toBe('+1234567890');
      expect(result[0].documents).toHaveLength(1);
      expect(result[0].documents[0].id).toBe('file1');
      expect(result[0].documents[0].url).toBe('example.com/file1');
      expect(result[1].id).toBe(2);
      expect(result[1].auth.phone).toBe(params.phone);
      expect(result[1].documents).toHaveLength(1);
      expect(result[1].documents[0].id).toBe('file2');
      expect(result[1].documents[0].url).toBe('example.com/file2');

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.any(Object));
      expect(filesServiceClientMock.send).toHaveBeenCalledWith(
        expect.any(Object),
        { fileIds: ['file1', 'file2'] },
      );
    });

    it('should handle error when fetching document URLs', async () => {
      const clients = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          documents: [{ fileId: 'file1', id: 'file1', isReviewed: false }],
          auth: {
            phone: params.phone,
          },
          _count: {
            documents: 1,
          },
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Doe',
          documents: [{ fileId: 'file2', id: 'file2', isReviewed: true }],
          auth: {
            phone: params.phone,
          },
          _count: {
            documents: 1,
          },
        },
      ];

      prismaMock.user.findMany.mockResolvedValue(clients);
      prismaMock.document.findMany.mockResolvedValue([]);

      const errorMessage = 'Failed to fetch document URLs';
      filesServiceClientMock.send.mockReturnValue(
        throwError(() => new Error(errorMessage)),
      );

      await expect(service.getUsersWithDocuments(params)).rejects.toThrow(
        new Error(errorMessage),
      );

      expect(filesServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'get_files_urls' },
        { fileIds: expect.any(Array) },
      );
    });
  });

  describe('UsersService: searchUsers', () => {
    const params = {
      take: 10,
      skip: 0,
      branchId: 1,
      term: 'John',
      role: RoleEnum.HeadOfBranch,
    };

    it('should fetch users successfully', async () => {
      const clients = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
        },
      ];

      prismaMock.user.findMany.mockResolvedValue(clients);

      const result = await service.searchUsers(params);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        // take: params.take,
        // skip: params.skip,
        where: {
          OR: [
            {
              firstName: { contains: params.term, mode: 'insensitive' },
            },
            {
              middleName: { contains: params.term, mode: 'insensitive' },
            },
            {
              lastName: { contains: params.term, mode: 'insensitive' },
            },
          ],
          auth: {
            roles: {
              some: {
                role: {
                  slug: RoleEnum.HeadOfBranch,
                },
              },
            },
          },
        },
        select: expect.any(Object),
      });
    });
  });

  describe('UsersService: verificateDocument', () => {
    const reviewerId = 100;
    const userId = 1;
    const branchId = 1;
    const documentId = 1;
    const verified = true;

    it('should successfully verify a document and not verify user because of not verified documents left', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      prismaMock.document.findUnique.mockResolvedValue({ id: documentId });
      prismaMock.document.findMany.mockResolvedValue([1]);

      await service.verificateDocument(
        userId,
        documentId,
        branchId,
        reviewerId,
        verified,
      );

      expect(prismaMock.document.findUnique).toHaveBeenCalledWith({
        where: {
          userId,
          id: documentId,
          user: { branches: { some: { branchId } } },
        },
      });

      expect(prismaMock.document.update).toHaveBeenCalledWith({
        where: {
          id: documentId,
        },
        data: {
          isReviewed: verified,
          reviewedAt: expect.any(Date),
          reviewedBy: {
            connect: { id: reviewerId },
          },
        },
      });

      expect(prismaMock.user.update).not.toHaveBeenCalledWith();

      expect(
        usersTriggersServiceMock.postVerificateUserDocument,
      ).toHaveBeenCalledWith({
        clientId: userId,
        documentId,
        documentVerified: verified,
      });
    });

    it('should handle error when verifying a document', async () => {
      const errorMessage = 'Failed to verify document';
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );
      prismaMock.document.update.mockRejectedValue(new Error(errorMessage));
      prismaMock.document.findUnique.mockResolvedValue({ id: documentId });

      await expect(
        service.verificateDocument(
          userId,
          documentId,
          branchId,
          reviewerId,
          verified,
        ),
      ).rejects.toThrow(new Error(errorMessage));

      expect(prismaMock.document.findUnique).toHaveBeenCalledWith({
        where: {
          userId,
          id: documentId,
          user: { branches: { some: { branchId } } },
        },
      });

      expect(prismaMock.document.update).toHaveBeenCalledWith({
        where: {
          id: documentId,
        },
        data: {
          isReviewed: verified,
          reviewedAt: expect.any(Date),
          reviewedBy: {
            connect: { id: reviewerId },
          },
        },
      });

      expect(
        usersTriggersServiceMock.postVerificateUserDocument,
      ).not.toHaveBeenCalled();
    });

    it('should throw error when verifying a document if user is not under branch', async () => {
      prismaMock.document.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      await expect(
        service.verificateDocument(
          userId,
          documentId,
          branchId,
          reviewerId,
          verified,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(prismaMock.document.update).not.toHaveBeenCalledWith();

      expect(
        usersTriggersServiceMock.postVerificateUserDocument,
      ).not.toHaveBeenCalled();
    });

    it('should set user status to Verified and create initial account when no documents left', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      prismaMock.document.findUnique.mockResolvedValue({ id: documentId });
      prismaMock.document.findMany.mockResolvedValue([
        {
          id: documentId,
          type: DocumentTypeEnum.IdentityFirstPack,
          isReviewed: true,
        },
        {
          id: 2,
          type: DocumentTypeEnum.Location,
          isReviewed: true,
        },
      ]);
      prismaMock.user.update.mockResolvedValue({ id: userId });

      await service.verificateDocument(
        userId,
        documentId,
        branchId,
        reviewerId,
        verified,
      );

      expect(prismaMock.document.findUnique).toHaveBeenCalledWith({
        where: {
          userId,
          id: documentId,
          user: { branches: { some: { branchId } } },
        },
      });

      expect(prismaMock.document.update).toHaveBeenCalledWith({
        where: {
          id: documentId,
        },
        data: {
          isReviewed: verified,
          reviewedAt: expect.any(Date),
          reviewedBy: {
            connect: { id: reviewerId },
          },
        },
      });

      expect(
        usersTriggersServiceMock.postVerificateUserDocument,
      ).toHaveBeenCalledWith({
        clientId: userId,
        documentId,
        documentVerified: verified,
      });
    });

    it('should not set user status to Verified and should not create initial account when documents left', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      prismaMock.document.findUnique.mockResolvedValue({ id: documentId });
      prismaMock.document.findMany.mockResolvedValue([
        {
          id: documentId,
          type: DocumentTypeEnum.IdentityFirstPack,
          isReviewed: false,
        },
        {
          id: 2,
          type: DocumentTypeEnum.Location,
          isReviewed: true,
        },
      ]);
      prismaMock.user.update.mockResolvedValue({ id: userId });

      await service.verificateDocument(
        userId,
        documentId,
        branchId,
        reviewerId,
        verified,
      );

      expect(prismaMock.document.findUnique).toHaveBeenCalledWith({
        where: {
          userId,
          id: documentId,
          user: { branches: { some: { branchId } } },
        },
      });

      expect(prismaMock.document.update).toHaveBeenCalledWith({
        where: {
          id: documentId,
        },
        data: {
          isReviewed: verified,
          reviewedAt: expect.any(Date),
          reviewedBy: {
            connect: { id: reviewerId },
          },
        },
      });

      expect(prismaMock.user.update).not.toHaveBeenCalled();

      expect(accountsServiceClientMock.send).not.toHaveBeenCalled();

      expect(
        usersTriggersServiceMock.postVerificateUserDocument,
      ).toHaveBeenCalledWith({
        clientId: userId,
        documentId,
        documentVerified: verified,
      });
    });
  });

  describe('UsersService: getFilesUrls', () => {
    const fileIds = [1, 2, 3];

    it('should successfully fetch file URLs', async () => {
      const fileUrls = fileIds.map((fileId) => ({
        id: fileId,
        url: `http://example.com/${fileId}`,
      }));
      filesServiceClientMock.send.mockReturnValue(of(fileUrls));

      const result = await service.getFilesUrls(fileIds);

      expect(result).toEqual(fileUrls);
      expect(filesServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'get_files_urls' },
        { fileIds },
      );
    });

    it('should handle error when fetching file URLs', async () => {
      const errorMessage = 'Failed to fetch file URLs';
      filesServiceClientMock.send.mockReturnValue(
        throwError(() => new Error(errorMessage)),
      );

      await expect(service.getFilesUrls(fileIds)).rejects.toThrow(
        new Error(errorMessage),
      );

      expect(filesServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'get_files_urls' },
        { fileIds },
      );
    });
  });

  describe('UsersService - checkRolePermissions', () => {
    const rolePermissions: Record<string, RoleEnum[] | '*'> = {
      [RoleEnum.Admin]: '*', // Admin can perform any role
      [RoleEnum.HeadOfBranch]: [
        RoleEnum.Client,
        RoleEnum.ClientRepresentative,
        RoleEnum.BranchManager,
      ],
      [RoleEnum.BranchManager]: [RoleEnum.Client],
    };

    it('should allow Admin to perform any role due to wildcard permissions', () => {
      const meta = {
        role: RoleEnum.Admin,
        targetRoles: [
          RoleEnum.HeadOfBranch,
          RoleEnum.Client,
          RoleEnum.BranchManager,
        ], // All roles should be allowed
      };

      expect(() =>
        service.checkRolePermissions(rolePermissions, meta),
      ).not.toThrow();
    });

    it('should allow HeadOfBranch to perform specified roles', () => {
      const meta = {
        role: RoleEnum.HeadOfBranch,
        targetRoles: [
          RoleEnum.Client,
          RoleEnum.ClientRepresentative,
          RoleEnum.BranchManager,
        ],
      };

      expect(() =>
        service.checkRolePermissions(rolePermissions, meta),
      ).not.toThrow();
    });

    it('should deny HeadOfBranch from performing unallowed roles', () => {
      const meta = {
        role: RoleEnum.HeadOfBranch,
        targetRoles: [RoleEnum.Admin], // HeadOfBranch should not be able to perform Admin role
      };

      expect(() => service.checkRolePermissions(rolePermissions, meta)).toThrow(
        BadRequestException,
      );
    });

    it('should allow BranchManager to perform allowed role', () => {
      const meta = {
        role: RoleEnum.BranchManager,
        targetRoles: [RoleEnum.Client], // BranchManager can only manage Client
      };

      expect(() =>
        service.checkRolePermissions(rolePermissions, meta),
      ).not.toThrow();
    });

    it('should deny BranchManager from performing unallowed roles', () => {
      const meta = {
        role: RoleEnum.BranchManager,
        targetRoles: [RoleEnum.ClientRepresentative, RoleEnum.HeadOfBranch], // Not allowed for BranchManager
      };

      expect(() => service.checkRolePermissions(rolePermissions, meta)).toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if the role is unknown or not included in permissions', () => {
      const meta = {
        role: RoleEnum.Client, // Not defined in rolePermissions
        targetRoles: [RoleEnum.BranchManager],
      };

      expect(() => service.checkRolePermissions(rolePermissions, meta)).toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if one of target roles is not allowed', () => {
      const meta = {
        role: RoleEnum.HeadOfBranch,
        targetRoles: [RoleEnum.BranchManager, RoleEnum.Admin],
      };

      expect(() => service.checkRolePermissions(rolePermissions, meta)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('UsersService: checkBranchesPermissions', () => {
    it('should not throw for Admin role regardless of branch match', () => {
      const meta = {
        role: RoleEnum.Admin,
        branchId: 1,
        targetRoles: [RoleEnum.Client],
        targetBranches: [{ branchId: 2, role: RoleEnum.Client }],
      };

      expect(() => service.checkBranchesPermissions(meta)).not.toThrow();
    });

    it('should throw if role is not Admin and branch IDs do not match', () => {
      const meta = {
        role: RoleEnum.BranchManager,
        branchId: 1,
        targetRoles: [RoleEnum.Client],
        targetBranches: [
          { branchId: 2, role: RoleEnum.Client }, // Different branch ID
        ],
      };

      expect(() => service.checkBranchesPermissions(meta)).toThrow(
        BadRequestException,
      );
    });

    it('should throw if role is not Admin and roles do not match', () => {
      const meta = {
        role: RoleEnum.BranchManager,
        branchId: 1,
        targetRoles: [RoleEnum.ClientRepresentative], // Targeting ClientRepresentative
        targetBranches: [
          { branchId: 1, role: RoleEnum.Client }, // Available role is Client
        ],
      };

      expect(() => service.checkBranchesPermissions(meta)).toThrow(
        BadRequestException,
      );
    });

    it('should not throw if roles and branch IDs match', () => {
      const meta = {
        role: RoleEnum.HeadOfBranch,
        branchId: 1,
        targetRoles: [RoleEnum.BranchManager],
        targetBranches: [{ branchId: 1, role: RoleEnum.BranchManager }],
      };

      expect(() => service.checkBranchesPermissions(meta)).not.toThrow();
    });

    it('should handle multiple branch permissions correctly', () => {
      const meta = {
        role: RoleEnum.HeadOfBranch,
        branchId: 1,
        targetRoles: [RoleEnum.Client, RoleEnum.ClientRepresentative],
        targetBranches: [
          { branchId: 1, role: RoleEnum.Client },
          { branchId: 1, role: RoleEnum.ClientRepresentative },
        ],
      };

      expect(() => service.checkBranchesPermissions(meta)).not.toThrow();
    });

    it('should handle multiple branch permissions correctly (throw if roles mismatch)', () => {
      const meta = {
        role: RoleEnum.HeadOfBranch,
        branchId: 1,
        targetRoles: [RoleEnum.Client, RoleEnum.ClientRepresentative],
        targetBranches: [
          { branchId: 1, role: RoleEnum.Client },
          { branchId: 1, role: RoleEnum.BranchManager },
        ],
      };

      expect(() => service.checkBranchesPermissions(meta)).toThrow();
    });

    it('should throw if branches empty', () => {
      const meta = {
        role: RoleEnum.HeadOfBranch,
        branchId: 1,
        targetRoles: [RoleEnum.Client, RoleEnum.ClientRepresentative],
        targetBranches: [],
      };

      expect(() => service.checkBranchesPermissions(meta)).toThrow();
    });
  });

  describe('UsersService: createInitialAccount', () => {
    it('should successfully create initial account under branch', async () => {
      const userId = 1;

      accountsServiceClientMock.send.mockReturnValue(of({ ok: true }));

      const result = await service.createInitialAccount(userId);
      expect(result).toEqual({ ok: true });
      expect(accountsServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'create_account' },
        { userId },
      );
    });

    it('should handle errors from the accounts service client', async () => {
      const userId = 1;

      accountsServiceClientMock.send.mockReturnValue(
        throwError(() => new Error('Service failure')),
      );

      await expect(service.createInitialAccount(userId)).rejects.toThrow(
        'Service failure',
      );
      expect(accountsServiceClientMock.send).toHaveBeenCalled();
    });
  });

  describe('confirmCodeFromEmail', () => {
    const email = 'test@test.com';
    const code = '123456';
    const type = 'SIGN_VERIFICATION_DOCUMENTS';
    const userId = 1;

    it('should confirm the code if it exists', async () => {
      verifyServiceClientMock.send.mockReturnValue(of(true));

      const result = await service.confirmCodeFromEmail(
        email,
        userId,
        code,
        type,
      );

      expect(result).toBe(true);
      expect(verifyServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'verify_otp_by_email' },
        { email, code, type, userId },
      );
    });

    it('should reject if code confirmation fails', async () => {
      verifyServiceClientMock.send.mockReturnValue(of(false));

      const result = await service.confirmCodeFromEmail(
        email,
        userId,
        code,
        type,
      );

      expect(result).toBe(false);
      expect(verifyServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'verify_otp_by_email' },
        { email, code, type, userId },
      );
    });
  });

  describe('verificationMeta', () => {
    const userId = 1;

    it('should return URL if document of type ApplicationFormForNaturalPersons is found', async () => {
      const document = { fileId: 'fileId' };
      const fileUrl = 'http://example.com/document-url';

      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(prismaMock);
      });

      prismaMock.document.findFirst.mockResolvedValue(document as any);
      service.getFilesUrls = jest.fn().mockResolvedValue([{ url: fileUrl }]);

      const result = await service.verificationMeta(userId);
      expect(result).toEqual({ applicationFormForNaturalPersons: fileUrl });
    });

    it('should return null if required fields are missing in the profiles', async () => {
      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(prismaMock);
      });

      prismaMock.document.findFirst.mockResolvedValue(null);
      prismaMock.economicProfile.findUnique.mockResolvedValue({
        marketExperience: null,
      } as any);
      prismaMock.taxPayerProfile.findUnique.mockResolvedValue({} as any);
      prismaMock.passport.findUnique.mockResolvedValue({
        citizenshipCountryCode: 'US',
      } as any);
      prismaMock.location.findUnique.mockResolvedValue({
        countryCode: 'US',
      } as any);
      prismaMock.user.findUnique.mockResolvedValue({
        firstName: null,
        middleName: null,
        lastName: null,
        birthdate: null,
        auth: { phone: '1234567890', email: 'test@example.com' },
      } as any);

      countriesServiceMock.findCountryByCountryCode.mockReturnValue([
        'US',
        { name: 'United States' } as Country,
      ]);

      service.getFilesUrls = jest.fn().mockResolvedValue([]);
      service.makeDocument = jest.fn().mockResolvedValue({ id: 1, url: null });

      const result = await service.verificationMeta(userId);
      expect(result).toEqual({ applicationFormForNaturalPersons: null });
    });

    it('should create a new document and return its URL if no existing document is found', async () => {
      const fileUrl = 'http://example.com/new-document-url';
      const newDocument = { id: 'newFileId', url: fileUrl };

      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(prismaMock);
      });

      prismaMock.document.findFirst.mockResolvedValue(null);
      prismaMock.economicProfile.findUnique.mockResolvedValue({
        marketExperience: 'Advanced',
        investedInstruments: ['Stocks'],
        investmentDuration: 'Long-term',
        educationLevel: 'Bachelor',
        investmentGoals: 'Growth',
        tradeFrequency: 'Frequent',
        expectedTurnover: 10000,
        sourceOfFunds: ['Savings'],
        annualIncome: 50000,
        initialInvestment: 10000,
        totalAssetValue: 100000,
        employerNameAddress: 'Company Address',
        industrySector: 'IT',
        fundTransferOrigin: 'Bank',
        expectedTransferDestination: 'Investment',
        politicallyExposed: false,
        usaResident: false,
      } as any);
      prismaMock.taxPayerProfile.findUnique.mockResolvedValue({
        individualTaxpayerNumber: '123456789',
        taxResidency: 'US',
      } as any);
      prismaMock.passport.findUnique.mockResolvedValue({
        citizenshipCountryCode: 'US',
        documentNumber: '123456',
        authorityDate: new Date(),
      } as any);
      prismaMock.location.findUnique.mockResolvedValue({
        countryCode: 'US',
        countryOfResidenceCode: 'US',
        address: '123 Main St',
      } as any);
      prismaMock.user.findUnique.mockResolvedValue({
        firstName: 'John',
        middleName: 'A',
        lastName: 'Doe',
        birthdate: new Date(),
        auth: { phone: '1234567890', email: 'john.doe@example.com' },
      } as any);

      countriesServiceMock.findCountryByCountryCode.mockReturnValue([
        'US',
        { name: 'United States' } as Country,
      ]);

      service.makeDocument = jest.fn().mockResolvedValue(newDocument);

      const result = await service.verificationMeta(userId);
      expect(result).toEqual({ applicationFormForNaturalPersons: fileUrl });
    });
  });

  describe('makePassword', () => {
    const password = 'password123';
    const salt = 'salt123';

    it('should successfully hash the password', async () => {
      const hashedPassword = 'hashedPassword123';

      // @ts-expect-error mock Buffer
      passwordServiceMock.generateSalt.mockResolvedValue(salt);
      passwordServiceMock.hashPassword.mockResolvedValue(hashedPassword);

      const result = await service.makePassword(password);

      expect(result).toEqual(hashedPassword);
      expect(passwordServiceMock.generateSalt).toHaveBeenCalled();
      expect(passwordServiceMock.hashPassword).toHaveBeenCalledWith(
        password,
        salt,
      );
    });

    it('should throw an error if hashing fails', async () => {
      const errorMessage = 'Hashing failed';

      // @ts-expect-error mock Buffer
      passwordServiceMock.generateSalt.mockResolvedValue(salt);
      passwordServiceMock.hashPassword.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service.makePassword(password)).rejects.toThrow(
        errorMessage,
      );
      expect(passwordServiceMock.generateSalt).toHaveBeenCalled();
      expect(passwordServiceMock.hashPassword).toHaveBeenCalledWith(
        password,
        salt,
      );
    });
  });

  describe('getUpdateValue', () => {
    it('should return originalValue if isSelfUpdate is true', () => {
      const result = getUpdateValue(true, { key: 'new' }, { key: 'original' });
      expect(result).toEqual({ key: 'original' });
    });

    it('should return newValue if isSelfUpdate is false and newValue is not null', () => {
      const result = getUpdateValue(false, { key: 'new' }, { key: 'original' });
      expect(result).toEqual({ key: 'new' });
    });

    it('should return originalValue if isSelfUpdate is false and newValue is null', () => {
      const result = getUpdateValue(false, null, { key: 'original' });
      expect(result).toEqual({ key: 'original' });
    });
  });

  describe('updateCountryCode', () => {
    const mockServiceMethod = jest.fn();

    it('should update the country code in the input object', () => {
      mockServiceMethod.mockReturnValueOnce(['US', { name: 'United States' }]);

      const update = updateCountryCode('countryCode', mockServiceMethod);
      const input = { countryCode: 'US', otherKey: 'value' };
      const result = update(input);

      expect(result).toEqual({ countryCode: 'US', otherKey: 'value' });
      expect(mockServiceMethod).toHaveBeenCalledWith('US');
    });
  });

  describe('constructUpsert', () => {
    it('should return upsert object if data is provided', () => {
      const data = { key: 'value' };
      const result = constructUpsert(data);

      expect(result).toEqual({
        upsert: {
          create: data,
          update: data,
        },
      });
    });

    it('should return empty object if data is null or undefined', () => {
      const result1 = constructUpsert(null);
      const result2 = constructUpsert(undefined);

      expect(result1).toEqual({});
      expect(result2).toEqual({});
    });
  });

  describe('makePassport', () => {
    const mockServiceMethod = jest.fn();
    const passport = {
      citizenshipCountryCode: 'US',
      originCountryCode: 'CA',
    } as any;
    const originalPassport = {
      citizenshipCountryCode: 'GB',
      originCountryCode: 'FR',
    } as any;

    it('should construct upsert object correctly', () => {
      mockServiceMethod
        .mockReturnValueOnce(['CA', { name: 'United States' }])
        .mockReturnValueOnce(['US', { name: 'Canada' }]);

      const result = makePassport({
        isSelfUpdate: false,
        passport,
        originalPassport,
        serviceMethod: mockServiceMethod,
      });

      expect(result).toEqual({
        upsert: {
          create: {
            citizenshipCountryCode: 'US',
            originCountryCode: 'CA',
          },
          update: {
            citizenshipCountryCode: 'US',
            originCountryCode: 'CA',
          },
        },
      });
    });
  });

  describe('makeLocation', () => {
    const mockServiceMethod = jest.fn();
    const location = { countryOfResidenceCode: 'US' } as any;
    const originalLocation = { countryOfResidenceCode: 'GB' } as any;

    it('should construct upsert object correctly', () => {
      mockServiceMethod.mockReturnValueOnce(['US', { name: 'United States' }]);

      const result = makeLocation({
        isSelfUpdate: false,
        location,
        originalLocation,
        serviceMethod: mockServiceMethod,
      });

      expect(result).toEqual({
        upsert: {
          create: {
            countryOfResidenceCode: 'US',
          },
          update: {
            countryOfResidenceCode: 'US',
          },
        },
      });
    });
  });

  describe('assignClientToSalesManager', () => {
    it('should throw error if any mandatory field is missing', async () => {
      const params = { userId: 0, managerId: 0, branchId: 0, initiatorId: 0 };
      await expect(service.assignClientToSalesManager(params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if initiator does not have rights in the branch', async () => {
      const params = { userId: 1, managerId: 2, branchId: 1, initiatorId: 3 };
      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(prismaMock);
      });

      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.assignClientToSalesManager(params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if the user is not found', async () => {
      const params = { userId: 1, managerId: 2, branchId: 1, initiatorId: 3 };
      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(prismaMock);
      });

      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 3 })
        .mockResolvedValueOnce(null);

      await expect(service.assignClientToSalesManager(params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if the manager is not found or not a sales manager', async () => {
      const params = { userId: 1, managerId: 2, branchId: 1, initiatorId: 3 };
      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(prismaMock);
      });

      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 3 })
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce(null);

      await expect(service.assignClientToSalesManager(params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully assign a client to a sales manager', async () => {
      const params = { userId: 1, managerId: 2, branchId: 1, initiatorId: 3 };
      prismaMock.$transaction.mockImplementationOnce(async (callback) => {
        return callback(prismaMock);
      });

      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 3 })
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({
          id: 2,
          auth: { roles: [{ role: { slug: RoleEnum.SalesManager } }] },
        });

      prismaMock.user.update.mockResolvedValue({ id: 1, managerId: 2 });

      const result = await service.assignClientToSalesManager(params);
      expect(result).toEqual({ id: 1, managerId: 2 });
    });
  });
});
