import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import {
  AUDIT_LOG_SERVICE,
  RoleEnum,
  UserMetaService,
} from '@erp-modul/shared';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';
import { Logger } from '@nestjs/common';

import { UsersTriggersService } from '../usersTriggers.service';
import { AccountStatusEnum } from '../../../prisma/client';

const META = { userId: 1, authId: 1, branchId: 1, role: RoleEnum.Client };

const CLIENT_RECORD: any = {
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
};

describe('UsersTriggersService', () => {
  let service: UsersTriggersService;
  const auditLogServiceClient = mockDeep<ClientProxy>();
  const userMetaService = mockDeep<UserMetaService>();
  let mockLogger: Partial<Logger>;

  beforeEach(async () => {
    mockLogger = {
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersTriggersService,
        {
          provide: AUDIT_LOG_SERVICE,
          useValue: auditLogServiceClient,
        },
        {
          provide: UserMetaService,
          useValue: userMetaService,
        },
      ],
    }).compile();

    service = module.get<UsersTriggersService>(UsersTriggersService);
    service['logger'] = mockLogger as Logger;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('UsersTriggersService: postUpdateSelfUser', () => {
    it('should send an audit log for a self user update', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postUpdateSelfUser({
        original: CLIENT_RECORD,
        updated: { ...CLIENT_RECORD, firstName: 'John Doe Updated' },
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('UsersTriggersService: postUpdateUser', () => {
    it('should send an audit log when a user is updated by another user', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postUpdateUser({
        original: CLIENT_RECORD,
        updated: { ...CLIENT_RECORD, firstName: 'John Doe Updated' },
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('UsersTriggersService: postCreateUser', () => {
    it('should send an audit log for user creation', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postCreateUser({
        user: CLIENT_RECORD,
        roles: [RoleEnum.Client],
        branches: [{ branchId: 1, role: RoleEnum.Client }],
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('UsersTriggersService: postChangeAccountStatus', () => {
    it('should send an audit log for change account status', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postCreateUser({
        user: CLIENT_RECORD,
        roles: [RoleEnum.Client],
        branches: [{ branchId: 1, role: RoleEnum.Client }],
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('UsersTriggersService: postVerificateUserDocument', () => {
    it('should send an audit log for verificate user document', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postVerificateUserDocument({
        clientId: CLIENT_RECORD.id,
        documentId: 1,
        documentVerified: true,
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });
});
