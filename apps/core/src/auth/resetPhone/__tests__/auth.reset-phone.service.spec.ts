import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

import { AuthResetPhoneService } from '../auth.reset-phone.service';
import { PrismaService } from '../../../services/prisma.service';
import { AuthTriggersService } from '../../auth.triggers.service';
import { AuthCommonService } from '../../auth.common.service';
import { Auth } from '../../../../prisma/client';

describe('AuthResetPhoneService', () => {
  let service: AuthResetPhoneService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let authTriggersServiceMock: DeepMockProxy<AuthTriggersService>;
  let authCommonServiceMock: DeepMockProxy<AuthCommonService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    authTriggersServiceMock = mockDeep<AuthTriggersService>();
    authCommonServiceMock = mockDeep<AuthCommonService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResetPhoneService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuthTriggersService, useValue: authTriggersServiceMock },
        { provide: AuthCommonService, useValue: authCommonServiceMock },
      ],
    }).compile();

    service = module.get<AuthResetPhoneService>(AuthResetPhoneService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('resetPhone', () => {
    const where = { id: 1 };
    const mockAuth = { id: 1, userId: 1, phone: '+79999999999' };
    const mockOtpResponse = { code: '123456', ttl: 300 };

    it('should send an OTP for phone reset successfully', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);
      authCommonServiceMock.sendOtpCall.mockResolvedValue(mockOtpResponse);

      const result = await service.resetPhone(where);

      expect(result).toEqual(mockOtpResponse);
      expect(prismaMock.auth.findUnique).toHaveBeenCalledWith({ where });
      expect(authCommonServiceMock.sendOtpCall).toHaveBeenCalledWith({
        identifier: mockAuth.phone,
        userId: mockAuth.userId,
        type: 'RESET_PHONE',
        method: 'sms',
      });
    });

    it('should throw an error if auth does not exist', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(null);

      await expect(service.resetPhone(where)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resetPhone(where)).rejects.toThrow(
        'Auth does not exist',
      );
    });
  });

  describe('confirmResetPhone', () => {
    const where = { id: 1 };
    const newPhone = 'test2@test.com';
    const code = '123456';
    const mockAuth = { id: 1, userId: 1, phone: '+79999999999' } as Auth;
    const updatedAuth = {
      ...mockAuth,
      phone: newPhone,
      phoneConfirmed: true,
      phoneConfirmedAt: new Date(),
    };

    it('should confirm phone reset successfully', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);
      authCommonServiceMock.verifyOtpCall.mockResolvedValue(true);
      prismaMock.auth.update.mockResolvedValue(updatedAuth);

      const result = await service.confirmResetPhone(where, newPhone, code);

      expect(result).toEqual({ ok: true });
      expect(prismaMock.auth.findUnique).toHaveBeenCalledWith({ where });
      expect(authCommonServiceMock.verifyOtpCall).toHaveBeenCalledWith({
        code,
        method: 'sms',
        type: 'RESET_PHONE',
        userId: mockAuth.userId,
        identifier: mockAuth.phone,
      });
      expect(prismaMock.auth.update).toHaveBeenCalledWith({
        where: { id: mockAuth.id },
        data: {
          phone: newPhone,
          phoneConfirmed: true,
          phoneConfirmedAt: expect.any(Date),
        },
      });
      expect(authTriggersServiceMock.postPhoneReset).toHaveBeenCalledWith(
        mockAuth,
        updatedAuth,
      );
    });

    it('should throw an error if OTP verification fails', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);
      authCommonServiceMock.verifyOtpCall.mockResolvedValue(false);

      await expect(
        service.confirmResetPhone(where, newPhone, code),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.confirmResetPhone(where, newPhone, code),
      ).rejects.toThrow('Cannot confirm sms. Code not found');
    });

    it('should throw an error if auth does not exist', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(null);

      await expect(
        service.confirmResetPhone(where, newPhone, code),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.confirmResetPhone(where, newPhone, code),
      ).rejects.toThrow('Auth does not exist');
    });
  });

  describe('private methods', () => {
    const where = { id: 1 };
    const mockAuth = { id: 1, userId: 1, phone: '+79999999999' };
    const code = '123456';

    it('findAuthOrThrow should throw if auth is not found', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(null);

      await expect(service['findAuthOrThrow'](where)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service['findAuthOrThrow'](where)).rejects.toThrow(
        'Auth does not exist',
      );
    });

    it('findAuthOrThrow should return auth if found', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);

      const result = await service['findAuthOrThrow'](where);

      expect(result).toEqual(mockAuth);
    });

    it('verifyOtpOrThrow should throw if OTP verification fails', async () => {
      authCommonServiceMock.verifyOtpCall.mockResolvedValue(false);

      await expect(
        service['verifyOtpOrThrow']({
          code,
          method: 'sms',
          userId: 1,
          identifier: '1234567890',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service['verifyOtpOrThrow']({
          code,
          method: 'sms',
          userId: 1,
          identifier: '1234567890',
        }),
      ).rejects.toThrow('Cannot confirm sms. Code not found');
    });

    it('updatePhone should update the phone number and confirmation status', async () => {
      prismaMock.auth.update.mockResolvedValue(mockAuth);

      const result = await service['updatePhone'](1, '+79999999999');

      expect(result).toEqual(mockAuth);
      expect(prismaMock.auth.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          phone: '+79999999999',
          phoneConfirmed: true,
          phoneConfirmedAt: expect.any(Date),
        },
      });
    });
  });
});
