import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Country } from 'country-list-js';
import { PrismaClient } from '@prisma/client';

import { AuthSignUpService } from '../auth.signup.service';
import { PrismaService } from '../../../services/prisma.service';
import { PasswordService } from '../../../services/password.service';
import { AuthTriggersService } from '../../auth.triggers.service';
import { CountriesService } from '../../../countries/countries.service';
import { BranchesService } from '../../../branches/branches.service';
import { Prisma } from '../../../../prisma/client';
import { AuthCommonService } from '../../auth.common.service';
import { RoleEnum } from '@erp-modul/shared';

describe('AuthSignUpService', () => {
  let service: AuthSignUpService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let passwordServiceMock: DeepMockProxy<PasswordService>;
  let authCommonServiceMock: DeepMockProxy<AuthCommonService>;
  let branchesServiceMock: DeepMockProxy<BranchesService>;
  let countriesServiceMock: DeepMockProxy<CountriesService>;

  const authTriggersServiceMock = {
    postRegistration: jest.fn(),
    postConfirmRegisteredPhone: jest.fn(),
    postConfirmRegisteredEmail: jest.fn(),
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    passwordServiceMock = mockDeep<PasswordService>();
    authCommonServiceMock = mockDeep<AuthCommonService>();
    branchesServiceMock = mockDeep<BranchesService>();
    countriesServiceMock = mockDeep<CountriesService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthSignUpService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PasswordService, useValue: passwordServiceMock },
        { provide: AuthTriggersService, useValue: authTriggersServiceMock },
        { provide: CountriesService, useValue: countriesServiceMock },
        { provide: BranchesService, useValue: branchesServiceMock },
        { provide: AuthCommonService, useValue: authCommonServiceMock },
      ],
    }).compile();

    service = module.get(AuthSignUpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkAuthExists', () => {
    const dto = { phone: '1234567890', email: 'test@example.com' };

    it('should throw BadRequestException if auth exists', async () => {
      prismaMock.auth.findFirst.mockResolvedValue({ id: 1 });

      await expect(service['checkAuthExists'](dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not throw if auth does not exist', async () => {
      prismaMock.auth.findFirst.mockResolvedValue(null);

      await expect(service['checkAuthExists'](dto)).resolves.not.toThrow();
    });

    it('should query Prisma for phone or email', async () => {
      prismaMock.auth.findFirst.mockResolvedValue(null);

      await service['checkAuthExists'](dto);
      expect(prismaMock.auth.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ phone: dto.phone }, { email: dto.email }] },
      });
    });
  });

  describe('postConfirmationTrigger', () => {
    const auth = { id: 1 } as any;

    it('should call postConfirmRegisteredEmail if method is email', () => {
      service['postConfirmationTrigger'](auth, 'email');
      expect(
        authTriggersServiceMock.postConfirmRegisteredEmail,
      ).toHaveBeenCalledWith(auth);
    });

    it('should call postConfirmRegisteredPhone if method is sms', () => {
      service['postConfirmationTrigger'](auth, 'sms');
      expect(
        authTriggersServiceMock.postConfirmRegisteredPhone,
      ).toHaveBeenCalledWith(auth);
    });
  });

  describe('register', () => {
    const dto = { phone: '1234567890', email: 'test@example.com' };
    const otpResponse = { code: '111111', ttl: 30000 };

    it('should call checkAuthExists and postRegistration', async () => {
      prismaMock.auth.findFirst.mockResolvedValue(null);
      authCommonServiceMock.sendOtpCall.mockResolvedValue(otpResponse);
      authTriggersServiceMock.postRegistration.mockImplementation(
        () => undefined,
      );

      const result = await service.register(dto);

      expect(result).toEqual(otpResponse);
      expect(authTriggersServiceMock.postRegistration).toHaveBeenCalledWith(
        dto,
      );
    });

    it('should throw BadRequestException if auth exists', async () => {
      prismaMock.auth.findFirst.mockResolvedValue({ id: 1 } as any);

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('should call sendOtpCall with email identifier', async () => {
      prismaMock.auth.findFirst.mockResolvedValue(null);
      authCommonServiceMock.sendOtpCall.mockResolvedValue(otpResponse);

      await service.register(dto);

      expect(authCommonServiceMock.sendOtpCall).toHaveBeenCalledWith({
        identifier: dto.email,
        type: 'SIGN_UP',
        method: 'email',
      });
    });
  });

  describe('confirmRegistered', () => {
    const args = {
      dto: {
        phone: '1234567890',
        email: 'test@example.com',
        password: 'password',
      },
      inviteTags: {
        branchId: null,
        managerId: null,
        countryCode: null,
        lang: null,
      },
      utmTags: {} as Prisma.UserSourceTrackingCreateWithoutUserInput,
      code: '1234',
      method: 'email' as const,
    };

    it('should throw BadRequestException if OTP verification fails', async () => {
      jest
        .spyOn(service as any, 'checkAuthExists')
        .mockResolvedValue(undefined);
      authCommonServiceMock.verifyOtpCall.mockResolvedValue(false);

      await expect(service.confirmRegistered(args)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return { ok: true } if OTP verification succeeds', async () => {
      jest
        .spyOn(service as any, 'checkAuthExists')
        .mockResolvedValue(undefined);
      authCommonServiceMock.verifyOtpCall.mockResolvedValue(true);
      jest
        .spyOn(service as any, 'createAuthWithRole')
        .mockResolvedValue({} as any);

      const result = await service.confirmRegistered(args);

      expect(result).toEqual({ ok: true });
    });

    it('should call postConfirmationTrigger with the correct method', async () => {
      jest
        .spyOn(service as any, 'checkAuthExists')
        .mockResolvedValue(undefined);
      authCommonServiceMock.verifyOtpCall.mockResolvedValue(true);

      const postConfirmationSpy = jest.spyOn(
        service as any,
        'postConfirmationTrigger',
      );
      const authMock = { id: 1 } as any;
      jest
        .spyOn(service as any, 'createAuthWithRole')
        .mockResolvedValue(authMock);

      await service.confirmRegistered(args);

      expect(postConfirmationSpy).toHaveBeenCalledWith(authMock, 'email');
    });
  });

  describe('createAuthWithRole', () => {
    it('should create auth and assign roles', async () => {
      authCommonServiceMock.runInTransaction.mockImplementation(
        (tx) => (cb) => cb(tx),
      );
      authCommonServiceMock.makePassword.mockResolvedValue('hashedPassword');
      countriesServiceMock.findCountryByCountryCode.mockReturnValue([
        'US',
        {} as Country,
      ]);

      prismaMock.auth.create.mockResolvedValue({ id: 1, userId: 2 } as any);
      prismaMock.role.findMany.mockResolvedValue([{ id: 1 }] as any);

      const result = await service['createAuthWithRole']({
        dto: {
          phone: '1234567890',
          email: 'test@example.com',
          password: 'password',
        },
        roles: [RoleEnum.Client],
      });

      expect(result).toEqual({ id: 1, userId: 2 });
      expect(prismaMock.auth.create).toHaveBeenCalled();
    });
  });
});
