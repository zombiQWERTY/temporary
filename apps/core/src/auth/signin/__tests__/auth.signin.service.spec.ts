import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

import { AuthSignInService } from '../auth.signin.service';
import { PrismaService } from '../../../services/prisma.service';
import { PasswordService } from '../../../services/password.service';
import { AuthTriggersService } from '../../auth.triggers.service';
import { secretsConfig } from '../../../config/secrets.config';
import { EvolvedAuth } from '../auth.signin.service';
import { RoleEnum } from '@erp-modul/shared';

describe('AuthSignInService', () => {
  let service: AuthSignInService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let passwordServiceMock: DeepMockProxy<PasswordService>;
  let authTriggersServiceMock: DeepMockProxy<AuthTriggersService>;
  const secretsMock: ConfigType<typeof secretsConfig> = {
    accessTokenExp: '1h',
    refreshTokenExp: '7d',
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    passwordServiceMock = mockDeep<PasswordService>();
    authTriggersServiceMock = mockDeep<AuthTriggersService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthSignInService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PasswordService, useValue: passwordServiceMock },
        { provide: AuthTriggersService, useValue: authTriggersServiceMock },
        { provide: secretsConfig.KEY, useValue: secretsMock },
      ],
    }).compile();

    service = module.get<AuthSignInService>(AuthSignInService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const identifier = { phone: '1234567890', password: 'password' };
    const mockAuth = {
      id: 1,
      roles: [{ role: { slug: RoleEnum.Client, id: 1, weight: 100 } }],
      phone: '',
      email: '',
      phoneConfirmed: true,
      emailConfirmed: true,
      phoneConfirmedAt: null,
      emailConfirmedAt: null,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const evolvedAuth: EvolvedAuth = {
      ...mockAuth,
      roles: [{ slug: RoleEnum.Client, id: 1, weight: 100 }],
      mainRole: RoleEnum.Client,
    };

    it('should login successfully with correct password', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);
      passwordServiceMock.verifyPassword.mockResolvedValue(true);

      const result = await service.login({
        target: 'client',
        identifier,
        loginMethod: 'phone',
      });

      expect(result).toEqual(evolvedAuth);
      expect(authTriggersServiceMock.postLogin).toHaveBeenCalledWith(
        mockAuth,
        'phone',
      );
    });

    it('should throw an error if auth does not exist', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ target: 'client', identifier, loginMethod: 'phone' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.login({ target: 'client', identifier, loginMethod: 'phone' }),
      ).rejects.toThrow('Auth does not exist');
    });

    it('should throw an error if password is incorrect', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);
      passwordServiceMock.verifyPassword.mockResolvedValue(false);

      await expect(
        service.login({ target: 'client', identifier, loginMethod: 'phone' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.login({ target: 'client', identifier, loginMethod: 'phone' }),
      ).rejects.toThrow('Incorrect password');
    });
  });

  describe('makeTokens', () => {
    const mockParams = {
      sub: 1,
      mainRole: RoleEnum.Client,
      mainBranchId: 'ALL' as const,
      userId: 1,
      roles: [{ id: 1, weight: 100, slug: RoleEnum.Client }],
      branches: [
        {
          branchId: 1,
          userRole: RoleEnum.Client,
          isHeadOfBranch: false,
          userId: 1,
        },
      ],
    };

    it('should generate tokens correctly', () => {
      const result = service.makeTokens(mockParams);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.mainRole).toBe(mockParams.mainRole);
      expect(result.userId).toBe(mockParams.userId);
    });

    it('should generate tokens correctly for proxy login', () => {
      const result = service.makeTokens({
        ...mockParams,
        hostRole: RoleEnum.Admin,
        hostAuthId: 2,
        hostUserId: 2,
        hostBranchId: 1,
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken.hostAuthId).toBe(2);
      expect(result.accessToken.hostRole).toBe(RoleEnum.Admin);
      expect(result.mainRole).toBe(mockParams.mainRole);
      expect(result.userId).toBe(mockParams.userId);
    });
  });

  describe('selectRole', () => {
    const userId = 1;
    const role = RoleEnum.Client;
    const mockAuth = {
      id: 1,
      roles: [{ role: { slug: RoleEnum.Client, id: 1, weight: 100 } }],
      phone: '',
      email: '',
      phoneConfirmed: true,
      emailConfirmed: true,
      phoneConfirmedAt: null,
      emailConfirmedAt: null,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const evolvedAuth: EvolvedAuth = {
      ...mockAuth,
      roles: [{ slug: RoleEnum.Client, id: 1, weight: 100 }],
      mainRole: RoleEnum.Client,
    };

    it('should select role successfully', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);

      const result = await service.selectRole(userId, role);

      expect(result).toEqual(evolvedAuth);
      expect(prismaMock.auth.findUnique).toHaveBeenCalledWith({
        where: { userId },
        include: {
          roles: {
            select: {
              role: true,
            },
            orderBy: {
              role: {
                weight: 'desc',
              },
            },
          },
        },
      });
    });

    it('should throw an error if auth does not exist', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(null);

      await expect(service.selectRole(userId, role)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.selectRole(userId, role)).rejects.toThrow(
        'Auth does not exist',
      );
    });

    it('should throw an error if role is not assigned', async () => {
      prismaMock.auth.findUnique.mockResolvedValue({ ...mockAuth, roles: [] });

      await expect(service.selectRole(userId, role)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.selectRole(userId, role)).rejects.toThrow(
        'Role is not assigned',
      );
    });
  });

  describe('proxyLogin', () => {
    const hostUserId = 1;
    const proxyUserId = 2;
    const hostAuthRole = RoleEnum.Admin;
    const mockAuth = {
      id: 2,
      roles: [{ role: { slug: RoleEnum.Client, id: 1, weight: 100 } }],
      phone: '',
      email: '',
      phoneConfirmed: true,
      emailConfirmed: true,
      phoneConfirmedAt: null,
      emailConfirmedAt: null,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const evolvedAuth: EvolvedAuth = {
      ...mockAuth,
      roles: [{ slug: RoleEnum.Client, id: 1, weight: 100 }],
      mainRole: RoleEnum.Client,
    };

    it('should login as proxy successfully', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);

      const result = await service.proxyLogin(
        hostUserId,
        hostAuthRole,
        proxyUserId,
      );

      expect(result).toEqual(evolvedAuth);
      expect(prismaMock.auth.findUnique).toHaveBeenCalledWith({
        where: { userId: proxyUserId },
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
      expect(authTriggersServiceMock.postProxyLogin).toHaveBeenCalledWith(
        mockAuth,
        hostUserId,
        hostAuthRole,
      );
    });

    it('should throw an error if trying to auth oneself', async () => {
      await expect(
        service.proxyLogin(hostUserId, hostAuthRole, hostUserId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.proxyLogin(hostUserId, hostAuthRole, hostUserId),
      ).rejects.toThrow('You cannot auth yourself');
    });

    it('should throw an error if auth does not exist for proxy user', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(null);

      await expect(
        service.proxyLogin(hostUserId, hostAuthRole, proxyUserId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.proxyLogin(hostUserId, hostAuthRole, proxyUserId),
      ).rejects.toThrow('Auth does not exist');
    });
  });

  describe('checkAuth', () => {
    const authId = 1;
    const mockAuth = {
      id: 2,
      roles: [{ role: { slug: RoleEnum.Client, id: 1, weight: 100 } }],
      phone: '',
      email: '',
      phoneConfirmed: true,
      emailConfirmed: true,
      phoneConfirmedAt: null,
      emailConfirmedAt: null,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const evolvedAuth: EvolvedAuth = {
      ...mockAuth,
      roles: [{ slug: RoleEnum.Client, id: 1, weight: 100 }],
      mainRole: RoleEnum.Client,
    };

    it('should return evolved auth successfully', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(mockAuth);

      const result = await service.checkAuth(authId);

      expect(result).toEqual(evolvedAuth);
      expect(prismaMock.auth.findUnique).toHaveBeenCalledWith({
        where: { id: authId },
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
    });

    it('should throw an error if auth does not exist', async () => {
      prismaMock.auth.findUnique.mockResolvedValue(null);

      await expect(service.checkAuth(authId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.checkAuth(authId)).rejects.toThrow(
        'Auth does not exist',
      );
    });
  });
});
