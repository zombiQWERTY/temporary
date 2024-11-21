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

import { Auth } from '../../../prisma/client';
import { AuthTriggersService } from '../auth.triggers.service';

const META = { userId: 1, authId: 1, branchId: 1, role: RoleEnum.Client };

const CLIENT_RECORD: Auth = {
  id: 1,
  phone: '+79999999999',
  email: 'test@test.com',
  phoneConfirmed: true,
  emailConfirmed: true,
  phoneConfirmedAt: new Date(),
  emailConfirmedAt: new Date(),
  password: '123123123',
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthTriggersService', () => {
  let service: AuthTriggersService;
  const auditLogServiceClient = mockDeep<ClientProxy>();
  const userMetaService = mockDeep<UserMetaService>();
  let mockLogger: Partial<Logger>;

  beforeEach(async () => {
    mockLogger = {
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTriggersService,
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

    service = module.get<AuthTriggersService>(AuthTriggersService);

    service['logger'] = mockLogger as Logger;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('AuthTriggersService: postRegistration', () => {
    it('should send an audit log for registration', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postRegistration(CLIENT_RECORD);

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('AuthTriggersService: postLogin by phone', () => {
    it('should send an audit log for login', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postLogin(CLIENT_RECORD, 'phone');

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('AuthTriggersService: postLogin by email', () => {
    it('should send an audit log for login', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postLogin(CLIENT_RECORD, 'email');

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('AuthTriggersService: postProxyLogin', () => {
    it('should send an audit log for login', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postProxyLogin(CLIENT_RECORD, 2, RoleEnum.Admin);

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('AuthTriggersService: postPasswordReset', () => {
    it('should send an audit log for password reset', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postPasswordReset(CLIENT_RECORD, 'email');

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('AuthTriggersService: postPhoneReset', () => {
    it('should send an audit log for phone reset', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postPhoneReset(CLIENT_RECORD, {
        ...CLIENT_RECORD,
        phone: '+7992222222',
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('AuthTriggersService: postEmailReset', () => {
    it('should send an audit log for email reset', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postEmailReset(CLIENT_RECORD, {
        ...CLIENT_RECORD,
        email: 'test@test.com',
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('AuthTriggersService: postConfirmRegisteredPhone', () => {
    it('should send an audit log for login', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postConfirmRegisteredPhone(CLIENT_RECORD);

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('AuthTriggersService: postConfirmRegisteredEmail', () => {
    it('should send an audit log for login', () => {
      userMetaService.getUserMeta.mockReturnValue(META);

      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postConfirmRegisteredEmail(CLIENT_RECORD);

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });
});
