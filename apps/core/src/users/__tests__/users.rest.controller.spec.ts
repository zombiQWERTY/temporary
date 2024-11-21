import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { omitDeep, RoleEnum } from '@erp-modul/shared';
import { BadRequestException } from '@nestjs/common';

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
  USTaxResident,
} from '../../../prisma/client';
import { UsersRestController } from '../users.rest.controller';
import { UsersService } from '../users.service';
import { ProvidePassportToVerificationRequestDto } from '../request-dto/providePassportToVerificationRequestDto';
import { ProvideLocationToVerificationRequestDto } from '../request-dto/provideLocationToVerificationRequestDto';
import { ProvideEconomicToVerificationRequestDto } from '../request-dto/provideEconomicToVerificationRequestDto';
import { ProvideTaxToVerificationRequestDto } from '../request-dto/provideTaxToVerificationRequestDto';
import { ConfirmVerificationRequestDto } from '../request-dto/confirmVerificationRequest.dto';

const CLIENT_RECORD = {
  id: 1,
  accountStatus: AccountStatusEnum.VerificationInProgress,
  firstName: undefined,
  middleName: undefined,
  lastName: undefined,
  birthdate: undefined,
  workPhone: undefined,
  createdById: undefined,
  countryCode: undefined,
  lang: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  branches: [],
  auth: {
    roles: [],
    id: 1,
    phone: 'string',
    email: 'string',
    phoneConfirmed: false,
    emailConfirmed: false,
    phoneConfirmedAt: new Date(),
    emailConfirmedAt: new Date(),
    password: 'string',
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

const META = { userId: 1, authId: 1, branchId: 1, role: RoleEnum.Client };

describe('UsersRestController', () => {
  let usersRestController: UsersRestController;
  let usersServiceMock: DeepMockProxy<UsersService>;

  beforeEach(async () => {
    usersServiceMock = mockDeep<UsersService>();

    const moduleRef = await Test.createTestingModule({
      controllers: [UsersRestController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    usersRestController =
      moduleRef.get<UsersRestController>(UsersRestController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('myProfile', () => {
    it('should return a user profile', async () => {
      usersServiceMock.getUserProfile.mockResolvedValue(CLIENT_RECORD as any);

      const result = await usersRestController.myProfile(META);

      expect(usersServiceMock.getUserProfile).toHaveBeenCalledWith(
        META,
        META.userId,
      );
      expect(result).toEqual({
        ...CLIENT_RECORD,
      });
    });
  });

  describe('internal myProfile', () => {
    it('should return a user profile for internal use', async () => {
      const record = omitDeep(CLIENT_RECORD, [
        'password',
        'userId',
        'updatedAt',
      ]);
      usersServiceMock.internalUserProfile.mockResolvedValue(record as any);

      const result = await usersRestController.internalMyProfile(META.userId);

      expect(usersServiceMock.internalUserProfile).toHaveBeenCalledWith(
        META.userId,
      );

      expect(result).toEqual({
        profile: record,
      });
    });
  });

  describe('throwErrorIfNotVerified', () => {
    it('should throw error if user is not verified', async () => {
      usersServiceMock.throwErrorIfNotVerified.mockRejectedValue(
        new BadRequestException(),
      );

      const result = usersRestController.throwErrorIfNotVerified(META);

      expect(usersServiceMock.throwErrorIfNotVerified).toHaveBeenCalledWith(
        META.userId,
        META.role,
      );

      await expect(result).rejects.toThrow(BadRequestException);
    });

    it('should not throw error if user is verified', async () => {
      usersServiceMock.throwErrorIfNotVerified.mockResolvedValue({ ok: true });

      const result = await usersRestController.throwErrorIfNotVerified(META);

      expect(usersServiceMock.throwErrorIfNotVerified).toHaveBeenCalledWith(
        META.userId,
        META.role,
      );

      expect(result).toEqual({ ok: true });
    });
  });

  describe('updateMyProfile', () => {
    it('should update and return the user profile', async () => {
      const updateDto = { firstName: 'new first name' };
      usersServiceMock.updateUserProfile.mockResolvedValue(
        CLIENT_RECORD as any,
      );

      const result = await usersRestController.updateMyProfile(META, updateDto);

      expect(usersServiceMock.updateUserProfile).toHaveBeenCalledWith(
        META,
        META.userId,
        updateDto,
      );
      expect(result).toEqual(CLIENT_RECORD);
    });
  });

  describe('createUserProfile', () => {
    it('should create a user profile', async () => {
      const createDto = {
        phone: '1234567890',
        email: 'test@test.com',
        password: '123123123',
        roles: [RoleEnum.Client],
      };
      const expectedResponse = { ok: true };
      usersServiceMock.createUserProfile.mockResolvedValue(expectedResponse);

      const result = await usersRestController.createUserProfile(
        META,
        createDto,
      );

      expect(usersServiceMock.createUserProfile).toHaveBeenCalledWith(
        META,
        createDto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('GetProfileList', () => {
    it('should return a list of user profiles', async () => {
      const skip = 0;
      const take = 20;

      const expectedList = {
        skip,
        take,
        list: [CLIENT_RECORD as any],
      };
      usersServiceMock.getProfilesList.mockResolvedValue(expectedList.list);

      const result = await usersRestController.GetProfileList(
        META,
        skip,
        RoleEnum.Client,
      );

      expect(usersServiceMock.getProfilesList).toHaveBeenCalledWith({
        meta: META,
        skip,
        take,
        targetRole: RoleEnum.Client,
      });
      expect(result).toEqual(expectedList);
    });
  });

  describe('changeAccountStatus', () => {
    it('should change the account status of a user', async () => {
      const recipientId = 1;
      const branchId = 1;
      const dto = { status: AccountStatusEnum.VerificationInProgress };
      usersServiceMock.changeAccountStatus.mockResolvedValue(
        CLIENT_RECORD as any,
      );

      const result = await usersRestController.changeAccountStatus(
        recipientId,
        dto,
        META,
      );

      expect(usersServiceMock.changeAccountStatus).toHaveBeenCalledWith({
        userId: recipientId,
        status: dto.status,
        branchId,
        managerId: META.userId,
        role: META.role,
      });
      expect(result).toEqual(CLIENT_RECORD);
    });
  });

  describe('assignClientToSalesManager', () => {
    it('should assign new sales manager to client', async () => {
      const recipientId = 1;
      const managerId = 2;
      usersServiceMock.assignClientToSalesManager.mockResolvedValue(
        CLIENT_RECORD as any,
      );

      const result = await usersRestController.assignClientToSalesManager(
        recipientId,
        managerId,
        META,
      );

      expect(usersServiceMock.assignClientToSalesManager).toHaveBeenCalledWith({
        userId: recipientId,
        managerId: managerId,
        branchId: META.branchId,
        initiatorId: META.userId,
      });
      expect(result).toEqual({ ok: true });
    });
  });

  describe('getProfile', () => {
    it('should fetch and return the user profile by provided id', async () => {
      usersServiceMock.getUserProfile.mockResolvedValue(CLIENT_RECORD as any);

      const result = await usersRestController.getProfile(
        META,
        CLIENT_RECORD.id,
      );
      expect(result).toEqual(CLIENT_RECORD);
      expect(usersServiceMock.getUserProfile).toHaveBeenCalledWith(
        META,
        CLIENT_RECORD.id,
      );
    });
  });

  describe('providePassportToVerification', () => {
    it('should provide documents for verification', async () => {
      const fileIds = [1, 2, 3];
      const dto: ProvidePassportToVerificationRequestDto = {
        authority: 'test',
        authorityDate: new Date().toDateString(),
        citizenshipCountryCode: 'US',
        documentNumber: '001',
        placeOfBirth: '',
        originCountryCode: 'US',
        noExpirationDate: true,
        expiryAt: null,
        firstPackFileIds: fileIds,
        secondPackFileIds: fileIds,
      };

      usersServiceMock.providePassportToVerification.mockResolvedValue(void 0);

      const result = await usersRestController.providePassportToVerification(
        dto,
        META,
      );

      expect(
        usersServiceMock.providePassportToVerification,
      ).toHaveBeenCalledWith(META.userId, dto);
      expect(result).toEqual(void 0);
    });
  });

  describe('provideLocationToVerification', () => {
    it('should provide documents for verification', async () => {
      const fileIds = [1, 2, 3];
      const dto: ProvideLocationToVerificationRequestDto = {
        city: '',
        zipCode: '',
        street: '',
        region: '',
        flatNo: '',
        streetNo: '',
        countryOfResidenceCode: 'US',
        fileIds,
      };

      usersServiceMock.provideLocationToVerification.mockResolvedValue(void 0);

      const result = await usersRestController.provideLocationToVerification(
        dto,
        META,
      );

      expect(
        usersServiceMock.provideLocationToVerification,
      ).toHaveBeenCalledWith(META.userId, dto);
      expect(result).toEqual(void 0);
    });
  });

  describe('provideTaxToVerification', () => {
    it('should provide documents for verification', async () => {
      const fileIds = [1, 2, 3];
      const dto: ProvideTaxToVerificationRequestDto = {
        individualTaxpayerNumber: '123456789',
        taxResidency: 'EN',
        isUSTaxResident: USTaxResident.Yes,
        howDidYouHearAboutUs: SourceOfInfo.FromOnlineAdvertisements,
        fileIds,
      };

      usersServiceMock.provideTaxToVerification.mockResolvedValue(void 0);

      const result = await usersRestController.provideTaxToVerification(
        dto,
        META,
      );

      expect(usersServiceMock.provideTaxToVerification).toHaveBeenCalledWith(
        META.userId,
        dto,
      );
      expect(result).toEqual(void 0);
    });
  });

  describe('provideExtraToVerification', () => {
    it('should provide documents for verification', async () => {
      const fileIds = [1, 2, 3];

      usersServiceMock.provideExtraToVerification.mockResolvedValue(void 0);

      const result = await usersRestController.provideExtraToVerification(
        { fileIds },
        META,
      );

      expect(usersServiceMock.provideExtraToVerification).toHaveBeenCalledWith(
        META.userId,
        fileIds,
      );
      expect(result).toEqual(void 0);
    });
  });

  describe('provideEconomicToVerification', () => {
    it('should provide documents for verification', async () => {
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

      usersServiceMock.provideEconomicToVerification.mockResolvedValue(void 0);

      const result = await usersRestController.provideEconomicToVerification(
        dto,
        META,
      );

      expect(
        usersServiceMock.provideEconomicToVerification,
      ).toHaveBeenCalledWith(META.userId, dto);
      expect(result).toEqual(void 0);
    });
  });

  describe('UsersRestController - confirmVerification', () => {
    it('should confirm verification for the user', async () => {
      const dto: ConfirmVerificationRequestDto = {
        agreedToApplicationTerms: true,
        agreedToServiceGeneralRules: true,
        agreedToClaimsRegistrationRules: true,
        agreedToMarginTradesRules: true,
        code: '0000',
      };

      usersServiceMock.confirmVerification.mockResolvedValue(void 0);

      const result = await usersRestController.confirmVerification(dto, META);

      expect(usersServiceMock.confirmVerification).toHaveBeenCalledWith(
        META.userId,
        dto,
      );
      expect(result).toEqual(void 0);
    });
  });

  describe('getUsersWithDocuments', () => {
    const defaultTake = 20;
    const scenarios = [
      {
        skip: 0,
        search: '',
        phone: '',
        accountStatus: null,
        branchId: META.branchId,
      },
      {
        skip: 0,
        search: 'John',
        phone: '',
        accountStatus: AccountStatusEnum.VerificationInProgress,
        branchId: META.branchId,
      },
      {
        skip: 10,
        search: '',
        phone: '',
        accountStatus: AccountStatusEnum.VerificationInProgress,
        branchId: META.branchId,
      },
      {
        skip: 0,
        search: '',
        phone: '1234567890',
        accountStatus: null,
        branchId: META.branchId,
      },
      {
        skip: 0,
        search: '',
        phone: '',
        accountStatus: AccountStatusEnum.Verified,
        branchId: META.branchId,
      },
      { skip: 0, search: '', phone: '', accountStatus: null, branchId: 2 },
    ];

    scenarios.forEach(({ skip, search, phone, accountStatus, branchId }) => {
      it(`should return users with documents (skip: ${skip}, search: "${search}", phone: "${phone}", accountStatus: ${accountStatus}, branchId: ${branchId})`, async () => {
        const expectedUsers = [
          {
            ...CLIENT_RECORD,
            branches: [],
            auth: {
              roles: [],
              id: 1,
              phone: 'string',
              email: 'string',
              phoneConfirmed: false,
              emailConfirmed: false,
              phoneConfirmedAt: new Date(),
              emailConfirmedAt: new Date(),
              password: 'string',
              userId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            passport: {
              id: 1,
              userId: 1,
              authority: 'test',
              authorityDate: new Date(),
              citizenshipCountryCode: 'US',
              documentNumber: '001',
            },
            location: {
              id: 1,
              userId: 1,
              address: '',
              city: '',
              countryCode: '',
              zipCode: '',
            },
            countUnverifiedDocuments: 1,
            documents: [
              {
                url: 1,
                id: 1,
                type: 'Identity' as DocumentTypeEnum,
                isReviewed: false,
                reviewedAt: new Date(),
              },
            ],
          },
        ];
        usersServiceMock.getUsersWithDocuments.mockResolvedValue(
          expectedUsers as any[],
        );

        const result = await usersRestController.getUsersWithDocuments(
          skip,
          search,
          phone,
          true,
          accountStatus,
          {
            ...META,
            branchId,
          },
        );

        expect(usersServiceMock.getUsersWithDocuments).toHaveBeenCalledWith({
          take: defaultTake,
          skip,
          search,
          phone,
          accountStatus,
          branchId,
          needDataVerification: true,
        });
        expect(result).toEqual({ users: expectedUsers });
      });
    });
  });

  describe('searchUsers', () => {
    const defaultTake = 20;
    it(`should return users`, async () => {
      const expectedUsers = [
        {
          ...CLIENT_RECORD,
        },
      ];

      usersServiceMock.searchUsers.mockResolvedValue(expectedUsers as any[]);

      const result = await usersRestController.searchUsers(
        RoleEnum.HeadOfBranch,
        'search',
        META,
      );

      expect(usersServiceMock.searchUsers).toHaveBeenCalledWith({
        take: defaultTake,
        skip: 0,
        term: 'search',
        role: RoleEnum.HeadOfBranch,
        branchId: META.branchId,
      });

      expect(result).toEqual({ users: expectedUsers });
    });
  });

  describe('verificateDocument', () => {
    it('should verificate user document', async () => {
      const result = await usersRestController.verificateDocument(
        CLIENT_RECORD.id,
        1,
        { verified: true },
        META,
      );

      expect(usersServiceMock.verificateDocument).toHaveBeenCalledWith(
        CLIENT_RECORD.id,
        1,
        META.branchId,
        META.userId,
        true,
      );
      expect(result).toEqual({ ok: true });
    });
  });

  describe('verificationMeta', () => {
    it('should show verification meta', async () => {
      usersServiceMock.verificationMeta.mockResolvedValue({
        applicationFormForNaturalPersons: 'https://example.com',
      });
      const result = await usersRestController.verificationMeta(META);

      expect(usersServiceMock.verificationMeta).toHaveBeenCalledWith(
        CLIENT_RECORD.id,
      );
      expect(result).toEqual({
        applicationFormForNaturalPersons: 'https://example.com',
      });
    });
  });
});
