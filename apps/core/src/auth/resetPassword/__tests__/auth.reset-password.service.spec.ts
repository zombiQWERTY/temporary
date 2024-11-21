import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { PrismaService } from '../../../services/prisma.service';
import { AuthTriggersService } from '../../auth.triggers.service';
import { AuthCommonService } from '../../auth.common.service';
import { AuthResetPasswordService } from '../auth.reset-password.service';

describe('AuthResetPasswordService', () => {
  let service: AuthResetPasswordService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let authTriggersServiceMock: DeepMockProxy<AuthTriggersService>;
  let authCommonServiceMock: DeepMockProxy<AuthCommonService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    authTriggersServiceMock = mockDeep<AuthTriggersService>();
    authCommonServiceMock = mockDeep<AuthCommonService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResetPasswordService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuthTriggersService, useValue: authTriggersServiceMock },
        {
          provide: AuthCommonService,
          useValue: authCommonServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthResetPasswordService>(AuthResetPasswordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('resetPassword', () => {
    const where = { id: 1 };
    const mockAuth = {
      id: 1,
      userId: 1,
      phone: '1234567890',
      email: 'test@example.com',
    };
    const mockOtpResponse = { code: '123456', ttl: 300 };

    it('should send an OTP via SMS successfully', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);
      authCommonServiceMock.sendOtpCall.mockResolvedValue(mockOtpResponse);

      const result = await service.resetPassword(where, 'sms');

      expect(result).toEqual(mockOtpResponse);
      expect(prismaMock.auth.findUnique).toHaveBeenCalledWith({ where });
      expect(authCommonServiceMock.sendOtpCall).toHaveBeenCalledWith({
        identifier: mockAuth.phone,
        userId: mockAuth.userId,
        type: 'RESET_PASSWORD',
        method: 'sms',
      });
    });

    it('should send an OTP via email successfully', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);
      authCommonServiceMock.sendOtpCall.mockResolvedValue(mockOtpResponse);

      const result = await service.resetPassword(where, 'email');

      expect(result).toEqual(mockOtpResponse);
      expect(prismaMock.auth.findUnique).toHaveBeenCalledWith({ where });
      expect(authCommonServiceMock.sendOtpCall).toHaveBeenCalledWith({
        identifier: mockAuth.email,
        userId: mockAuth.userId,
        type: 'RESET_PASSWORD',
        method: 'email',
      });
    });

    it('should throw an error if auth does not exist', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword(where, 'sms')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resetPassword(where, 'sms')).rejects.toThrow(
        'Auth does not exist',
      );
    });
  });

  describe('confirmResetPassword', () => {
    const where = { id: 1 };
    const mockAuth = {
      id: 1,
      userId: 1,
      phone: '1234567890',
      email: 'test@example.com',
    };
    const password = 'newPassword';
    const code = '123456';

    it('should confirm reset password via SMS successfully', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);
      authCommonServiceMock.verifyOtpCall.mockResolvedValue(true);
      authCommonServiceMock.makePassword.mockResolvedValue('hashedPassword');

      const result = await service.confirmResetPassword(
        where,
        password,
        code,
        'sms',
      );

      expect(result).toEqual({ ok: true });
      expect(prismaMock.auth.findUnique).toHaveBeenCalledWith({ where });
      expect(authCommonServiceMock.verifyOtpCall).toHaveBeenCalledWith({
        code,
        method: 'sms',
        type: 'RESET_PASSWORD',
        userId: mockAuth.userId,
        identifier: mockAuth.phone,
      });
      expect(authCommonServiceMock.makePassword).toHaveBeenCalledWith(password);
      expect(prismaMock.auth.update).toHaveBeenCalledWith({
        where: { id: mockAuth.id },
        data: { password: 'hashedPassword' },
      });
      expect(authTriggersServiceMock.postPasswordReset).toHaveBeenCalledWith(
        mockAuth,
        'sms',
      );
    });

    it('should confirm reset password via email successfully', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);
      authCommonServiceMock.verifyOtpCall.mockResolvedValue(true);
      authCommonServiceMock.makePassword.mockResolvedValue('hashedPassword');

      const result = await service.confirmResetPassword(
        where,
        password,
        code,
        'email',
      );

      expect(result).toEqual({ ok: true });
      expect(prismaMock.auth.findUnique).toHaveBeenCalledWith({ where });
      expect(authCommonServiceMock.verifyOtpCall).toHaveBeenCalledWith({
        code,
        method: 'email',
        type: 'RESET_PASSWORD',
        userId: mockAuth.userId,
        identifier: mockAuth.email,
      });
      expect(authCommonServiceMock.makePassword).toHaveBeenCalledWith(password);
      expect(prismaMock.auth.update).toHaveBeenCalledWith({
        where: { id: mockAuth.id },
        data: { password: 'hashedPassword' },
      });
      expect(authTriggersServiceMock.postPasswordReset).toHaveBeenCalledWith(
        mockAuth,
        'email',
      );
    });

    it('should throw an error if OTP verification fails', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);
      authCommonServiceMock.verifyOtpCall.mockResolvedValue(false);

      await expect(
        service.confirmResetPassword(where, password, code, 'sms'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.confirmResetPassword(where, password, code, 'sms'),
      ).rejects.toThrow('Cannot confirm sms. Code not found');
    });

    it('should throw an error if auth does not exist', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(null);

      await expect(
        service.confirmResetPassword(where, password, code, 'sms'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.confirmResetPassword(where, password, code, 'sms'),
      ).rejects.toThrow('Auth does not exist');
    });
  });

  describe('private methods', () => {
    const where = { id: 1 };
    const mockAuth = {
      id: 1,
      userId: 1,
      phone: '1234567890',
      email: 'test@example.com',
    };
    const password = 'newPassword';

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
          code: '123456',
          method: 'sms',
          userId: 1,
          identifier: '1234567890',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service['verifyOtpOrThrow']({
          code: '123456',
          method: 'sms',
          userId: 1,
          identifier: '1234567890',
        }),
      ).rejects.toThrow('Cannot confirm sms. Code not found');
    });

    it('updatePassword should hash password and update auth record', async () => {
      authCommonServiceMock.makePassword.mockResolvedValue('hashedPassword');

      await service['updatePassword'](1, password);

      expect(authCommonServiceMock.makePassword).toHaveBeenCalledWith(password);
      expect(prismaMock.auth.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'hashedPassword' },
      });
    });
  });
});
