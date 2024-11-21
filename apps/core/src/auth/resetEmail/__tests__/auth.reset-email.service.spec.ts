import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

import { AuthResetEmailService } from '../auth.reset-email.service';
import { PrismaService } from '../../../services/prisma.service';
import { AuthTriggersService } from '../../auth.triggers.service';
import { AuthCommonService } from '../../auth.common.service';
import { Auth } from '../../../../prisma/client';

describe('AuthResetEmailService', () => {
  let service: AuthResetEmailService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let authTriggersServiceMock: DeepMockProxy<AuthTriggersService>;
  let authCommonServiceMock: DeepMockProxy<AuthCommonService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    authTriggersServiceMock = mockDeep<AuthTriggersService>();
    authCommonServiceMock = mockDeep<AuthCommonService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResetEmailService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuthTriggersService, useValue: authTriggersServiceMock },
        { provide: AuthCommonService, useValue: authCommonServiceMock },
      ],
    }).compile();

    service = module.get<AuthResetEmailService>(AuthResetEmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('resetEmail', () => {
    const where = { id: 1 };
    const mockAuth = { id: 1, userId: 1, email: 'test@test.com' };
    const mockOtpResponse = { code: '123456', ttl: 300 };

    it('should send an OTP for email reset successfully', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);
      authCommonServiceMock.sendOtpCall.mockResolvedValue(mockOtpResponse);

      const result = await service.resetEmail(where);

      expect(result).toEqual(mockOtpResponse);
      expect(prismaMock.auth.findUnique).toHaveBeenCalledWith({ where });
      expect(authCommonServiceMock.sendOtpCall).toHaveBeenCalledWith({
        identifier: mockAuth.email,
        userId: mockAuth.userId,
        type: 'RESET_EMAIL',
        method: 'email',
      });
    });

    it('should throw an error if auth does not exist', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(null);

      await expect(service.resetEmail(where)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resetEmail(where)).rejects.toThrow(
        'Auth does not exist',
      );
    });
  });

  describe('confirmResetEmail', () => {
    const where = { id: 1 };
    const newEmail = 'test2@test.com';
    const code = '123456';
    const mockAuth = { id: 1, userId: 1, email: 'test@test.com' } as Auth;
    const updatedAuth = {
      ...mockAuth,
      email: newEmail,
      emailConfirmed: true,
      emailConfirmedAt: new Date(),
    };

    it('should confirm email reset successfully', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);
      authCommonServiceMock.verifyOtpCall.mockResolvedValue(true);
      prismaMock.auth.update.mockResolvedValue(updatedAuth);

      const result = await service.confirmResetEmail(where, newEmail, code);

      expect(result).toEqual({ ok: true });
      expect(prismaMock.auth.findUnique).toHaveBeenCalledWith({ where });
      expect(authCommonServiceMock.verifyOtpCall).toHaveBeenCalledWith({
        code,
        method: 'email',
        type: 'RESET_EMAIL',
        userId: mockAuth.userId,
        identifier: mockAuth.email,
      });
      expect(prismaMock.auth.update).toHaveBeenCalledWith({
        where: { id: mockAuth.id },
        data: {
          email: newEmail,
          emailConfirmed: true,
          emailConfirmedAt: expect.any(Date),
        },
      });
      expect(authTriggersServiceMock.postEmailReset).toHaveBeenCalledWith(
        mockAuth,
        updatedAuth,
      );
    });

    it('should throw an error if OTP verification fails', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);
      authCommonServiceMock.verifyOtpCall.mockResolvedValue(false);

      await expect(
        service.confirmResetEmail(where, newEmail, code),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.confirmResetEmail(where, newEmail, code),
      ).rejects.toThrow('Cannot confirm email. Code not found');
    });

    it('should throw an error if auth does not exist', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(null);

      await expect(
        service.confirmResetEmail(where, newEmail, code),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.confirmResetEmail(where, newEmail, code),
      ).rejects.toThrow('Auth does not exist');
    });
  });

  describe('private methods', () => {
    const where = { id: 1 };
    const mockAuth = { id: 1, userId: 1, email: 'test@test.com' };
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
          method: 'email',
          userId: 1,
          identifier: '1234567890',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service['verifyOtpOrThrow']({
          code,
          method: 'email',
          userId: 1,
          identifier: '1234567890',
        }),
      ).rejects.toThrow('Cannot confirm email. Code not found');
    });

    it('updateEmail should update the email number and confirmation status', async () => {
      prismaMock.auth.update.mockResolvedValue(mockAuth);

      const result = await service['updateEmail'](1, 'test@test.com');

      expect(result).toEqual(mockAuth);
      expect(prismaMock.auth.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          email: 'test@test.com',
          emailConfirmed: true,
          emailConfirmedAt: expect.any(Date),
        },
      });
    });
  });
});
