import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

import { UpdateAuthService } from '../auth.update-auth.service';
import { PrismaService } from '../../services/prisma.service';
import { AuthCommonService } from '../auth.common.service';
import { Auth } from '../../../prisma/client';
import { RoleEnum } from '@erp-modul/shared';

describe('UpdateAuthService', () => {
  let service: UpdateAuthService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let authCommonServiceMock: DeepMockProxy<AuthCommonService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    authCommonServiceMock = mockDeep<AuthCommonService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuthCommonService, useValue: authCommonServiceMock },
      ],
    }).compile();

    service = module.get<UpdateAuthService>(UpdateAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateAuthWithRole', () => {
    const userId = 1;
    const phone = '1234567890';
    const email = 'test@example.com';
    const password = 'newPassword';
    const roles = [RoleEnum.Admin, RoleEnum.Client];
    const mockAuth: Auth = {
      id: 1,
      userId,
      phone,
      email,
      password: 'hashedPassword',
      phoneConfirmed: true,
      phoneConfirmedAt: new Date(),
      emailConfirmed: true,
      emailConfirmedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update auth and assign roles successfully', async () => {
      authCommonServiceMock.runInTransaction.mockImplementation(
        (tx) => (cb) => cb(tx),
      );
      authCommonServiceMock.makePassword.mockResolvedValue('hashedPassword');
      prismaMock.auth.update.mockResolvedValue(mockAuth);

      const result = await service.updateAuthWithRole({
        userId,
        phone,
        email,
        password,
        roles,
      });

      expect(result).toEqual(mockAuth);
      expect(authCommonServiceMock.makePassword).toHaveBeenCalledWith(password);
      expect(prismaMock.auth.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          phone,
          email,
          password: 'hashedPassword',
          phoneConfirmed: true,
        },
      });
      expect(authCommonServiceMock.assignRoles).toHaveBeenCalledWith(
        prismaMock,
        mockAuth.id,
        roles,
      );
    });

    it('should update auth without changing the password if not provided', async () => {
      authCommonServiceMock.runInTransaction.mockImplementation(
        (tx) => (cb) => cb(tx),
      );

      prismaMock.auth.update.mockResolvedValue(mockAuth);

      const result = await service.updateAuthWithRole({
        userId,
        phone,
        email,
        password: '',
        roles,
      });

      expect(result).toEqual(mockAuth);
      expect(authCommonServiceMock.makePassword).not.toHaveBeenCalled();
      expect(prismaMock.auth.update).toHaveBeenCalledWith({
        where: { userId },
        data: {
          phone,
          email,
          password: undefined,
          phoneConfirmed: true,
        },
      });
      expect(authCommonServiceMock.assignRoles).toHaveBeenCalledWith(
        prismaMock,
        mockAuth.id,
        roles,
      );
    });
  });
});
