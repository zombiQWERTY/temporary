import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ClientProxy } from '@nestjs/microservices';

import { AuthCommonService } from '../auth.common.service';
import { PasswordService } from '../../services/password.service';
import { ALERT_SERVICE, RoleEnum } from '@erp-modul/shared';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../services/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('AuthCommonService', () => {
  let service: AuthCommonService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let passwordServiceMock: DeepMockProxy<PasswordService>;
  let alertServiceClientMock: DeepMockProxy<ClientProxy>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    passwordServiceMock = mockDeep<PasswordService>();
    alertServiceClientMock = mockDeep<ClientProxy>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthCommonService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PasswordService, useValue: passwordServiceMock },
        { provide: ALERT_SERVICE, useValue: alertServiceClientMock },
      ],
    }).compile();

    service = module.get(AuthCommonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('makePassword', () => {
    it('should return hashed password', async () => {
      // @ts-expect-error mock Buffer
      passwordServiceMock.generateSalt.mockResolvedValue('salt');
      passwordServiceMock.hashPassword.mockResolvedValue('hashedPassword');

      const result = await service['makePassword']('password');
      expect(result).toEqual('hashedPassword');
    });

    it('should call PasswordService methods correctly', async () => {
      const saltSpy =
        // @ts-expect-error mock Buffer
        passwordServiceMock.generateSalt.mockResolvedValue('salt');
      const hashSpy =
        passwordServiceMock.hashPassword.mockResolvedValue('hashedPassword');

      await service['makePassword']('password');

      expect(saltSpy).toHaveBeenCalled();
      expect(hashSpy).toHaveBeenCalledWith('password', 'salt');
    });
  });

  describe('sendOtpCall', () => {
    it('should call sendAlertCommand with the correct command and payload for email', async () => {
      const sendAlertSpy = jest
        .spyOn<any, any>(service, 'sendAlertCommand')
        .mockResolvedValue({ code: '1234', ttl: 300 });

      await service['sendOtpCall']({
        identifier: 'test@example.com',
        type: 'SIGN_UP',
        method: 'email',
      });

      expect(sendAlertSpy).toHaveBeenCalledWith('send_otp_by_email', {
        email: 'test@example.com',
        type: 'SIGN_UP',
      });
    });

    it('should call sendAlertCommand with the correct command and payload for SMS', async () => {
      const sendAlertSpy = jest
        .spyOn<any, any>(service, 'sendAlertCommand')
        .mockResolvedValue({ code: '1234', ttl: 300 });

      await service['sendOtpCall']({
        identifier: '1234567890',
        type: 'SIGN_UP',
        method: 'sms',
      });

      expect(sendAlertSpy).toHaveBeenCalledWith('send_otp_by_sms', {
        phone: '1234567890',
        type: 'SIGN_UP',
      });
    });
  });

  describe('verifyOtpCall', () => {
    it('should call sendAlertCommand with the correct command and payload for email verification', async () => {
      const sendAlertSpy = jest
        .spyOn<any, any>(service, 'sendAlertCommand')
        .mockResolvedValue(true);

      const result = await service['verifyOtpCall']({
        identifier: 'test@example.com',
        code: '1234',
        type: 'SIGN_UP',
        method: 'email',
      });

      expect(sendAlertSpy).toHaveBeenCalledWith('verify_otp_by_email', {
        email: 'test@example.com',
        code: '1234',
        type: 'SIGN_UP',
      });
      expect(result).toBe(true);
    });

    it('should call sendAlertCommand with the correct command and payload for SMS verification', async () => {
      const sendAlertSpy = jest
        .spyOn<any, any>(service, 'sendAlertCommand')
        .mockResolvedValue(true);

      const result = await service['verifyOtpCall']({
        identifier: '1234567890',
        code: '1234',
        type: 'SIGN_UP',
        method: 'sms',
      });

      expect(sendAlertSpy).toHaveBeenCalledWith('verify_otp_by_sms', {
        phone: '1234567890',
        code: '1234',
        type: 'SIGN_UP',
      });
      expect(result).toBe(true);
    });
  });

  describe('findCredentials', () => {
    const userId = 1;
    const mockCredentials = { email: 'test@example.com', phone: '1234567890' };

    it('should return user credentials if found', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockCredentials);

      const result = await service.findCredentials(userId);

      expect(result).toEqual(mockCredentials);
      expect(prismaMock.auth.findUnique).toHaveBeenCalledWith({
        where: { userId },
        select: { email: true, phone: true },
      });
    });

    it('should return null if no credentials are found', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(null);

      const result = await service.findCredentials(userId);

      expect(result).toBeNull();
      expect(prismaMock.auth.findUnique).toHaveBeenCalledWith({
        where: { userId },
        select: { email: true, phone: true },
      });
    });
  });

  describe('assignRoles', () => {
    it('should assign roles successfully when roles are found', async () => {
      const roles: RoleEnum[] = [RoleEnum.Admin, RoleEnum.Client];
      const foundRoles = [
        { id: 1, slug: RoleEnum.Admin },
        { id: 2, slug: RoleEnum.Client },
      ];

      prismaMock.role.findMany.mockResolvedValue(foundRoles);

      await service.assignRoles(prismaMock, 1, roles);

      expect(prismaMock.role.findMany).toHaveBeenCalledWith({
        where: { slug: { in: roles } },
      });
      expect(prismaMock.rolesOnAuth.deleteMany).toHaveBeenCalledWith({
        where: { authId: 1 },
      });

      expect(prismaMock.rolesOnAuth.create).toHaveBeenCalledTimes(
        foundRoles.length,
      );
      foundRoles.forEach((role) => {
        expect(prismaMock.rolesOnAuth.create).toHaveBeenCalledWith({
          data: { authId: 1, roleId: role.id },
        });
      });
    });

    it('should throw BadRequestException if no roles are found', async () => {
      const roles: RoleEnum[] = [RoleEnum.Admin];
      prismaMock.role.findMany.mockResolvedValue([]);

      await expect(service.assignRoles(prismaMock, 1, roles)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.rolesOnAuth.deleteMany).not.toHaveBeenCalled();
      expect(prismaMock.rolesOnAuth.create).not.toHaveBeenCalled();
    });

    it('should handle partial role matches correctly', async () => {
      const roles: RoleEnum[] = [RoleEnum.Admin, RoleEnum.Client];
      const foundRoles = [{ id: 1, slug: RoleEnum.Admin }];

      prismaMock.role.findMany.mockResolvedValue(foundRoles);

      await service.assignRoles(prismaMock, 1, roles);

      expect(prismaMock.role.findMany).toHaveBeenCalledWith({
        where: { slug: { in: roles } },
      });
      expect(prismaMock.rolesOnAuth.deleteMany).toHaveBeenCalledWith({
        where: { authId: 1 },
      });

      expect(prismaMock.rolesOnAuth.create).toHaveBeenCalledTimes(
        foundRoles.length,
      );
      foundRoles.forEach((role) => {
        expect(prismaMock.rolesOnAuth.create).toHaveBeenCalledWith({
          data: { authId: 1, roleId: role.id },
        });
      });
    });
  });
});
