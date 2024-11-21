import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';
import { Logger } from '@nestjs/common';
import { AccountsTriggersService } from '../accountsTriggers.service';
import {
  AUDIT_LOG_SERVICE,
  DefaultCurrenciesEnum,
  RoleEnum,
  UserMetadataParams,
  UserMetaService,
} from '@erp-modul/shared';
import { Account, AccountTypeEnum } from '../../../prisma/client';

const ACCOUNT: Account = {
  id: 1,
  ownerId: 1,
  accountType: AccountTypeEnum.Master,
  extra: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const META: UserMetadataParams = {
  userId: 1,
  authId: 1,
  branchId: 1,
  role: RoleEnum.Client,
};

describe('AccountsTriggersService', () => {
  let service: AccountsTriggersService;
  const auditLogServiceClient = mockDeep<ClientProxy>();
  const userMetaService = mockDeep<UserMetaService>();
  let mockLogger: Partial<Logger>;

  beforeEach(async () => {
    mockLogger = {
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsTriggersService,
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

    service = module.get<AccountsTriggersService>(AccountsTriggersService);
    service['logger'] = mockLogger as Logger;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('postAccountCreation', () => {
    it('should send an audit log for account creation', () => {
      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postAccountCreation(ACCOUNT, true);

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('postExternalDeposit', () => {
    it('should send an audit log for external deposit', () => {
      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postExternalDeposit(META, {
        receiptId: 123,
        accountId: 1,
        currency: DefaultCurrenciesEnum.USD,
        amount: 100n,
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('postExternalWithdrawal', () => {
    it('should send an audit log for external withdrawal', () => {
      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postExternalWithdrawal(META, {
        subAccountId: 1,
        amount: 100n,
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('postP2PTransferOutgo', () => {
    it('should send an audit log for P2P transfer outgo', () => {
      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postP2PTransferOutgo(META, {
        fromAccountId: 1,
        targetAccountId: 'M1111111',
        currency: DefaultCurrenciesEnum.USD,
        amount: 100n,
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('postP2PTransferIncome', () => {
    it('should send an audit log for P2P transfer income', () => {
      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postP2PTransferIncome(META, {
        fromAccountId: 1,
        targetAccountId: 'M1111111',
        targetUserId: 2,
        currency: DefaultCurrenciesEnum.USD,
        amount: 100n,
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('postInternalTransferOutgo', () => {
    it('should send an audit log for internal transfer outgo', () => {
      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postInternalTransferOutgo(META, {
        fromAccountId: 1,
        targetAccountId: 2,
        amount: 100n,
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('postInternalTransferIncome', () => {
    it('should send an audit log for internal transfer income', () => {
      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postInternalTransferIncome(META, {
        fromAccountId: 1,
        targetAccountId: 2,
        amount: 100n,
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('postConfirmTransaction', () => {
    it('should send an audit log for transaction confirmation', () => {
      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postConfirmTransaction(
        META,
        {
          transactionId: 1,
          isConfirmed: true,
          ownerId: 2,
        },
        { amountChanged: '' },
      );

      expect(auditLogServiceClient.send).toHaveBeenCalledWith(
        'put',
        expect.any(Object),
      );
    });
  });

  describe('postTMAccountCreation', () => {
    it('should send an audit log for TM account creation', () => {
      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postTMAccountCreation(ACCOUNT);

      expect(auditLogServiceClient.send).toHaveBeenCalledWith('put', {
        resource: 'Account',
        event: {
          eventType: 'Create', // Assuming AuditLog.EventTypeEnum.Create maps to 'Create'
          eventDescription: 'New account for TM was generated',
        },
        outcome: 'Success', // Assuming AuditLog.OutcomeEnum.Success maps to 'Success'
        state: { newState: ACCOUNT },
        user: {
          id: ACCOUNT.ownerId,
        },
      });
    });

    it('should log an error if audit log sending fails', () => {
      const mockError = new Error('Failed to send');
      auditLogServiceClient.send.mockReturnValue({
        pipe: jest.fn().mockReturnValue({
          subscribe: ({ error }) => error(mockError),
        }),
      } as any);

      service.postTMAccountCreation(ACCOUNT);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unexpected send audit log error:',
        mockError,
      );
    });
  });

  describe('postInvestTMTransferOutgo', () => {
    const TRANSFER_PARAMS = {
      subAccountId: 1,
      strategyId: 2,
      amount: 100n,
    };

    it('should send an audit log for invest TM transfer outgo', () => {
      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postInvestTMTransferOutgo(META, TRANSFER_PARAMS, {
        isAccountant: true,
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith('put', {
        resource: 'Account',
        event: {
          eventType: 'Outgo', // Assuming AuditLog.EventTypeEnum.Outgo maps to 'Outgo'
          eventDescription: 'User initiated invest tm transfer',
        },
        outcome: 'Success', // Assuming AuditLog.OutcomeEnum.Success maps to 'Success'
        state: { newState: TRANSFER_PARAMS },
        user: {
          id: META.userId,
        },
        additionalParams: {
          isAccountant: true,
          strategyId: TRANSFER_PARAMS.strategyId,
        },
      });
    });

    it('should log an error if audit log sending fails for invest TM transfer outgo', () => {
      const mockError = new Error('Failed to send');
      auditLogServiceClient.send.mockReturnValue({
        pipe: jest.fn().mockReturnValue({
          subscribe: ({ error }) => error(mockError),
        }),
      } as any);

      service.postInvestTMTransferOutgo(META, TRANSFER_PARAMS, {
        isAccountant: true,
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unexpected send audit log error:',
        mockError,
      );
    });
  });

  describe('postInvestTMTransferIncome', () => {
    const TRANSFER_PARAMS = {
      subAccountId: 1,
      strategyId: 2,
      amount: 100n,
    };

    it('should send an audit log for invest TM transfer income', () => {
      auditLogServiceClient.send.mockReturnValue(of(null));

      service.postInvestTMTransferIncome(META, TRANSFER_PARAMS, {
        isAccountant: true,
        trusteeId: 3,
      });

      expect(auditLogServiceClient.send).toHaveBeenCalledWith('put', {
        resource: 'Account',
        event: {
          eventType: 'Income', // Assuming AuditLog.EventTypeEnum.Income maps to 'Income'
          eventDescription: 'Trustee received invest tm transfer',
        },
        outcome: 'Success', // Assuming AuditLog.OutcomeEnum.Success maps to 'Success'
        state: { newState: { ...TRANSFER_PARAMS, from: META.userId } },
        user: {
          id: 3,
        },
        additionalParams: {
          isAccountant: true,
          strategyId: TRANSFER_PARAMS.strategyId,
        },
      });
    });

    it('should log an error if audit log sending fails for invest TM transfer income', () => {
      const mockError = new Error('Failed to send');
      auditLogServiceClient.send.mockReturnValue({
        pipe: jest.fn().mockReturnValue({
          subscribe: ({ error }) => error(mockError),
        }),
      } as any);

      service.postInvestTMTransferIncome(META, TRANSFER_PARAMS, {
        isAccountant: true,
        trusteeId: 3,
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unexpected send audit log error:',
        mockError,
      );
    });
  });
});
