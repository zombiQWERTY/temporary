import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from '../accounts.service';
import { AccountsTriggersService } from '../accountsTriggers.service';
import { ClientProxy } from '@nestjs/microservices';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';
import {
  AccountTypeEnum,
  OperationStatusEnum,
  OperationSubTypeEnum,
  OperationTypeEnum,
  Rate,
  UserAccountSettings,
} from '../../../prisma/client';
import {
  CORE_SERVICE,
  DefaultCurrenciesEnum,
  FILES_SERVICE,
  RoleEnum,
  UserMetadataParams,
  ALERT_SERVICE,
} from '@erp-modul/shared';
import { PrismaService } from '../../services/prisma.service';
import { PrismaClient } from '@prisma/client';
import { ProductsTmService } from '@app/service-connector';
import { RatesService } from '../../rates/rates.service';
import { Decimal } from '@prisma/client/runtime/library';
import { WalletNumberService } from '../../services/wallet-number.service';

const META: UserMetadataParams = {
  userId: 1,
  branchId: 1,
  authId: 1,
  role: RoleEnum.Client,
};

describe('AccountsService', () => {
  let service: AccountsService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let triggersMock: DeepMockProxy<AccountsTriggersService>;
  let ratesServiceMock: DeepMockProxy<RatesService>;
  let walletNumberServiceMock: DeepMockProxy<WalletNumberService>;
  let filesServiceClientMock: DeepMockProxy<ClientProxy>;
  let alertServiceClientMock: DeepMockProxy<ClientProxy>;
  let coreServiceClientMock: DeepMockProxy<ClientProxy>;
  let scProductsTmServiceMock: DeepMockProxy<ProductsTmService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    triggersMock = mockDeep<AccountsTriggersService>();
    ratesServiceMock = mockDeep<RatesService>();
    walletNumberServiceMock = mockDeep<WalletNumberService>();
    filesServiceClientMock = mockDeep<ClientProxy>();
    coreServiceClientMock = mockDeep<ClientProxy>();
    scProductsTmServiceMock = mockDeep<ProductsTmService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AccountsTriggersService, useValue: triggersMock },
        { provide: RatesService, useValue: ratesServiceMock },
        { provide: WalletNumberService, useValue: walletNumberServiceMock },
        { provide: ALERT_SERVICE, useValue: mockDeep<ClientProxy>() },
        { provide: FILES_SERVICE, useValue: filesServiceClientMock },
        { provide: CORE_SERVICE, useValue: coreServiceClientMock },
        { provide: ProductsTmService, useValue: scProductsTmServiceMock },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    alertServiceClientMock = module.get(ALERT_SERVICE);
    coreServiceClientMock = module.get(CORE_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should create an account and trigger post account creation', async () => {
      const createdAccountMaster = {
        id: 1,
        ownerId: 1,
        accountType: AccountTypeEnum.Master,
        subAccounts: [],
      };

      const createdAccountSavings = {
        id: 1,
        ownerId: 1,
        accountType: AccountTypeEnum.Savings,
        subAccounts: [],
      };

      prismaMock.account.create
        .mockResolvedValueOnce(createdAccountMaster)
        .mockResolvedValueOnce(createdAccountSavings);

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock);
      });

      const mockSettings: UserAccountSettings = {
        id: 1,
        userId: 1,
        accountOperationsBlocked: false,
        limitInUsd: 2500000n,
      };

      const createSettingsSpy = jest
        .spyOn(service, 'createUserAccountSettings')
        .mockResolvedValue(mockSettings);

      walletNumberServiceMock.generateWalletId
        .mockResolvedValueOnce('abc')
        .mockResolvedValueOnce('def');

      const result = await service.createAccount(META.userId, {
        automatic: true,
      });

      expect(createSettingsSpy).toHaveBeenCalledWith(prismaMock, 1);

      expect(result).toEqual(createdAccountMaster);
      expect(prismaMock.account.create).toHaveBeenCalledWith({
        data: {
          ownerId: META.userId,
          accountType: AccountTypeEnum.Master,
          walletNumber: {
            create: {
              walletId: 'abc',
            },
          },
          subAccounts: {
            createMany: {
              data: expect.any(Array),
            },
          },
        },
      });
      expect(triggersMock.postAccountCreation).toHaveBeenCalledWith(
        createdAccountMaster,
        true,
      );
    });
  });

  describe('createTMAccount', () => {
    const userId = 123;
    const strategyId = 456;
    const mainCurrency = DefaultCurrenciesEnum.USD;
    const createdAccount = {
      id: 1,
      ownerId: userId,
      accountType: AccountTypeEnum.TM,
      extra: { strategyId },
      subAccounts: [
        { currencyCode: DefaultCurrenciesEnum.USD, isPrimary: true },
        { currencyCode: DefaultCurrenciesEnum.EUR, isPrimary: false },
        { currencyCode: DefaultCurrenciesEnum.RUB, isPrimary: false },
        { currencyCode: DefaultCurrenciesEnum.JPY, isPrimary: false },
      ],
    };

    it('should create a TM account with sub-accounts and trigger post-account creation', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
        return createdAccount;
      });

      prismaMock.account.create.mockResolvedValue(createdAccount);

      const mockSettings: UserAccountSettings = {
        id: 1,
        userId,
        accountOperationsBlocked: false,
        limitInUsd: 2500000n,
      };

      const createSettingsSpy = jest
        .spyOn(service, 'createUserAccountSettings')
        .mockResolvedValue(mockSettings);

      walletNumberServiceMock.generateWalletId.mockResolvedValue('abc');

      const result = await service.createTMAccount(
        userId,
        strategyId,
        mainCurrency,
      );

      expect(createSettingsSpy).toHaveBeenCalledWith(prismaMock, userId);

      expect(prismaMock.account.create).toHaveBeenCalledWith({
        data: {
          ownerId: userId,
          accountType: AccountTypeEnum.TM,
          extra: { strategyId },
          walletNumber: {
            create: {
              walletId: 'abc',
            },
          },
          subAccounts: {
            createMany: {
              data: [
                { currencyCode: DefaultCurrenciesEnum.USD, isPrimary: true },
                { currencyCode: DefaultCurrenciesEnum.EUR, isPrimary: false },
                { currencyCode: DefaultCurrenciesEnum.RUB, isPrimary: false },
                { currencyCode: DefaultCurrenciesEnum.JPY, isPrimary: false },
              ],
            },
          },
        },
      });

      expect(triggersMock.postTMAccountCreation).toHaveBeenCalledWith(
        createdAccount,
      );

      expect(result).toEqual(createdAccount);
    });

    it('should throw an error if account creation fails', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);

        return createdAccount;
      });

      prismaMock.account.create.mockRejectedValueOnce(
        new Error('Creation failed'),
      );

      await expect(
        service.createTMAccount(userId, strategyId, mainCurrency),
      ).rejects.toThrow('Creation failed');

      expect(triggersMock.postTMAccountCreation).not.toHaveBeenCalled();
    });

    it('should correctly generate a walletId using the userId', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
        return createdAccount;
      });

      walletNumberServiceMock.generateWalletId.mockResolvedValue('abc');

      await service.createTMAccount(userId, strategyId, mainCurrency);

      expect(prismaMock.account.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            walletNumber: {
              create: {
                walletId: 'abc',
              },
            },
          }),
        }),
      );
    });
  });

  describe('makeExternalDeposit', () => {
    it('should make an external deposit', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      // Mocking getOwnerAccount to return a valid owner account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        currencyCode: 'USD',
        accountId: 1,
      } as any);

      const params = {
        accountId: 1,
        amount: BigInt(1000),
        currency: 'USD' as DefaultCurrenciesEnum,
        receiptId: 1,
        comment: 'External deposit',
      };

      // Mocking transaction.create method
      prismaMock.transaction.create.mockResolvedValueOnce({
        id: 1,
      } as any);

      // Mocking confirmTransaction method
      jest.spyOn(service, 'confirmTransaction').mockResolvedValue(void 0);

      jest
        .spyOn(service, 'checkIfAccountsIsNotOverLimit')
        .mockResolvedValue(void 0);

      await service.makeExternalDeposit(META, params);

      // Asserting that getOwnerAccount was called with correct arguments
      expect(service.getOwnerAccount).toHaveBeenCalledWith(
        prismaMock,
        params.accountId,
        false,
        META.userId,
      );

      // Asserting that findSubAccountOrThrow was called with correct arguments
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.currency,
        1, // ownerAccount.id
        'Sub account not found',
      );

      // Asserting that transaction.create was called with correct arguments
      expect(prismaMock.transaction.create).toHaveBeenCalledWith({
        data: {
          branchId: META.branchId,
          amount: params.amount,
          receiptId: params.receiptId,
          subAccountId: 2, // subAccount.id
          operationStatus: OperationStatusEnum.Pending,
          operationType: OperationTypeEnum.Deposit,
          operationSubType: OperationSubTypeEnum.ExternalDeposit,
          paymentMethodUsed: { type: 'bankAccount' },
          comment: params.comment,
        },
      });

      // Asserting that postExternalDeposit was called with correct arguments
      expect(triggersMock.postExternalDeposit).toHaveBeenCalledWith(
        META,
        params,
        { isAccountant: false },
      );
    });

    it('should make an external deposit AS ACCOUNTANT', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      const subAccountOwnerId = 100;

      // Mocking getOwnerAccount to return a valid owner account for an accountant
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: subAccountOwnerId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        currencyCode: 'USD',
        accountId: 1,
      } as any);

      // Mocking the transaction.create method to return a created transaction
      prismaMock.transaction.create.mockResolvedValueOnce({
        id: 1,
      } as any);

      const params = {
        accountId: 1,
        amount: BigInt(1000),
        currency: 'USD' as DefaultCurrenciesEnum,
        receiptId: 1,
        comment: 'External deposit',
      };

      // Mocking confirmTransaction method
      jest.spyOn(service, 'confirmTransaction').mockResolvedValue(void 0);
      jest
        .spyOn(service, 'checkIfAccountsIsNotOverLimit')
        .mockResolvedValue(void 0);

      await service.makeExternalDeposit(
        { ...META, role: RoleEnum.Accountant },
        params,
      );

      // Asserting that getOwnerAccount was called with correct arguments
      expect(service.getOwnerAccount).toHaveBeenCalledWith(
        prismaMock,
        params.accountId,
        true,
        META.userId,
      );

      // Asserting that findSubAccountOrThrow was called with correct arguments
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.currency,
        1, // ownerAccount.id
        'Sub account not found',
      );

      // Asserting that transaction.create was called with correct arguments
      expect(prismaMock.transaction.create).toHaveBeenCalledWith({
        data: {
          branchId: META.branchId,
          amount: params.amount,
          receiptId: params.receiptId,
          subAccountId: 2, // subAccount.id
          operationStatus: OperationStatusEnum.Completed,
          operationType: OperationTypeEnum.Deposit,
          operationSubType: OperationSubTypeEnum.ExternalDeposit,
          paymentMethodUsed: { type: 'bankAccount' },
          comment: params.comment,
        },
      });

      // Asserting that postExternalDeposit was called with correct arguments
      expect(triggersMock.postExternalDeposit).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        params,
        { isAccountant: true },
      );

      // Asserting that confirmTransaction was called with correct arguments
      expect(service.confirmTransaction).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        {
          isConfirmed: true,
          transactionId: 1, // result.id from the transaction.create
        },
        { tx: prismaMock },
      );
    });

    it('should throw an error if subAccount is not found', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      // Mocking getOwnerAccount to return a valid owner account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to throw an error (sub-account not found)
      jest
        .spyOn(service, 'findSubAccountOrThrow')
        .mockRejectedValueOnce(
          new BadRequestException('Sub account not found'),
        );

      const params = {
        accountId: 1,
        amount: BigInt(1000),
        currency: 'USD' as DefaultCurrenciesEnum,
        receiptId: 1,
        comment: 'External deposit',
      };

      // Expecting the makeExternalDeposit to throw a BadRequestException
      await expect(service.makeExternalDeposit(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('makeExternalWithdrawal', () => {
    it('should make an external withdrawal', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      // Mocking getOwnerAccount to return a valid owner account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        currencyCode: 'USD',
        accountId: 1,
      } as any);

      // Mocking ensureEnoughBalance method
      jest.spyOn(service, 'ensureEnoughBalance').mockResolvedValue(void 0);

      const params = {
        accountId: 1,
        currency: 'USD' as DefaultCurrenciesEnum,
        details: {
          bankName: 'Bank',
          accountNumber: '1234567890',
          countryCode: '',
          iban: '',
          bic: '',
          recipientName: '',
          purposeOfPayment: '',
        },
        amount: BigInt(1000),
        code: '0000',
        comment: 'External withdrawal',
      };

      // Mocking confirmTransactionByCode method
      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);
      jest.spyOn(service, 'confirmTransaction').mockResolvedValue(void 0);

      await service.makeExternalWithdrawal(META, params);

      // Asserting that confirmTransactionByCode was called with correct arguments
      expect(service.confirmTransactionByCode).toHaveBeenCalledWith(
        META.userId,
        params.code,
      );

      // Asserting that getOwnerAccount was called with correct arguments
      expect(service.getOwnerAccount).toHaveBeenCalledWith(
        prismaMock,
        params.accountId,
        false,
        META.userId,
      );

      // Asserting that findSubAccountOrThrow was called with correct arguments
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.currency,
        1, // ownerAccount.id
        'Sub account not found',
      );

      // Asserting that ensureEnoughBalance was called with correct arguments
      expect(service.ensureEnoughBalance).toHaveBeenCalledWith({
        tx: prismaMock,
        ownerId: META.userId,
        subAccountId: 2, // subAccount.id
        amount: params.amount,
      });

      // Asserting that transaction.create was called with correct arguments
      expect(prismaMock.transaction.create).toHaveBeenCalledWith({
        data: {
          branchId: META.branchId,
          amount: params.amount,
          subAccountId: 2, // subAccount.id
          operationStatus: OperationStatusEnum.Pending,
          operationType: OperationTypeEnum.Withdrawal,
          operationSubType: OperationSubTypeEnum.ExternalWithdrawal,
          paymentMethodUsed: {
            type: 'bankAccount',
            details: JSON.stringify(params.details),
          },
          comment: params.comment,
        },
      });

      // Asserting that postExternalWithdrawal was called with correct arguments
      expect(triggersMock.postExternalWithdrawal).toHaveBeenCalledWith(
        META,
        params,
        { isAccountant: false },
      );
    });

    it('should make an external withdrawal AS ACCOUNTANT', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      const subAccountOwnerId = 100;

      // Mocking getOwnerAccount to return a valid owner account for an accountant
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: subAccountOwnerId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        currencyCode: 'USD',
        accountId: 1,
      } as any);

      // Mocking ensureEnoughBalance method
      jest.spyOn(service, 'ensureEnoughBalance').mockResolvedValue(void 0);

      // Mocking the transaction.create method to return a created transaction
      prismaMock.transaction.create.mockResolvedValueOnce({
        id: 1,
      } as any);

      const params = {
        accountId: 1,
        currency: 'USD' as DefaultCurrenciesEnum,
        details: {
          bankName: 'Bank',
          accountNumber: '1234567890',
          countryCode: '',
          iban: '',
          bic: '',
          recipientName: '',
          purposeOfPayment: '',
        },
        amount: BigInt(1000),
        code: '0000',
        comment: 'External withdrawal',
      };

      // Mocking confirmTransaction method
      jest.spyOn(service, 'confirmTransaction').mockResolvedValue(void 0);
      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      await service.makeExternalWithdrawal(
        { ...META, role: RoleEnum.Accountant },
        params,
      );

      // Asserting that confirmTransactionByCode was NOT called
      expect(service.confirmTransactionByCode).not.toHaveBeenCalled();

      // Asserting that getOwnerAccount was called with correct arguments
      expect(service.getOwnerAccount).toHaveBeenCalledWith(
        prismaMock,
        params.accountId,
        true,
        META.userId,
      );

      // Asserting that findSubAccountOrThrow was called with correct arguments
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.currency,
        1, // ownerAccount.id
        'Sub account not found',
      );

      // Asserting that ensureEnoughBalance was called with correct arguments
      expect(service.ensureEnoughBalance).toHaveBeenCalledWith({
        tx: prismaMock,
        ownerId: subAccountOwnerId,
        subAccountId: 2, // subAccount.id
        amount: params.amount,
      });

      // Asserting that transaction.create was called with correct arguments
      expect(prismaMock.transaction.create).toHaveBeenCalledWith({
        data: {
          branchId: META.branchId,
          amount: params.amount,
          subAccountId: 2, // subAccount.id
          operationStatus: OperationStatusEnum.Pending,
          operationType: OperationTypeEnum.Withdrawal,
          operationSubType: OperationSubTypeEnum.ExternalWithdrawal,
          paymentMethodUsed: {
            type: 'bankAccount',
            details: JSON.stringify(params.details),
          },
          comment: params.comment,
        },
      });

      // Asserting that postExternalWithdrawal was called with correct arguments
      expect(triggersMock.postExternalWithdrawal).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        params,
        { isAccountant: true },
      );

      // Asserting that confirmTransaction was called with correct arguments
      expect(service.confirmTransaction).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        {
          isConfirmed: true,
          transactionId: 1, // result.id from the transaction.create
        },
        { tx: prismaMock },
      );
    });

    it('should throw an error if subAccount is not found', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      // Mocking getOwnerAccount to return a valid owner account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to throw an error (sub-account not found)
      jest
        .spyOn(service, 'findSubAccountOrThrow')
        .mockRejectedValueOnce(
          new BadRequestException('Sub account not found'),
        );

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const params = {
        accountId: 1,
        currency: 'USD' as DefaultCurrenciesEnum,
        details: {
          bankName: 'Bank',
          accountNumber: '1234567890',
          countryCode: '',
          iban: '',
          bic: '',
          recipientName: '',
          purposeOfPayment: '',
        },
        amount: BigInt(1000),
        code: '0000',
        comment: 'External withdrawal',
      };

      // Expecting the makeExternalWithdrawal to throw a BadRequestException
      await expect(
        service.makeExternalWithdrawal(META, params),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('makeP2PTransfer', () => {
    it('should make a P2P transfer', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      // Mocking confirmTransactionByCode method
      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      // Mocking getOwnerAccount to return a valid account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 10,
        currencyCode: 'USD',
      } as any);

      // Mocking findAccountOrThrow to return a target account
      jest.spyOn(service, 'findAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        ownerId: 200,
      } as any);

      // Mocking findSubAccountOrThrow to return a target sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 20,
        currencyCode: 'USD',
      } as any);

      // Mocking ensureEnoughBalance method
      jest.spyOn(service, 'ensureEnoughBalance').mockResolvedValue(void 0);

      // Mocking createLinkedTransactions method
      jest.spyOn(service, 'createLinkedTransactions').mockResolvedValue(void 0);

      const params = {
        fromAccountId: 1,
        targetAccountId: 'M1111111',
        currency: 'USD' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'P2P Transfer',
      };

      await service.makeP2PTransfer(META, params);

      // Asserting that confirmTransactionByCode was called with correct arguments
      expect(service.confirmTransactionByCode).toHaveBeenCalledWith(
        META.userId,
        params.code,
      );

      // Asserting that getOwnerAccount was called with correct arguments
      expect(service.getOwnerAccount).toHaveBeenCalledWith(
        prismaMock,
        params.fromAccountId,
        false,
        META.userId,
      );

      // Asserting that findSubAccountOrThrow was called for owner sub-account
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.currency,
        1, // ownerAccount.id
        'Target sub account not found',
      );

      // Asserting that findAccountOrThrow was called with correct arguments
      expect(service.findAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.targetAccountId,
        'Target account not found',
      );

      // Asserting that findSubAccountOrThrow was called for target sub-account
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.currency,
        2, // targetAccount.id
        'Target sub account not found',
      );

      // Asserting that ensureEnoughBalance was called with correct arguments
      expect(service.ensureEnoughBalance).toHaveBeenCalledWith({
        tx: prismaMock,
        ownerId: META.userId,
        subAccountId: 10, // ownerSubAccount.id
        amount: params.amount,
      });

      // Asserting that createLinkedTransactions was called with correct arguments
      expect(service.createLinkedTransactions).toHaveBeenCalledWith(
        prismaMock,
        {
          branchId: META.branchId,
          amount: params.amount,
          fromSubAccountId: 10, // ownerSubAccount.id
          toSubAccountId: 20, // targetSubAccount.id
          operationSubType: OperationSubTypeEnum.PeerToPeerTransfer,
          isConfirmed: true,
          paymentMethodUsed: { type: 'p2p' },
          comment: params.comment,
        },
      );

      // Asserting that postP2PTransferOutgo was called with correct arguments
      expect(triggersMock.postP2PTransferOutgo).toHaveBeenCalledWith(
        META,
        params,
        { isAccountant: false },
      );

      // Asserting that postP2PTransferIncome was called with correct arguments
      expect(triggersMock.postP2PTransferIncome).toHaveBeenCalledWith(
        META,
        { ...params, targetUserId: 200 }, // Adjusted to use targetUserId from targetAccount.ownerId
        { isAccountant: false },
      );
    });

    it('should make a P2P transfer AS ACCOUNTANT', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      const subAccountOwnerId = 100;

      // Mocking getOwnerAccount to return a valid account for an accountant
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: subAccountOwnerId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 10,
        currencyCode: 'USD',
      } as any);

      // Mocking findAccountOrThrow to return a target account
      jest.spyOn(service, 'findAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        ownerId: 200,
      } as any);

      // Mocking findSubAccountOrThrow to return a target sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 20,
        currencyCode: 'USD',
      } as any);

      // Mocking ensureEnoughBalance method
      jest.spyOn(service, 'ensureEnoughBalance').mockResolvedValue(void 0);

      // Mocking createLinkedTransactions method
      jest.spyOn(service, 'createLinkedTransactions').mockResolvedValue(void 0);

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const params = {
        fromAccountId: 1,
        targetAccountId: 'M1111111',
        currency: 'USD' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'P2P Transfer',
      };

      await service.makeP2PTransfer(
        { ...META, role: RoleEnum.Accountant },
        params,
      );

      // Asserting that confirmTransactionByCode was NOT called
      expect(service.confirmTransactionByCode).not.toHaveBeenCalled();

      // Asserting that getOwnerAccount was called with correct arguments
      expect(service.getOwnerAccount).toHaveBeenCalledWith(
        prismaMock,
        params.fromAccountId,
        true,
        META.userId,
      );

      // Asserting that findSubAccountOrThrow was called for owner sub-account
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.currency,
        1, // ownerAccount.id
        'Target sub account not found',
      );

      // Asserting that findAccountOrThrow was called with correct arguments
      expect(service.findAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.targetAccountId,
        'Target account not found',
      );

      // Asserting that findSubAccountOrThrow was called for target sub-account
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.currency,
        2, // targetAccount.id
        'Target sub account not found',
      );

      // Asserting that ensureEnoughBalance was called with correct arguments
      expect(service.ensureEnoughBalance).toHaveBeenCalledWith({
        tx: prismaMock,
        ownerId: subAccountOwnerId,
        subAccountId: 10, // ownerSubAccount.id
        amount: params.amount,
      });

      // Asserting that createLinkedTransactions was called with correct arguments
      expect(service.createLinkedTransactions).toHaveBeenCalledWith(
        prismaMock,
        {
          branchId: META.branchId,
          amount: params.amount,
          fromSubAccountId: 10, // ownerSubAccount.id
          toSubAccountId: 20, // targetSubAccount.id
          operationSubType: OperationSubTypeEnum.PeerToPeerTransfer,
          isConfirmed: true,
          paymentMethodUsed: { type: 'p2p' },
          comment: params.comment,
        },
      );

      // Asserting that postP2PTransferOutgo was called with correct arguments
      expect(triggersMock.postP2PTransferOutgo).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        params,
        { isAccountant: true },
      );

      // Asserting that postP2PTransferIncome was called with correct arguments
      expect(triggersMock.postP2PTransferIncome).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        { ...params, targetUserId: 200 }, // Adjusted to use targetUserId from targetAccount.ownerId
        { isAccountant: true },
      );
    });

    it('should throw an error if initiating a transfer to self', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      const subAccountOwnerId = 100;

      // Mocking getOwnerAccount to return a valid account for an accountant
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: subAccountOwnerId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 10,
        currencyCode: 'USD',
      } as any);

      // Mocking findAccountOrThrow to return a target account
      jest.spyOn(service, 'findAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        ownerId: subAccountOwnerId,
      } as any);

      // Mocking findSubAccountOrThrow to return a target sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 20,
        currencyCode: 'USD',
      } as any);

      // Mocking ensureEnoughBalance method
      jest.spyOn(service, 'ensureEnoughBalance').mockResolvedValue(void 0);

      // Mocking createLinkedTransactions method
      jest.spyOn(service, 'createLinkedTransactions').mockResolvedValue(void 0);

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const params = {
        fromAccountId: 1,
        targetAccountId: 'M1111111',
        currency: 'USD' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'P2P Transfer',
      };

      await expect(service.makeP2PTransfer(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if initiator subAccount is not found', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      const subAccountOwnerId = 100;

      // Mocking getOwnerAccount to return a valid account for an accountant
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: subAccountOwnerId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 10,
        currencyCode: 'USD',
      } as any);

      // Mocking findAccountOrThrow to return a target account
      jest.spyOn(service, 'findAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        ownerId: subAccountOwnerId,
      } as any);

      jest
        .spyOn(service, 'findSubAccountOrThrow')
        .mockRejectedValueOnce(
          new BadRequestException('Target sub account not found'),
        );

      // Mocking ensureEnoughBalance method
      jest.spyOn(service, 'ensureEnoughBalance').mockResolvedValue(void 0);

      // Mocking createLinkedTransactions method
      jest.spyOn(service, 'createLinkedTransactions').mockResolvedValue(void 0);

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const params = {
        fromAccountId: 1,
        targetAccountId: 'M1111111',
        currency: 'USD' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'P2P Transfer',
      };

      // Expecting the makeP2PTransfer to throw a BadRequestException
      await expect(service.makeP2PTransfer(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if target subAccount is not found', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      // Mocking getOwnerAccount to return a valid account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid owner sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 10,
        currencyCode: 'USD',
      } as any);

      // Mocking findAccountOrThrow to return a valid target account
      jest.spyOn(service, 'findAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        ownerId: 200,
      } as any);

      // Mocking findSubAccountOrThrow to throw an exception for target sub-account
      jest
        .spyOn(service, 'findSubAccountOrThrow')
        .mockRejectedValueOnce(
          new BadRequestException('Target sub account not found'),
        );

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const params = {
        fromAccountId: 1,
        targetAccountId: 'M1111111',
        currency: 'USD' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'P2P Transfer',
      };

      // Expecting the makeP2PTransfer to throw a BadRequestException
      await expect(service.makeP2PTransfer(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('makeInternalChange', () => {
    it('should make an internal change', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      // Mocking confirmTransactionByCode method
      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      // Mocking getOwnerAccount to return a valid account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 10,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account for fromCurrency
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 1,
        currencyCode: 'USD',
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account for toCurrency
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        currencyCode: 'EUR',
      } as any);

      // Mocking ensureEnoughBalance method
      jest.spyOn(service, 'ensureEnoughBalance').mockResolvedValue(void 0);

      // Mocking createLinkedTransactions method
      jest.spyOn(service, 'createLinkedTransactions').mockResolvedValue([
        { id: 1, amount: BigInt(1000) },
        { id: 2, amount: BigInt(1000) },
      ] as any);

      const params = {
        fromAccountId: 10,
        fromCurrency: 'USD' as DefaultCurrenciesEnum,
        toCurrency: 'EUR' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'Internal Change',
      };

      jest.spyOn(service, 'convertCurrency').mockReturnValue(1000n);

      await service.makeInternalChange(META, params);

      // Asserting that confirmTransactionByCode was called with correct arguments
      expect(service.confirmTransactionByCode).toHaveBeenCalledWith(
        META.userId,
        params.code,
      );

      // Asserting that getOwnerAccount was called with correct arguments
      expect(service.getOwnerAccount).toHaveBeenCalledWith(
        prismaMock,
        params.fromAccountId,
        false,
        META.userId,
      );

      // Asserting that findSubAccountOrThrow was called for fromCurrency sub-account
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.fromCurrency,
        10, // ownerAccount.id
        'Owner sub account not found',
      );

      // Asserting that findSubAccountOrThrow was called for toCurrency sub-account
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.toCurrency,
        10, // ownerAccount.id
        'Target sub account not found',
      );

      // Asserting that ensureEnoughBalance was called with correct arguments
      expect(service.ensureEnoughBalance).toHaveBeenCalledWith({
        tx: prismaMock,
        ownerId: META.userId,
        subAccountId: 1, // fromSubAccount.id
        amount: params.amount,
      });

      // Asserting that createLinkedTransactions was called with correct arguments
      expect(service.createLinkedTransactions).toHaveBeenCalledWith(
        prismaMock,
        {
          branchId: META.branchId,
          amount: params.amount,
          fromSubAccountId: 1, // fromSubAccount.id
          toSubAccountId: 2, // toSubAccount.id
          operationSubType: OperationSubTypeEnum.InternalChange,
          isConfirmed: false,
          paymentMethodUsed: { type: 'internal change' },
          comment: params.comment,
          resultingAmount: BigInt(1000),
        },
      );

      // Asserting that postInternalChangeOutgo was called with correct arguments
      expect(triggersMock.postInternalChangeOutgo).toHaveBeenCalledWith(
        META,
        params,
        { isAccountant: false },
      );

      // Asserting that postInternalChangeIncome was called with correct arguments
      expect(triggersMock.postInternalChangeIncome).toHaveBeenCalledWith(
        META,
        params,
        { isAccountant: false },
      );
    });

    it('should make an internal change AS ACCOUNTANT', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      const subAccountOwnerId = 100;

      // Mocking getOwnerAccount to return a valid account for an accountant
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 10,
        ownerId: subAccountOwnerId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account for fromCurrency
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 1,
        currencyCode: 'USD',
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account for toCurrency
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        currencyCode: 'EUR',
      } as any);

      // Mocking ensureEnoughBalance method
      jest.spyOn(service, 'ensureEnoughBalance').mockResolvedValue(void 0);

      // Mocking createLinkedTransactions method
      jest.spyOn(service, 'createLinkedTransactions').mockResolvedValue([
        { id: 1, amount: BigInt(1000) },
        { id: 2, amount: BigInt(2000) },
      ] as any);

      // Mocking confirmTransaction method
      jest.spyOn(service, 'confirmTransaction').mockResolvedValue(void 0);

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const params = {
        fromAccountId: 10,
        fromCurrency: 'USD' as DefaultCurrenciesEnum,
        toCurrency: 'EUR' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'Internal Change',
      };

      jest.spyOn(service, 'convertCurrency').mockReturnValue(2000n);

      await service.makeInternalChange(
        { ...META, role: RoleEnum.Accountant },
        params,
      );

      // Asserting that confirmTransactionByCode was NOT called
      expect(service.confirmTransactionByCode).not.toHaveBeenCalled();

      // Asserting that getOwnerAccount was called with correct arguments
      expect(service.getOwnerAccount).toHaveBeenCalledWith(
        prismaMock,
        params.fromAccountId,
        true,
        META.userId,
      );

      // Asserting that findSubAccountOrThrow was called for fromCurrency sub-account
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.fromCurrency,
        10, // ownerAccount.id
        'Owner sub account not found',
      );

      // Asserting that findSubAccountOrThrow was called for toCurrency sub-account
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.toCurrency,
        10, // ownerAccount.id
        'Target sub account not found',
      );

      // Asserting that ensureEnoughBalance was called with correct arguments
      expect(service.ensureEnoughBalance).toHaveBeenCalledWith({
        tx: prismaMock,
        ownerId: subAccountOwnerId,
        subAccountId: 1, // fromSubAccount.id
        amount: params.amount,
      });

      // Asserting that createLinkedTransactions was called with correct arguments
      expect(service.createLinkedTransactions).toHaveBeenCalledWith(
        prismaMock,
        {
          branchId: META.branchId,
          amount: params.amount,
          fromSubAccountId: 1, // fromSubAccount.id
          toSubAccountId: 2, // toSubAccount.id
          operationSubType: OperationSubTypeEnum.InternalChange,
          isConfirmed: false,
          paymentMethodUsed: { type: 'internal change' },
          comment: params.comment,
          resultingAmount: 2000n,
        },
      );

      // Asserting that postInternalChangeOutgo was called with correct arguments
      expect(triggersMock.postInternalChangeOutgo).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        params,
        { isAccountant: true },
      );

      // Asserting that postInternalChangeIncome was called with correct arguments
      expect(triggersMock.postInternalChangeIncome).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        params,
        { isAccountant: true },
      );

      // Asserting that confirmTransaction was called twice with correct arguments
      expect(service.confirmTransaction).toHaveBeenCalledTimes(2);
      expect(service.confirmTransaction).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        { isConfirmed: true, transactionId: 1, amount: BigInt(1000) },
        { tx: prismaMock },
      );
      expect(service.confirmTransaction).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        { isConfirmed: true, transactionId: 2 },
        { tx: prismaMock },
      );
    });

    it('should throw an error if trying to change to the same currency', async () => {
      const params = {
        fromAccountId: 10,
        fromCurrency: 'USD' as DefaultCurrenciesEnum,
        toCurrency: 'USD' as DefaultCurrenciesEnum, // Same currency
        amount: BigInt(1000),
        code: '0000',
        comment: 'Internal Change',
      };

      await expect(service.makeInternalChange(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if initiator subAccount is not found', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      // Mocking getOwnerAccount to return a valid account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 10,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to throw an exception
      jest
        .spyOn(service, 'findSubAccountOrThrow')
        .mockRejectedValueOnce(
          new BadRequestException('Owner sub account not found'),
        );

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const params = {
        fromAccountId: 10,
        fromCurrency: 'USD' as DefaultCurrenciesEnum,
        toCurrency: 'EUR' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'Internal Change',
      };

      // Expecting the makeInternalChange to throw a BadRequestException
      await expect(service.makeInternalChange(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if target subAccount is not found', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      // Mocking getOwnerAccount to return a valid account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 10,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid owner sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 1,
        currencyCode: 'USD',
      } as any);

      // Mocking findSubAccountOrThrow to throw an exception for target sub-account
      jest
        .spyOn(service, 'findSubAccountOrThrow')
        .mockRejectedValueOnce(
          new BadRequestException('Target sub account not found'),
        );

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const params = {
        fromAccountId: 10,
        fromCurrency: 'USD' as DefaultCurrenciesEnum,
        toCurrency: 'EUR' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'Internal Change',
      };

      // Expecting the makeInternalChange to throw a BadRequestException
      await expect(service.makeInternalChange(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if changing between the same sub-account', async () => {
      const params = {
        fromAccountId: 10,
        fromCurrency: 'USD' as DefaultCurrenciesEnum,
        toCurrency: 'EUR' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'Internal Change',
      };

      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      // Mocking getOwnerAccount to return a valid account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 10,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to return the same sub-account for both fromCurrency and toCurrency
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 1,
        currencyCode: 'USD',
      } as any);
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 1,
        currencyCode: 'EUR',
      } as any);

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      await expect(service.makeInternalChange(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('makeInvestTMTransfer', () => {
    it('should make an investment transfer to a TM account', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      // Mocking findFirst to return a valid owner account
      prismaMock.account.findFirst.mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
        accountType: AccountTypeEnum.Master,
      });

      // Mocking findSubAccountOrThrow to return a valid sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 1,
        currencyCode: 'USD',
        ownerId: META.userId,
      } as any);

      // Mocking $queryRaw to return a target TM account and sub-account
      prismaMock.$queryRaw.mockResolvedValueOnce([
        { ownerId: 200, subAccountId: 2 },
      ] as any);

      // Mocking ensureEnoughBalance method
      jest.spyOn(service, 'ensureEnoughBalance').mockResolvedValue(void 0);

      // Mocking createLinkedTransactions method
      jest.spyOn(service, 'createLinkedTransactions').mockResolvedValue([
        { id: 1, amount: BigInt(1000) },
        { id: 2, amount: BigInt(1000) },
      ] as any);

      // Mocking createTMTransaction method
      scProductsTmServiceMock.createTMTransaction.mockResolvedValue({
        ok: true,
      });

      const params = {
        strategyId: 2,
        amount: BigInt(1000),
        currency: DefaultCurrenciesEnum.USD,
        code: '0000',
        comment: 'Investment Transfer',
      };

      // Mocking confirmTransactionByCode method
      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      await service.makeInvestTMTransfer(META, params);

      // Asserting that confirmTransactionByCode was called with correct arguments
      expect(service.confirmTransactionByCode).toHaveBeenCalledWith(
        META.userId,
        params.code,
      );

      // Asserting that $queryRaw was called to find the target TM account and sub-account
      expect(prismaMock.$queryRaw).toHaveBeenCalledWith(
        expect.anything(),
        2,
        'USD',
      );

      // Asserting that ensureEnoughBalance was called with correct arguments
      expect(service.ensureEnoughBalance).toHaveBeenCalledWith({
        tx: prismaMock,
        ownerId: META.userId,
        subAccountId: 1, // subAccount.id from findSubAccountOrThrow
        amount: params.amount,
      });

      // Asserting that createLinkedTransactions was called with correct arguments
      expect(service.createLinkedTransactions).toHaveBeenCalledWith(
        prismaMock,
        {
          branchId: META.branchId,
          amount: params.amount,
          fromSubAccountId: 1, // subAccount.id from findSubAccountOrThrow
          toSubAccountId: 2, // targetData.subAccountId
          operationSubType: OperationSubTypeEnum.TransferToStrategy,
          isConfirmed: true,
          paymentMethodUsed: { type: 'internal' },
          comment: params.comment,
        },
      );

      // Asserting that createTMTransaction was called with correct arguments
      expect(scProductsTmServiceMock.createTMTransaction).toHaveBeenCalledWith({
        clientId: META.userId,
        strategyId: params.strategyId,
        operationType: OperationTypeEnum.Deposit,
        operationStatus: OperationStatusEnum.Completed,
        branchId: META.branchId,
        clientSubAccountId: 1, // subAccount.id from findSubAccountOrThrow
        strategySubAccountId: 2,
        originalTransactionIds: [1, 2],
      });

      // Asserting that postInvestTMTransferOutgo was called with correct arguments
      expect(triggersMock.postInvestTMTransferOutgo).toHaveBeenCalledWith(
        META,
        params,
        { isAccountant: false },
      );

      // Asserting that postInvestTMTransferIncome was called with correct arguments
      expect(triggersMock.postInvestTMTransferIncome).toHaveBeenCalledWith(
        META,
        params,
        {
          isAccountant: false,
          trusteeId: 200, // targetData.ownerId
        },
      );
    });

    it('should throw an error if initiator subAccount is not found', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      // Mocking findFirst to return a valid owner account
      prismaMock.account.findFirst.mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
        accountType: AccountTypeEnum.Master,
      });

      // Mocking findSubAccountOrThrow to throw an error
      jest
        .spyOn(service, 'findSubAccountOrThrow')
        .mockRejectedValueOnce(
          new BadRequestException('Sub account not found'),
        );

      const params = {
        strategyId: 2,
        amount: BigInt(1000),
        currency: DefaultCurrenciesEnum.USD,
        code: '0000',
        comment: 'Investment Transfer',
      };

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      await expect(service.makeInvestTMTransfer(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if target TM account is not found', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      prismaMock.account.findFirst.mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
        accountType: AccountTypeEnum.Master,
      });

      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 1,
        currencyCode: 'USD',
        ownerId: META.userId,
      } as any);

      prismaMock.$queryRaw.mockResolvedValueOnce([]);

      const params = {
        strategyId: 2,
        amount: BigInt(1000),
        currency: DefaultCurrenciesEnum.USD,
        code: '0000',
        comment: 'Investment Transfer',
      };

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      await expect(service.makeInvestTMTransfer(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if target TM sub-account is not found', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      prismaMock.account.findFirst.mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
        accountType: AccountTypeEnum.Master,
      });

      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 1,
        currencyCode: 'USD',
        ownerId: META.userId,
      } as any);

      prismaMock.$queryRaw.mockResolvedValueOnce([{ ownerId: 200 }]);

      const params = {
        strategyId: 2,
        amount: BigInt(1000),
        currency: DefaultCurrenciesEnum.USD,
        code: '0000',
        comment: 'Investment Transfer',
      };

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      await expect(service.makeInvestTMTransfer(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should make an investment transfer to a TM account AS ACCOUNTANT', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      const subAccountOwnerId = 100;

      prismaMock.account.findFirst.mockResolvedValueOnce({
        id: 1,
        ownerId: subAccountOwnerId,
        accountType: AccountTypeEnum.Master,
      });

      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 1,
        currencyCode: 'USD',
        ownerId: subAccountOwnerId,
      } as any);

      prismaMock.$queryRaw.mockResolvedValueOnce([
        { ownerId: 200, subAccountId: 2 },
      ] as any);

      jest.spyOn(service, 'ensureEnoughBalance').mockResolvedValue(void 0);

      jest.spyOn(service, 'createLinkedTransactions').mockResolvedValue([
        { id: 1, amount: BigInt(1000) },
        { id: 2, amount: BigInt(1000) },
      ] as any);

      scProductsTmServiceMock.createTMTransaction.mockResolvedValue({
        ok: true,
      });

      const params = {
        strategyId: 2,
        amount: BigInt(1000),
        currency: DefaultCurrenciesEnum.USD,
        code: '0000',
        comment: 'Investment Transfer',
      };

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      await service.makeInvestTMTransfer(
        { ...META, role: RoleEnum.Accountant },
        params,
      );

      expect(service.confirmTransactionByCode).not.toHaveBeenCalled();

      expect(prismaMock.$queryRaw).toHaveBeenCalledWith(
        expect.anything(),
        2,
        'USD',
      );

      expect(service.ensureEnoughBalance).toHaveBeenCalledWith({
        tx: prismaMock,
        ownerId: subAccountOwnerId,
        subAccountId: 1, // subAccount.id from findSubAccountOrThrow
        amount: params.amount,
      });

      expect(service.createLinkedTransactions).toHaveBeenCalledWith(
        prismaMock,
        {
          branchId: META.branchId,
          amount: params.amount,
          fromSubAccountId: 1, // subAccount.id from findSubAccountOrThrow
          toSubAccountId: 2, // targetData.subAccountId
          operationSubType: OperationSubTypeEnum.TransferToStrategy,
          isConfirmed: true,
          paymentMethodUsed: { type: 'internal' },
          comment: params.comment,
        },
      );

      expect(scProductsTmServiceMock.createTMTransaction).toHaveBeenCalledWith({
        clientId: META.userId,
        strategyId: params.strategyId,
        operationType: OperationTypeEnum.Deposit,
        operationStatus: OperationStatusEnum.Completed,
        branchId: META.branchId,
        clientSubAccountId: 1, // subAccount.id from findSubAccountOrThrow
        strategySubAccountId: 2,
        originalTransactionIds: [1, 2],
      });

      expect(triggersMock.postInvestTMTransferOutgo).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        params,
        { isAccountant: true },
      );

      expect(triggersMock.postInvestTMTransferIncome).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        params,
        {
          isAccountant: true,
          trusteeId: 200, // targetData.ownerId
        },
      );
    });
  });

  describe('AccountsService: makeWithdrawTMTransfer', () => {
    it('should make a TM withdrawal transfer', async () => {
      const params = {
        investmentId: 1,
        sharesAmount: 10,
        userId: 1,
        code: '1234',
      };
      const investment = {
        strategyId: 2,
        totalShares: 100,
        shareCost: BigInt(5000),
        baseCurrency: 'USD' as DefaultCurrenciesEnum,
      };
      const expectedResponse = { ok: true } as const;

      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );
      scProductsTmServiceMock.getInvestmentById.mockResolvedValue(investment);
      prismaMock.account.findFirst.mockResolvedValue({
        id: 1,
        ownerId: META.userId,
        accountType: 'Master',
      });
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 1,
        currencyCode: 'USD',
        ownerId: META.userId,
      } as any);
      prismaMock.$queryRaw.mockResolvedValueOnce([
        { ownerId: 200, subAccountId: 2 },
      ] as any);
      jest.spyOn(service, 'createLinkedTransactions').mockResolvedValue([
        { id: 1, amount: BigInt(50000) },
        { id: 2, amount: BigInt(50000) },
      ] as any);
      scProductsTmServiceMock.createTMTransaction.mockResolvedValue(
        expectedResponse,
      );
      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const result = await service.makeWithdrawTMTransfer(META, params);

      expect(service.confirmTransactionByCode).toHaveBeenCalledWith(
        META.userId,
        params.code,
      );
      expect(prismaMock.$queryRaw).toHaveBeenCalledWith(
        expect.anything(),
        2,
        'USD',
      );
      expect(service.createLinkedTransactions).toHaveBeenCalledWith(
        prismaMock,
        {
          branchId: META.branchId,
          amount: BigInt(50000), // 10 shares * 5000 shareCost
          fromSubAccountId: 2, // strategy subAccountId from mock
          toSubAccountId: 1, // subAccount.id from findSubAccountOrThrow
          operationSubType: OperationSubTypeEnum.TransferFromStrategy,
          isConfirmed: true,
          paymentMethodUsed: { type: 'internal' },
        },
      );
      expect(scProductsTmServiceMock.createTMTransaction).toHaveBeenCalledWith({
        clientId: META.userId,
        strategyId: investment.strategyId,
        operationType: OperationTypeEnum.Withdrawal,
        operationStatus: OperationStatusEnum.Completed,
        sharesProcessed: params.sharesAmount,
        branchId: META.branchId,
        clientSubAccountId: 1, // subAccount.id from findSubAccountOrThrow
        strategySubAccountId: 2, // strategy subAccountId from mock
        originalTransactionIds: [1, 2],
      });
      expect(triggersMock.postInvestTMTransferOutgo).toHaveBeenCalledWith(
        META,
        params,
        { isAccountant: false },
      );
      expect(triggersMock.postInvestTMTransferIncome).toHaveBeenCalledWith(
        META,
        params,
        {
          isAccountant: false,
          trusteeId: 200, // strategyAccount.ownerId from mock
        },
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if total shares are less than requested shares', async () => {
      const params = {
        investmentId: 1,
        sharesAmount: 1000, // more than available
        userId: 1,
        code: '1234',
      };
      const investment = {
        strategyId: 2,
        totalShares: 100,
        shareCost: BigInt(5000),
        baseCurrency: 'USD' as DefaultCurrenciesEnum,
      };
      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      scProductsTmServiceMock.getInvestmentById.mockResolvedValue(investment);

      await expect(
        service.makeWithdrawTMTransfer(META, params),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if strategy account is not found', async () => {
      const params = {
        investmentId: 1,
        sharesAmount: 10,
        userId: 1,
        code: '1234',
      };
      const investment = {
        strategyId: 2,
        totalShares: 100,
        shareCost: BigInt(5000),
        baseCurrency: 'USD' as DefaultCurrenciesEnum,
      };
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );
      scProductsTmServiceMock.getInvestmentById.mockResolvedValue(investment);
      prismaMock.account.findFirst.mockResolvedValue({
        id: 1,
        ownerId: META.userId,
        accountType: 'Master',
      });
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 1,
        currencyCode: 'USD',
        ownerId: META.userId,
      } as any);
      prismaMock.$queryRaw.mockResolvedValueOnce([] as any);
      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      scProductsTmServiceMock.getInvestmentById.mockResolvedValue(investment);
      prismaMock.$queryRaw.mockResolvedValueOnce([]);

      await expect(
        service.makeWithdrawTMTransfer(META, params),
      ).rejects.toThrow(BadRequestException);
    });

    it('should make a TM withdrawal transfer AS ACCOUNTANT without confirmation code', async () => {
      const params = {
        investmentId: 1,
        sharesAmount: 10,
        userId: 1,
        code: '1234',
      };
      const investment = {
        strategyId: 2,
        totalShares: 100,
        shareCost: BigInt(5000),
        baseCurrency: 'USD' as DefaultCurrenciesEnum,
      };
      const expectedResponse = { ok: true } as const;

      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );
      scProductsTmServiceMock.getInvestmentById.mockResolvedValue(investment);
      prismaMock.account.findFirst.mockResolvedValue({
        id: 1,
        ownerId: params.userId,
        accountType: 'Master',
      });
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 1,
        currencyCode: 'USD' as DefaultCurrenciesEnum,
        ownerId: params.userId,
      } as any);
      prismaMock.$queryRaw.mockResolvedValueOnce([
        { ownerId: 200, subAccountId: 2 },
      ] as any);
      jest.spyOn(service, 'createLinkedTransactions').mockResolvedValue([
        { id: 1, amount: BigInt(50000) },
        { id: 2, amount: BigInt(50000) },
      ] as any);
      scProductsTmServiceMock.createTMTransaction.mockResolvedValue(
        expectedResponse,
      );
      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const result = await service.makeWithdrawTMTransfer(
        { ...META, role: RoleEnum.Accountant },
        params,
      );

      expect(service.confirmTransactionByCode).not.toHaveBeenCalled();
      expect(prismaMock.$queryRaw).toHaveBeenCalledWith(
        expect.anything(),
        2,
        'USD',
      );
      expect(service.createLinkedTransactions).toHaveBeenCalledWith(
        prismaMock,
        {
          branchId: META.branchId,
          amount: BigInt(50000), // 10 shares * 5000 shareCost
          fromSubAccountId: 2, // strategy subAccountId from mock
          toSubAccountId: 1, // subAccount.id from findSubAccountOrThrow
          operationSubType: OperationSubTypeEnum.TransferFromStrategy,
          isConfirmed: true,
          paymentMethodUsed: { type: 'internal' },
        },
      );
      expect(scProductsTmServiceMock.createTMTransaction).toHaveBeenCalledWith({
        clientId: META.userId,
        strategyId: investment.strategyId,
        operationType: OperationTypeEnum.Withdrawal,
        operationStatus: OperationStatusEnum.Completed,
        sharesProcessed: params.sharesAmount,
        branchId: META.branchId,
        clientSubAccountId: 1, // subAccount.id from findSubAccountOrThrow
        strategySubAccountId: 2, // strategy subAccountId from mock
        originalTransactionIds: [1, 2],
      });
      expect(triggersMock.postInvestTMTransferOutgo).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        params,
        { isAccountant: true },
      );
      expect(triggersMock.postInvestTMTransferIncome).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        params,
        {
          isAccountant: true,
          trusteeId: 200, // strategyAccount.ownerId from mock
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('makeInternalTransfer', () => {
    it('should make an internal transfer', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      // Mocking confirmTransactionByCode method
      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      // Mocking getOwnerAccount to return a valid account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 10,
        currencyCode: 'USD',
      } as any);

      // Mocking findAccountOrThrow to return a target account
      jest.spyOn(service, 'findAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to return a target sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 20,
        currencyCode: 'USD',
      } as any);

      // Mocking ensureEnoughBalance method
      jest.spyOn(service, 'ensureEnoughBalance').mockResolvedValue(void 0);

      // Mocking createLinkedTransactions method
      jest.spyOn(service, 'createLinkedTransactions').mockResolvedValue([
        { id: 1, amount: BigInt(1000) },
        { id: 2, amount: BigInt(1000) },
      ] as any);

      const params = {
        fromAccountId: 1,
        targetAccountId: 2,
        currency: 'USD' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'Internal Transfer',
      };

      await service.makeInternalTransfer(META, params);

      // Asserting that confirmTransactionByCode was called with correct arguments
      expect(service.confirmTransactionByCode).toHaveBeenCalledWith(
        META.userId,
        params.code,
      );

      // Asserting that getOwnerAccount was called with correct arguments
      expect(service.getOwnerAccount).toHaveBeenCalledWith(
        prismaMock,
        params.fromAccountId,
        false,
        META.userId,
      );

      // Asserting that findSubAccountOrThrow was called for owner sub-account
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.currency,
        1, // ownerAccount.id
        'Target sub account not found',
      );

      // Asserting that findAccountOrThrow was called with correct arguments
      expect(service.findAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.targetAccountId,
        'Target account not found',
      );

      // Asserting that findSubAccountOrThrow was called for target sub-account
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.currency,
        2, // targetAccount.id
        'Target sub account not found',
      );

      // Asserting that ensureEnoughBalance was called with correct arguments
      expect(service.ensureEnoughBalance).toHaveBeenCalledWith({
        tx: prismaMock,
        ownerId: META.userId,
        subAccountId: 10, // ownerSubAccount.id
        amount: params.amount,
      });

      // Asserting that createLinkedTransactions was called with correct arguments
      expect(service.createLinkedTransactions).toHaveBeenCalledWith(
        prismaMock,
        {
          branchId: META.branchId,
          amount: params.amount,
          fromSubAccountId: 10, // ownerSubAccount.id
          toSubAccountId: 20, // targetSubAccount.id
          operationSubType: OperationSubTypeEnum.InternalTransfer,
          isConfirmed: true,
          paymentMethodUsed: { type: 'internal' },
          comment: params.comment,
        },
      );

      // Asserting that postInternalTransferOutgo was called with correct arguments
      expect(triggersMock.postInternalTransferOutgo).toHaveBeenCalledWith(
        META,
        params,
        { isAccountant: false },
      );

      // Asserting that postInternalTransferIncome was called with correct arguments
      expect(triggersMock.postInternalTransferIncome).toHaveBeenCalledWith(
        META,
        params,
        { isAccountant: false },
      );
    });

    it('should make an internal transfer AS ACCOUNTANT', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      const subAccountOwnerId = 100;

      // Mocking getOwnerAccount to return a valid account for an accountant
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: subAccountOwnerId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 10,
        currencyCode: 'USD',
      } as any);

      // Mocking findAccountOrThrow to return a target account
      jest.spyOn(service, 'findAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        ownerId: subAccountOwnerId,
      } as any);

      // Mocking findSubAccountOrThrow to return a target sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 20,
        currencyCode: 'USD',
      } as any);

      // Mocking ensureEnoughBalance method
      jest.spyOn(service, 'ensureEnoughBalance').mockResolvedValue(void 0);

      // Mocking createLinkedTransactions method
      jest.spyOn(service, 'createLinkedTransactions').mockResolvedValue([
        { id: 1, amount: BigInt(1000) },
        { id: 2, amount: BigInt(1000) },
      ] as any);

      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const params = {
        fromAccountId: 1,
        targetAccountId: 2,
        currency: 'USD' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'Internal Transfer',
      };

      await service.makeInternalTransfer(
        { ...META, role: RoleEnum.Accountant },
        params,
      );

      // Asserting that confirmTransactionByCode was NOT called
      expect(service.confirmTransactionByCode).not.toHaveBeenCalled();

      // Asserting that getOwnerAccount was called with correct arguments
      expect(service.getOwnerAccount).toHaveBeenCalledWith(
        prismaMock,
        params.fromAccountId,
        true,
        META.userId,
      );

      // Asserting that findSubAccountOrThrow was called for owner sub-account
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.currency,
        1, // ownerAccount.id
        'Target sub account not found',
      );

      // Asserting that findAccountOrThrow was called with correct arguments
      expect(service.findAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.targetAccountId,
        'Target account not found',
      );

      // Asserting that findSubAccountOrThrow was called for target sub-account
      expect(service.findSubAccountOrThrow).toHaveBeenCalledWith(
        prismaMock,
        params.currency,
        2, // targetAccount.id
        'Target sub account not found',
      );

      // Asserting that ensureEnoughBalance was called with correct arguments
      expect(service.ensureEnoughBalance).toHaveBeenCalledWith({
        tx: prismaMock,
        ownerId: subAccountOwnerId,
        subAccountId: 10, // ownerSubAccount.id
        amount: params.amount,
      });

      // Asserting that createLinkedTransactions was called with correct arguments
      expect(service.createLinkedTransactions).toHaveBeenCalledWith(
        prismaMock,
        {
          branchId: META.branchId,
          amount: params.amount,
          fromSubAccountId: 10, // ownerSubAccount.id
          toSubAccountId: 20, // targetSubAccount.id
          operationSubType: OperationSubTypeEnum.InternalTransfer,
          isConfirmed: true,
          paymentMethodUsed: { type: 'internal' },
          comment: params.comment,
        },
      );

      // Asserting that postInternalTransferOutgo was called with correct arguments
      expect(triggersMock.postInternalTransferOutgo).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        params,
        { isAccountant: true },
      );

      // Asserting that postInternalTransferIncome was called with correct arguments
      expect(triggersMock.postInternalTransferIncome).toHaveBeenCalledWith(
        { ...META, role: RoleEnum.Accountant },
        params,
        { isAccountant: true },
      );
    });

    it('should throw an error if initiator subAccount is not found', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      // Mocking getOwnerAccount to return a valid account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to throw an exception
      jest
        .spyOn(service, 'findSubAccountOrThrow')
        .mockRejectedValueOnce(
          new BadRequestException('Target sub account not found'),
        );
      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const params = {
        fromAccountId: 1,
        targetAccountId: 2,
        currency: 'USD' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'Internal Transfer',
      };

      // Expecting the makeInternalTransfer to throw a BadRequestException
      await expect(service.makeInternalTransfer(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if target subAccount is not found', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      // Mocking getOwnerAccount to return a valid account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid owner sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 10,
        currencyCode: 'USD',
      } as any);

      // Mocking findAccountOrThrow to return a valid target account
      jest.spyOn(service, 'findAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to throw an exception for target sub-account
      jest
        .spyOn(service, 'findSubAccountOrThrow')
        .mockRejectedValueOnce(
          new BadRequestException('Target sub account not found'),
        );
      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const params = {
        fromAccountId: 1,
        targetAccountId: 2,
        currency: 'USD' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'Internal Transfer',
      };

      // Expecting the makeInternalTransfer to throw a BadRequestException
      await expect(service.makeInternalTransfer(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if trying to transfer not to oneself', async () => {
      // Mocking the $transaction method
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );

      // Mocking getOwnerAccount to return a valid account
      jest.spyOn(service, 'getOwnerAccount').mockResolvedValueOnce({
        id: 1,
        ownerId: META.userId,
      } as any);

      // Mocking findSubAccountOrThrow to return a valid owner sub-account
      jest.spyOn(service, 'findSubAccountOrThrow').mockResolvedValueOnce({
        id: 10,
        currencyCode: 'USD',
      } as any);

      // Mocking findAccountOrThrow to return a target account with a different owner
      jest.spyOn(service, 'findAccountOrThrow').mockResolvedValueOnce({
        id: 2,
        ownerId: 999, // Different owner ID to simulate a not self-transfer
      } as any);
      jest.spyOn(service, 'confirmTransactionByCode').mockResolvedValue(void 0);

      const params = {
        fromAccountId: 1,
        targetAccountId: 2,
        currency: 'USD' as DefaultCurrenciesEnum,
        amount: BigInt(1000),
        code: '0000',
        comment: 'Internal Transfer',
      };

      // Expecting the makeInternalTransfer to throw a BadRequestException
      await expect(service.makeInternalTransfer(META, params)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('confirmTransaction', () => {
    it('should confirm a transaction', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      prismaMock.transaction.findUnique.mockResolvedValueOnce({
        id: 1,
        subAccount: {
          account: {
            ownerId: 1,
          },
        },
      } as any);

      const params = {
        transactionId: 1,
        isConfirmed: true,
      };

      await service.confirmTransaction(META, params, { tx: undefined });

      expect(prismaMock.transaction.findUnique).toHaveBeenCalledWith({
        where: {
          id: params.transactionId,
          // confirmationDate: null,
          // isConfirmed: false,
          // operationStatus: OperationStatusEnum.Pending,
          branchId: META.branchId,
        },
        include: {
          subAccount: {
            include: {
              account: {
                select: {
                  ownerId: true,
                },
              },
            },
          },
        },
      });

      expect(prismaMock.transaction.update).toHaveBeenCalledWith({
        where: {
          id: params.transactionId,
          branchId: META.branchId,
        },
        data: {
          confirmationDate: expect.any(Date),
          confirmedBy: META.userId,
          isConfirmed: true,
          operationStatus: OperationStatusEnum.Completed,
        },
      });

      expect(triggersMock.postConfirmTransaction).toHaveBeenCalledWith(
        META,
        {
          ...params,
          ownerId: 1,
        },
        { amountChanged: undefined },
      );
    });

    it('should confirm a transaction with updated amount', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        await callback(prismaMock);
      });

      prismaMock.transaction.findUnique.mockResolvedValueOnce({
        id: 1,
        amount: 1000,
        subAccount: {
          account: {
            ownerId: 1,
          },
        },
      } as any);

      const params = {
        transactionId: 1,
        isConfirmed: true,
        amount: BigInt(200),
      };

      await service.confirmTransaction(META, params, { tx: undefined });

      expect(prismaMock.transaction.findUnique).toHaveBeenCalledWith({
        where: {
          id: params.transactionId,
          // confirmationDate: null,
          // isConfirmed: false,
          // operationStatus: OperationStatusEnum.Pending,
          branchId: META.branchId,
        },
        include: {
          subAccount: {
            include: {
              account: {
                select: {
                  ownerId: true,
                },
              },
            },
          },
        },
      });

      expect(prismaMock.transaction.update).toHaveBeenCalledWith({
        where: {
          id: params.transactionId,
          branchId: META.branchId,
        },
        data: {
          confirmationDate: expect.any(Date),
          confirmedBy: META.userId,
          isConfirmed: true,
          operationStatus: OperationStatusEnum.Completed,
          amount: params.amount,
        },
      });

      expect(triggersMock.postConfirmTransaction).toHaveBeenCalledWith(
        META,
        {
          ...params,
          ownerId: 1,
        },
        { amountChanged: `1000 => 200` },
      );
    });

    it('should throw an error if the transaction is not found', async () => {
      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );
      prismaMock.transaction.findUnique.mockResolvedValueOnce(null);

      const params = {
        transactionId: 1,
        isConfirmed: true,
      };

      await expect(
        service.confirmTransaction(META, params, { tx: undefined }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUnconfirmedTransactionsInBranch', () => {
    it('should return unconfirmed transactions in branch', async () => {
      const transactions = [
        {
          id: 1,
          receiptId: 1,
          subAccount: {
            account: {
              ownerId: 1,
            },
          },
        },
        {
          id: 2,
          receiptId: 2,
          subAccount: {
            account: {
              ownerId: 2,
            },
          },
        },
      ];

      prismaMock.transaction.findMany.mockResolvedValueOnce(transactions);

      filesServiceClientMock.send.mockReturnValue(
        of([
          { id: 1, url: 'http://example.com/receipt1' },
          { id: 2, url: 'http://example.com/receipt2' },
        ]),
      );

      const result = await service.getUnconfirmedTransactionsInBranch(META);

      expect(result).toEqual({
        transactions: [
          {
            ...transactions[0],
            receiptUrl: 'http://example.com/receipt1',
          },
          {
            ...transactions[1],
            receiptUrl: 'http://example.com/receipt2',
          },
        ],
      });

      expect(prismaMock.transaction.findMany).toHaveBeenCalledWith({
        where: {
          confirmationDate: null,
          operationStatus: OperationStatusEnum.Pending,
          branchId: META.branchId,
        },
        include: {
          subAccount: {
            include: {
              account: {
                include: {
                  walletNumber: true,
                },
              },
            },
          },
        },
        orderBy: [
          { createdAt: 'desc' },
          { branchId: 'asc' },
          {
            subAccount: {
              account: {
                ownerId: 'asc',
              },
            },
          },
        ],
      });

      expect(filesServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'get_files_urls' },
        { fileIds: [1, 2] },
      );
    });

    it('should return empty array if there are no unconfirmed transactions', async () => {
      prismaMock.transaction.findMany.mockResolvedValueOnce([]);

      const result = await service.getUnconfirmedTransactionsInBranch(META);

      expect(result).toEqual({ transactions: [] });
      expect(prismaMock.transaction.findMany).toHaveBeenCalled();
    });
  });

  describe('getSubAccountBalance', () => {
    it('should return sub account balance', async () => {
      const balance = BigInt(1000);

      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );
      prismaMock.$queryRaw.mockResolvedValueOnce([{ balance }]);

      const result = await service.getSubAccountBalance({
        ownerId: META.userId,
        subAccountId: 1,
      });

      expect(result).toEqual(balance);
      expect(prismaMock.$queryRaw).toHaveBeenCalledWith(
        expect.any(Array),
        META.userId,
        1,
      );
    });
  });

  describe('getBalance', () => {
    it('should return sub account balance', async () => {
      const expectedResult = [
        {
          balance: BigInt(0),
          currencyCode: 'RUB',
        },
        {
          balance: BigInt(10000),
          currencyCode: 'USD',
        },
        {
          balance: BigInt(0),
          currencyCode: 'EUR',
        },
        {
          balance: BigInt(0),
          currencyCode: 'JPY',
        },
      ];

      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );
      prismaMock.$queryRaw.mockResolvedValueOnce(expectedResult);

      const result = await service.getBalance({
        ownerId: META.userId,
      });

      expect(result).toEqual(expectedResult);
      expect(prismaMock.$queryRaw).toHaveBeenCalledWith(
        expect.any(Array),
        META.userId,
      );
    });
  });

  describe('getAllSubAccountsBalances', () => {
    it('should return all sub accounts balances', async () => {
      const balances = [{ balance: 1000, subAccountId: 1 }];

      prismaMock.$transaction.mockImplementation(
        async (callback) => await callback(prismaMock),
      );
      prismaMock.$queryRaw.mockResolvedValueOnce(balances);

      const result = await service.getAllSubAccountsBalances({
        ownerId: META.userId,
      });

      expect(result).toEqual(balances);
      expect(prismaMock.$queryRaw).toHaveBeenCalledWith(
        expect.any(Array),
        META.userId,
      );
    });
  });

  describe('getMyAccounts', () => {
    it('should return accounts with balances', async () => {
      const accounts = [
        {
          id: 1,
          ownerId: 1,
          branchId: 1,
          subAccounts: [
            {
              id: 1,
              balance: 1000n,
            },
          ],
        },
      ];

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(prismaMock);
      });

      prismaMock.account.findMany.mockResolvedValueOnce(accounts);
      prismaMock.account.count.mockResolvedValueOnce(1);
      jest
        .spyOn(service, 'getAllSubAccountsBalances')
        .mockResolvedValueOnce([{ subAccountId: 1, balance: BigInt(1000) }]);

      const result = await service.getMyAccounts(META, { skip: 0, take: 20 });

      expect(result).toEqual({
        list: accounts,
        count: 1,
        take: 20,
        skip: 0,
        pageIndex: 0,
      });
      expect(prismaMock.account.findMany).toHaveBeenCalledWith({
        where: { ownerId: META.userId },
        include: {
          walletNumber: true,
          subAccounts: true,
        },
        orderBy: {
          accountType: 'asc',
        },
        skip: 0,
        take: 20,
      });
      expect(service.getAllSubAccountsBalances).toHaveBeenCalledWith({
        ownerId: META.userId,
        tx: prismaMock,
      });
    });
  });

  describe('getMyAccount by id', () => {
    it('should return my account with balances', async () => {
      const account = {
        id: 1,
        ownerId: 1,
        branchId: 1,
        subAccounts: [
          {
            id: 1,
            balance: 1000n,
          },
        ],
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(prismaMock);
      });

      prismaMock.account.findFirst.mockResolvedValueOnce(account);
      jest
        .spyOn(service, 'getAllSubAccountsBalancesByAccountId')
        .mockResolvedValueOnce([{ subAccountId: 1, balance: BigInt(1000) }]);

      const result = await service.getMyAccountById(META, 1);

      expect(result).toEqual({
        account,
      });
      expect(prismaMock.account.findFirst).toHaveBeenCalledWith({
        where: { id: 1, ownerId: META.userId },
        include: {
          walletNumber: true,
          subAccounts: true,
        },
      });
      expect(service.getAllSubAccountsBalancesByAccountId).toHaveBeenCalledWith(
        {
          ownerId: META.userId,
          accountId: 1,
          tx: prismaMock,
        },
      );
    });
  });

  describe('getTransactions', () => {
    it('should return transactions for sub account', async () => {
      const transactions = [
        {
          id: 1,
          subAccountId: 1,
        },
      ];

      prismaMock.transaction.findMany.mockResolvedValueOnce(transactions);

      const result = await service.getTransactions(META, { subAccountId: 1 });

      expect(result).toEqual({ transactions });
      expect(prismaMock.transaction.findMany).toHaveBeenCalledWith({
        where: {
          branchId: META.branchId,
          subAccountId: 1,
          subAccount: { account: { ownerId: META.userId } },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('getRecentTransactions', () => {
    it('should return transactions for account', async () => {
      const transactions = [
        {
          id: 1,
          subAccountId: 1,
        },
      ];

      prismaMock.$transaction.mockImplementation(async () => {
        return [transactions, 1];
      });

      prismaMock.transaction.findMany.mockResolvedValueOnce(transactions);
      prismaMock.transaction.count.mockResolvedValueOnce(1);

      const result = await service.getRecentTransactions(META, {
        accountId: 1,
        skip: 0,
        take: 20,
      });

      expect(result).toEqual({
        list: transactions,
        count: 1,
        take: 20,
        skip: 0,
        pageIndex: 0,
      });
      expect(prismaMock.transaction.findMany).toHaveBeenCalledWith({
        where: {
          branchId: META.branchId,
          subAccount: expect.any(Object),
        },
        include: {
          subAccount: expect.any(Object),
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('ensureEnoughBalance', () => {
    it('should not throw an error if there is enough balance', async () => {
      const params = {
        tx: prismaMock,
        ownerId: 1,
        amount: BigInt(1000),
        subAccountId: 1,
      };

      jest
        .spyOn(service, 'getSubAccountBalance')
        .mockResolvedValueOnce(BigInt(2000));

      await expect(service.ensureEnoughBalance(params)).resolves.not.toThrow();

      expect(service.getSubAccountBalance).toHaveBeenCalledWith({
        tx: prismaMock,
        ownerId: params.ownerId,
        subAccountId: params.subAccountId,
      });
    });

    it('should throw a BadRequestException if there is not enough balance', async () => {
      const params = {
        tx: prismaMock,
        ownerId: 1,
        amount: BigInt(2000),
        subAccountId: 1,
      };

      jest
        .spyOn(service, 'getSubAccountBalance')
        .mockResolvedValueOnce(BigInt(1000));

      await expect(service.ensureEnoughBalance(params)).rejects.toThrow(
        BadRequestException,
      );

      expect(service.getSubAccountBalance).toHaveBeenCalledWith({
        tx: prismaMock,
        ownerId: params.ownerId,
        subAccountId: params.subAccountId,
      });
    });
  });

  describe('getFilesUrls', () => {
    it('should return file URLs', async () => {
      filesServiceClientMock.send.mockReturnValue(
        of([
          { id: 1, url: 'http://example.com/file1' },
          { id: 2, url: 'http://example.com/file2' },
        ]),
      );

      const result = await service.getFilesUrls([1, 2]);

      expect(result).toEqual([
        { id: 1, url: 'http://example.com/file1' },
        { id: 2, url: 'http://example.com/file2' },
      ]);

      expect(filesServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'get_files_urls' },
        { fileIds: [1, 2] },
      );
    });
  });

  describe('confirmCodeFromEmail', () => {
    const email = 'test@test.com';
    const code = '123456';
    const type = 'SIGN_VERIFICATION_DOCUMENTS';
    const userId = 1;

    it('should confirm the code if it exists', async () => {
      alertServiceClientMock.send.mockReturnValue(of(true));

      const result = await service.confirmCodeFromEmail(
        email,
        userId,
        code,
        type,
      );

      expect(result).toBe(true);
      expect(alertServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'verify_otp_by_email' },
        { email, code, type, userId },
      );
    });

    it('should reject if code confirmation fails', async () => {
      alertServiceClientMock.send.mockReturnValue(of(false));

      const result = await service.confirmCodeFromEmail(
        email,
        userId,
        code,
        type,
      );

      expect(result).toBe(false);
      expect(alertServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'verify_otp_by_email' },
        { email, code, type, userId },
      );
    });
  });

  describe('findCredentials', () => {
    const email = 'test@test.com';
    const phone = '123456';
    const userId = 1;

    it('should return creds if it exists', async () => {
      coreServiceClientMock.send.mockReturnValue(of({ email, phone }));

      const result = await service.findCredentials(userId);

      expect(result).toEqual({ email, phone });
      expect(coreServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'find_credentials' },
        { userId },
      );
    });

    it('should reject if code confirmation fails', async () => {
      coreServiceClientMock.send.mockReturnValue(of(null));

      const result = await service.findCredentials(userId);

      expect(result).toBe(null);
      expect(coreServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'find_credentials' },
        { userId },
      );
    });
  });

  describe('getClientAccounts', () => {
    it('should return an empty array if client has no accounts', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock);
      });

      prismaMock.account.findMany.mockResolvedValueOnce([]);

      jest
        .spyOn(service, 'getAllSubAccountsBalances')
        .mockResolvedValueOnce([]);

      const result = await service.getClientAccounts(META.userId);

      expect(result).toEqual({ accounts: [] });
      expect(prismaMock.account.findMany).toHaveBeenCalledWith({
        where: { ownerId: META.userId },
        include: {
          walletNumber: true,
          subAccounts: true,
        },
      });

      expect(service.getAllSubAccountsBalances).not.toHaveBeenCalled();
    });

    it('should return accounts with sub-account balances', async () => {
      const accounts = [
        {
          id: 1,
          ownerId: META.userId,
          subAccounts: [{ id: 1 }, { id: 2 }],
        },
      ];

      const balances = [
        { subAccountId: 1, balance: BigInt(1000) },
        { subAccountId: 2, balance: BigInt(2000) },
      ];

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock);
      });

      prismaMock.account.findMany.mockResolvedValueOnce(accounts);
      jest
        .spyOn(service, 'getAllSubAccountsBalances')
        .mockResolvedValueOnce(balances);

      const result = await service.getClientAccounts(META.userId);

      expect(result).toEqual({
        accounts: [
          {
            id: 1,
            ownerId: META.userId,
            subAccounts: [
              { id: 1, balance: BigInt(1000) },
              { id: 2, balance: BigInt(2000) },
            ],
          },
        ],
      });

      expect(prismaMock.account.findMany).toHaveBeenCalledWith({
        where: { ownerId: META.userId },
        include: {
          walletNumber: true,
          subAccounts: true,
        },
      });
      expect(service.getAllSubAccountsBalances).toHaveBeenCalledWith({
        ownerId: META.userId,
        tx: prismaMock,
      });
    });

    it('should return accounts with sub-accounts having zero balance if no balance is found', async () => {
      const accounts = [
        {
          id: 1,
          ownerId: META.userId,
          subAccounts: [{ id: 1 }, { id: 2 }],
        },
      ];

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock);
      });

      prismaMock.account.findMany.mockResolvedValueOnce(accounts);
      jest
        .spyOn(service, 'getAllSubAccountsBalances')
        .mockResolvedValueOnce([]);

      const result = await service.getClientAccounts(META.userId);

      expect(result).toEqual({
        accounts: [
          {
            id: 1,
            ownerId: META.userId,
            subAccounts: [
              { id: 1, balance: BigInt(0) },
              { id: 2, balance: BigInt(0) },
            ],
          },
        ],
      });

      expect(prismaMock.account.findMany).toHaveBeenCalledWith({
        where: { ownerId: META.userId },
        include: {
          walletNumber: true,
          subAccounts: true,
        },
      });
      expect(service.getAllSubAccountsBalances).toHaveBeenCalledWith({
        ownerId: META.userId,
        tx: prismaMock,
      });
    });
  });

  describe('getClientTransactions', () => {
    it('should return an empty array if there are no transactions', async () => {
      prismaMock.transaction.findMany.mockResolvedValueOnce([]);

      const params = {
        clientId: META.userId,
        subAccountId: 1,
      };

      const result = await service.getClientTransactions(params);

      expect(result).toEqual({ transactions: [] });
      expect(prismaMock.transaction.findMany).toHaveBeenCalledWith({
        where: {
          subAccountId: params.subAccountId,
          subAccount: { account: { ownerId: params.clientId } },
        },
        include: {
          subAccount: {
            include: {
              account: {
                include: {
                  walletNumber: true,
                },
              },
            },
          },
        },
      });
    });

    it('should return transactions for the specified sub-account and client', async () => {
      const transactions = [
        {
          id: 1,
          subAccountId: 1,
          amount: BigInt(1000),
          subAccount: {
            id: 1,
            account: {
              ownerId: META.userId,
            },
          },
        },
      ];

      prismaMock.transaction.findMany.mockResolvedValueOnce(transactions);

      const params = {
        clientId: META.userId,
        subAccountId: 1,
      };

      const result = await service.getClientTransactions(params);

      expect(result).toEqual({ transactions });
      expect(prismaMock.transaction.findMany).toHaveBeenCalledWith({
        where: {
          subAccountId: params.subAccountId,
          subAccount: { account: { ownerId: params.clientId } },
        },
        include: {
          subAccount: {
            include: {
              account: {
                include: {
                  walletNumber: true,
                },
              },
            },
          },
        },
      });
    });

    it('should return an empty array if the client does not own the sub-account', async () => {
      prismaMock.transaction.findMany.mockResolvedValueOnce([]);

      const params = {
        clientId: META.userId,
        subAccountId: 2,
      };

      const result = await service.getClientTransactions(params);

      expect(result).toEqual({ transactions: [] });
      expect(prismaMock.transaction.findMany).toHaveBeenCalledWith({
        where: {
          subAccountId: params.subAccountId,
          subAccount: { account: { ownerId: params.clientId } },
        },
        include: {
          subAccount: {
            include: {
              account: {
                include: {
                  walletNumber: true,
                },
              },
            },
          },
        },
      });
    });
  });

  describe('getStrategyAmounts', () => {
    it('should return an empty array if no matching strategies or transactions are found', async () => {
      const clientId = 1;
      const strategyIds = [1, 2];
      const transactionIds = [100, 200];

      prismaMock.$queryRaw.mockResolvedValueOnce([]);

      const result = await service.getStrategyAmounts(
        clientId,
        strategyIds,
        transactionIds,
      );

      expect(result).toEqual([]);
      expect(prismaMock.$queryRaw).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return strategy amounts correctly', async () => {
      const clientId = 1;
      const strategyIds = [1, 2];
      const transactionIds = [100, 200];

      const mockResponse = [
        { strategyId: 1, amount: BigInt(1000) },
        { strategyId: 2, amount: BigInt(2000) },
      ];

      prismaMock.$queryRaw.mockResolvedValueOnce(mockResponse);

      const result = await service.getStrategyAmounts(
        clientId,
        strategyIds,
        transactionIds,
      );

      expect(result).toEqual(mockResponse);
      expect(prismaMock.$queryRaw).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should handle scenarios where some strategies have no transactions', async () => {
      const clientId = 1;
      const strategyIds = [1, 2, 3];
      const transactionIds = [100, 200];

      const mockResponse = [
        { strategyId: 1, amount: BigInt(1000) },
        { strategyId: 2, amount: BigInt(2000) },
      ];

      prismaMock.$queryRaw.mockResolvedValueOnce(mockResponse);

      const result = await service.getStrategyAmounts(
        clientId,
        strategyIds,
        transactionIds,
      );

      expect(result).toEqual(mockResponse);
      expect(prismaMock.$queryRaw).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should correctly handle negative amounts for withdrawals', async () => {
      const clientId = 1;
      const strategyIds = [1];
      const transactionIds = [100];

      const mockResponse = [{ strategyId: 1, amount: BigInt(-500) }];

      prismaMock.$queryRaw.mockResolvedValueOnce(mockResponse);

      const result = await service.getStrategyAmounts(
        clientId,
        strategyIds,
        transactionIds,
      );

      expect(result).toEqual(mockResponse);
      expect(prismaMock.$queryRaw).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('linkTransactions', () => {
    const fromTransactionId = 1;
    const toTransactionId = 2;

    it('should successfully link two transactions by updating their pairedTransactionId fields', async () => {
      const mockTx = {
        transaction: {
          update: jest.fn(),
        },
      };

      mockTx.transaction.update.mockResolvedValueOnce(null);
      mockTx.transaction.update.mockResolvedValueOnce(null);

      await service.linkTransactions(
        mockTx as any,
        fromTransactionId,
        toTransactionId,
      );

      expect(mockTx.transaction.update).toHaveBeenCalledTimes(2);

      expect(mockTx.transaction.update).toHaveBeenCalledWith({
        where: { id: toTransactionId },
        data: { pairedTransactionId: fromTransactionId },
      });

      expect(mockTx.transaction.update).toHaveBeenCalledWith({
        where: { id: fromTransactionId },
        data: { pairedTransactionId: toTransactionId },
      });
    });

    it('should throw an error if the first transaction update fails', async () => {
      const mockTx = {
        transaction: {
          update: jest.fn().mockRejectedValueOnce(new Error('Update failed')),
        },
      };

      await expect(
        service.linkTransactions(
          mockTx as any,
          fromTransactionId,
          toTransactionId,
        ),
      ).rejects.toThrow('Update failed');

      expect(mockTx.transaction.update).toHaveBeenCalledWith({
        where: { id: toTransactionId },
        data: { pairedTransactionId: fromTransactionId },
      });

      expect(mockTx.transaction.update).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the second transaction update fails', async () => {
      const mockTx = {
        transaction: {
          update: jest
            .fn()
            .mockResolvedValueOnce(null) // First update succeeds
            .mockRejectedValueOnce(new Error('Update failed')), // Second update fails
        },
      };

      await expect(
        service.linkTransactions(
          mockTx as any,
          fromTransactionId,
          toTransactionId,
        ),
      ).rejects.toThrow('Update failed');

      expect(mockTx.transaction.update).toHaveBeenCalledWith({
        where: { id: toTransactionId },
        data: { pairedTransactionId: fromTransactionId },
      });

      expect(mockTx.transaction.update).toHaveBeenCalledWith({
        where: { id: fromTransactionId },
        data: { pairedTransactionId: toTransactionId },
      });

      expect(mockTx.transaction.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('createLinkedTransactions', () => {
    const mockTx = {
      transaction: {
        create: jest.fn(),
      },
    };

    const params = {
      branchId: 1,
      fromSubAccountId: 101,
      toSubAccountId: 102,
      amount: BigInt(1000),
      operationSubType: OperationSubTypeEnum.ServiceInternalTransfer,
      comment: 'Test transaction',
      isConfirmed: true,
      waitingForResultingAmount: false,
      paymentMethodUsed: { method: 'card' },
    };

    it('should successfully create and link transactions', async () => {
      const fromTransaction = { id: 1 };
      const toTransaction = { id: 2 };

      mockTx.transaction.create
        .mockResolvedValueOnce(fromTransaction) // Create withdrawal transaction
        .mockResolvedValueOnce(toTransaction); // Create deposit transaction

      jest.spyOn(service, 'linkTransactions').mockResolvedValueOnce(void 0);

      const result = await service.createLinkedTransactions(
        mockTx as any,
        params,
      );

      expect(mockTx.transaction.create).toHaveBeenCalledTimes(2);

      expect(mockTx.transaction.create).toHaveBeenCalledWith({
        data: {
          branchId: params.branchId,
          amount: params.amount,
          subAccountId: params.fromSubAccountId,
          operationStatus: OperationStatusEnum.Completed,
          operationType: OperationTypeEnum.Withdrawal,
          operationSubType: params.operationSubType,
          isConfirmed: true,
          transferTo: params.toSubAccountId,
          paymentMethodUsed: params.paymentMethodUsed,
          comment: params.comment,
        },
      });

      expect(mockTx.transaction.create).toHaveBeenCalledWith({
        data: {
          branchId: params.branchId,
          amount: params.amount,
          subAccountId: params.toSubAccountId,
          operationStatus: OperationStatusEnum.Completed,
          operationType: OperationTypeEnum.Deposit,
          operationSubType: params.operationSubType,
          isConfirmed: true,
          transferFrom: params.fromSubAccountId,
          paymentMethodUsed: params.paymentMethodUsed,
          comment: params.comment,
        },
      });

      expect(service.linkTransactions).toHaveBeenCalledWith(
        mockTx,
        fromTransaction.id,
        toTransaction.id,
      );

      expect(result).toEqual([fromTransaction, toTransaction]);
    });

    it('should throw an error if creating the withdrawal transaction fails', async () => {
      mockTx.transaction.create.mockRejectedValueOnce(
        new Error('Creation failed'),
      );

      await expect(
        service.createLinkedTransactions(mockTx as any, params),
      ).rejects.toThrow('Creation failed');

      expect(mockTx.transaction.create).toHaveBeenCalledTimes(1);
      expect(mockTx.transaction.create).toHaveBeenCalledWith({
        data: {
          branchId: params.branchId,
          amount: params.amount,
          subAccountId: params.fromSubAccountId,
          operationStatus: OperationStatusEnum.Completed,
          operationType: OperationTypeEnum.Withdrawal,
          operationSubType: params.operationSubType,
          isConfirmed: true,
          transferTo: params.toSubAccountId,
          paymentMethodUsed: params.paymentMethodUsed,
          comment: params.comment,
        },
      });
    });

    it('should throw an error if creating the deposit transaction fails', async () => {
      const fromTransaction = { id: 1 };

      mockTx.transaction.create
        .mockResolvedValueOnce(fromTransaction) // First transaction succeeds
        .mockRejectedValueOnce(new Error('Creation failed')); // Second transaction fails

      await expect(
        service.createLinkedTransactions(mockTx as any, params),
      ).rejects.toThrow('Creation failed');

      expect(mockTx.transaction.create).toHaveBeenCalledTimes(2);

      expect(mockTx.transaction.create).toHaveBeenCalledWith({
        data: {
          branchId: params.branchId,
          amount: params.amount,
          subAccountId: params.fromSubAccountId,
          operationStatus: OperationStatusEnum.Completed,
          operationType: OperationTypeEnum.Withdrawal,
          operationSubType: params.operationSubType,
          isConfirmed: true,
          transferTo: params.toSubAccountId,
          paymentMethodUsed: params.paymentMethodUsed,
          comment: params.comment,
        },
      });

      expect(mockTx.transaction.create).toHaveBeenCalledWith({
        data: {
          branchId: params.branchId,
          amount: params.amount,
          subAccountId: params.toSubAccountId,
          operationStatus: OperationStatusEnum.Completed,
          operationType: OperationTypeEnum.Deposit,
          operationSubType: params.operationSubType,
          isConfirmed: true,
          transferFrom: params.fromSubAccountId,
          paymentMethodUsed: params.paymentMethodUsed,
          comment: params.comment,
        },
      });
    });
  });

  describe('getOwnerSubAccount', () => {
    const mockTx = {
      subAccount: {
        findFirst: jest.fn(),
      },
    };

    const subAccountId = 1;
    const userId = 123;
    const subAccountData = {
      id: subAccountId,
      account: { ownerId: userId },
    };

    it('should retrieve the sub-account for a non-accountant user', async () => {
      mockTx.subAccount.findFirst.mockResolvedValueOnce(subAccountData);

      const result = await service.getOwnerSubAccount(
        mockTx as any,
        subAccountId,
        false,
        userId,
      );

      expect(mockTx.subAccount.findFirst).toHaveBeenCalledWith({
        where: {
          id: subAccountId,
          account: { ownerId: userId },
        },
        include: {
          account: undefined,
        },
      });

      expect(result).toEqual(subAccountData);
    });

    it('should retrieve the sub-account for an accountant user', async () => {
      const subAccountDataWithOwnerId = {
        id: subAccountId,
        account: { ownerId: userId },
      };

      mockTx.subAccount.findFirst.mockResolvedValueOnce(
        subAccountDataWithOwnerId,
      );

      const result = await service.getOwnerSubAccount(
        mockTx as any,
        subAccountId,
        true,
        userId,
      );

      expect(mockTx.subAccount.findFirst).toHaveBeenCalledWith({
        where: {
          id: subAccountId,
          account: undefined,
        },
        include: {
          account: { select: { ownerId: true } },
        },
      });

      expect(result).toEqual(subAccountDataWithOwnerId);
    });

    it('should return null if no sub-account is found', async () => {
      mockTx.subAccount.findFirst.mockResolvedValueOnce(null);

      const result = await service.getOwnerSubAccount(
        mockTx as any,
        subAccountId,
        false,
        userId,
      );

      expect(mockTx.subAccount.findFirst).toHaveBeenCalledWith({
        where: {
          id: subAccountId,
          account: { ownerId: userId },
        },
        include: { account: undefined },
      });

      expect(result).toBeNull();
    });

    it('should return null if no sub-account is found for an accountant user', async () => {
      mockTx.subAccount.findFirst.mockResolvedValueOnce(null);

      const result = await service.getOwnerSubAccount(
        mockTx as any,
        subAccountId,
        true,
        userId,
      );

      expect(mockTx.subAccount.findFirst).toHaveBeenCalledWith({
        where: {
          id: subAccountId,
          account: undefined,
        },
        include: {
          account: { select: { ownerId: true } },
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('createUserAccountSettings', () => {
    it('should return existing settings if they exist', async () => {
      // Arrange: Mock findFirst to return existing settings
      const existingSettings: UserAccountSettings = {
        id: 1,
        userId: 1,
        accountOperationsBlocked: false,
        limitInUsd: 2500000n,
      };
      (prismaMock.userAccountSettings.findFirst as jest.Mock).mockResolvedValue(
        existingSettings,
      );

      // Act: Call the service function
      const result = await service.createUserAccountSettings(prismaMock, 1);

      // Assert: Expect the result to be the existing settings
      expect(result).toEqual(existingSettings);
      expect(prismaMock.userAccountSettings.findFirst).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(prismaMock.userAccountSettings.create).not.toHaveBeenCalled();
    });

    it('should create new settings if they do not exist', async () => {
      const newSettings: UserAccountSettings = {
        id: 2,
        userId: 2,
        accountOperationsBlocked: false,
        limitInUsd: 2500000n,
      };

      (prismaMock.userAccountSettings.findFirst as jest.Mock).mockResolvedValue(
        null,
      );
      (prismaMock.userAccountSettings.create as jest.Mock).mockResolvedValue(
        newSettings,
      );

      const result = await service.createUserAccountSettings(prismaMock, 2);

      expect(result).toEqual(newSettings);
      expect(prismaMock.userAccountSettings.findFirst).toHaveBeenCalledWith({
        where: { userId: 2 },
      });
      expect(prismaMock.userAccountSettings.create).toHaveBeenCalledWith({
        data: { userId: 2, accountOperationsBlocked: false },
      });
    });
  });

  describe('updateUserAccountSettings', () => {
    it('should update settings if they exist', async () => {
      const existingSettings = {
        id: 1,
        userId: 1,
        accountOperationsBlocked: false,
        limitInUsd: 2500000n,
      };
      const updatedSettings = {
        ...existingSettings,
        accountOperationsBlocked: true,
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock);
      });

      (prismaMock.userAccountSettings.findFirst as jest.Mock).mockResolvedValue(
        existingSettings,
      );
      (prismaMock.userAccountSettings.update as jest.Mock).mockResolvedValue(
        updatedSettings,
      );

      const dto = { accountOperationsBlocked: true };

      const result = await service.updateUserAccountSettings(1, dto);

      expect(result).toEqual(updatedSettings);
      expect(prismaMock.userAccountSettings.findFirst).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
      expect(prismaMock.userAccountSettings.update).toHaveBeenCalledWith({
        where: { id: existingSettings.id },
        data: dto,
      });
    });

    it('should create settings and then update if they do not exist', async () => {
      const newSettings = {
        id: 2,
        userId: 2,
        accountOperationsBlocked: false,
        limitInUsd: 2500000n,
      };
      const updatedSettings = {
        ...newSettings,
        accountOperationsBlocked: true,
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock);
      });
      (prismaMock.userAccountSettings.findFirst as jest.Mock).mockResolvedValue(
        null,
      );
      (prismaMock.userAccountSettings.create as jest.Mock).mockResolvedValue(
        newSettings,
      );
      (prismaMock.userAccountSettings.update as jest.Mock).mockResolvedValue(
        updatedSettings,
      );

      const dto = { accountOperationsBlocked: true };

      const result = await service.updateUserAccountSettings(2, dto);

      expect(result).toEqual(updatedSettings);
      expect(prismaMock.userAccountSettings.findFirst).toHaveBeenCalledWith({
        where: { userId: 2 },
      });
      expect(prismaMock.userAccountSettings.create).toHaveBeenCalledWith({
        data: { userId: 2, accountOperationsBlocked: false },
      });
      expect(prismaMock.userAccountSettings.update).toHaveBeenCalledWith({
        where: { id: newSettings.id },
        data: dto,
      });
    });
  });

  describe('getUserAccountSettings', () => {
    it('should return existing settings if they exist', async () => {
      const existingSettings = {
        id: 1,
        userId: 1,
        accountOperationsBlocked: false,
        limitInUsd: 2500000n,
      };
      (prismaMock.userAccountSettings.findFirst as jest.Mock).mockResolvedValue(
        existingSettings,
      );

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock);
      });

      const result = await service.getUserAccountSettings(1);

      expect(result).toEqual(existingSettings);
      expect(prismaMock.userAccountSettings.findFirst).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it('should create settings if they do not exist', async () => {
      const newSettings = {
        id: 2,
        userId: 2,
        accountOperationsBlocked: false,
        limitInUsd: 2500000n,
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock);
      });
      (prismaMock.userAccountSettings.findFirst as jest.Mock).mockResolvedValue(
        null,
      );
      (prismaMock.userAccountSettings.create as jest.Mock).mockResolvedValue(
        newSettings,
      );

      const result = await service.getUserAccountSettings(2);

      expect(result).toEqual(newSettings);
      expect(prismaMock.userAccountSettings.findFirst).toHaveBeenCalledWith({
        where: { userId: 2 },
      });
      expect(prismaMock.userAccountSettings.create).toHaveBeenCalledWith({
        data: { userId: 2, accountOperationsBlocked: false },
      });
    });
  });

  describe('throwErrorIfAccountBlocked', () => {
    it('should return empty object if account is not blocked', async () => {
      const existingSettings = {
        id: 1,
        userId: 1,
        accountOperationsBlocked: false,
        limitInUsd: 2500000n,
      };
      (prismaMock.userAccountSettings.findFirst as jest.Mock).mockResolvedValue(
        existingSettings,
      );

      const result = await service.throwErrorIfAccountBlocked(1);

      expect(result).toEqual({});
      expect(prismaMock.userAccountSettings.findFirst).toHaveBeenCalledWith({
        where: { userId: 1, accountOperationsBlocked: true },
      });
    });

    it('should throw error if account is blocked', async () => {
      const newSettings = {
        id: 2,
        userId: 2,
        accountOperationsBlocked: true,
        limitInUsd: 2500000n,
      };

      (prismaMock.userAccountSettings.findFirst as jest.Mock).mockResolvedValue(
        newSettings,
      );

      await expect(service.throwErrorIfAccountBlocked(2)).rejects.toThrow(
        'Account is blocked',
      );
    });
  });

  describe('checkIfAccountsIsNotOverLimit', () => {
    it('should not throw an error when accounts are within limits', async () => {
      const params = {
        ownerId: 1,
        extraAmount: BigInt(500),
        extraAmountCurrency: DefaultCurrenciesEnum.USD,
      };
      // Rate should represent how many units of EUR equal 1 USD
      const rates: Map<string, Rate> = new Map([
        [
          'EUR',
          {
            targetCurrencyCode: DefaultCurrenciesEnum.USD,
            value: new Decimal(1.2), // 1 USD = 1.2 EUR, hence to convert from EUR to USD we divide
            id: 1,
            date: new Date(),
            baseCurrencyCode: DefaultCurrenciesEnum.EUR,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        [
          'USD',
          {
            targetCurrencyCode: DefaultCurrenciesEnum.USD,
            value: new Decimal(1),
            id: 1,
            date: new Date(),
            baseCurrencyCode: DefaultCurrenciesEnum.USD,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      ]);
      const balances = [
        { currencyCode: DefaultCurrenciesEnum.USD, balance: 1000 },
      ];

      const settings: UserAccountSettings = {
        id: 1,
        userId: params.ownerId,
        limitInUsd: BigInt(2000),
        accountOperationsBlocked: false,
      };

      ratesServiceMock.getMostActualRates.mockResolvedValue(
        Object.fromEntries(rates.entries()),
      );
      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(prismaMock),
      );
      service.getBalance = jest.fn().mockResolvedValue(balances);
      service.convertAllBalancesToUsd = jest.fn().mockResolvedValue(1500n);
      prismaMock.userAccountSettings.findFirst.mockResolvedValue(settings);

      await expect(
        service.checkIfAccountsIsNotOverLimit(params),
      ).resolves.not.toThrow();
    });

    it('should throw an error when accounts exceed limits', async () => {
      const params = {
        ownerId: 1,
        extraAmount: BigInt(2000),
        extraAmountCurrency: DefaultCurrenciesEnum.USD,
      };
      const rates: Map<string, Rate> = new Map([
        [
          DefaultCurrenciesEnum.EUR,
          {
            targetCurrencyCode: DefaultCurrenciesEnum.USD,
            value: new Decimal(1.2),
            id: 1,
            date: new Date(),
            baseCurrencyCode: DefaultCurrenciesEnum.EUR,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      ]);
      const balances = [
        { currencyCode: DefaultCurrenciesEnum.USD, balance: 1000 },
        { currencyCode: DefaultCurrenciesEnum.EUR, balance: 2000 },
      ];
      const settings: UserAccountSettings = {
        id: 1,
        userId: params.ownerId,
        limitInUsd: BigInt(2000),
        accountOperationsBlocked: false,
      };

      ratesServiceMock.getMostActualRates.mockResolvedValue(
        Object.fromEntries(rates.entries()),
      );
      prismaMock.$transaction.mockImplementation(async (callback) =>
        callback(prismaMock),
      );
      service.getBalance = jest.fn().mockResolvedValue(balances);
      prismaMock.userAccountSettings.findFirst.mockResolvedValue(settings);

      await expect(
        service.checkIfAccountsIsNotOverLimit(params),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('convertAllBalancesToUsd', () => {
    it('should convert all balances to USD correctly', () => {
      const balances = [
        { currencyCode: DefaultCurrenciesEnum.USD, balance: 1000 }, // USD balance
        { currencyCode: 'EUR', balance: 2000 }, // EUR balance to convert
      ];

      // Rate should represent how many units of EUR equal 1 USD
      const rates: Map<string, Rate> = new Map([
        [
          'EUR',
          {
            targetCurrencyCode: DefaultCurrenciesEnum.USD,
            value: new Decimal(1.2), // 1 USD = 1.2 EUR
            id: 1,
            date: new Date(),
            baseCurrencyCode: DefaultCurrenciesEnum.EUR,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      ]);

      const result = service.convertAllBalancesToUsd(
        balances,
        Object.fromEntries(rates.entries()),
      );

      // Converting EUR to USD correctly by dividing
      // 2000 EUR / 1.2 (EUR per USD) = 1666.67 USD (approx rounded to 1667)
      // Total USD = 1000 + 1667 = 2667
      expect(result).toBe(BigInt(2667));
    });

    it('should throw an error for missing or invalid rate', () => {
      const balances = [{ currencyCode: 'EUR', balance: 2000 }];
      const rates: ReadonlyMap<string, Rate> = new Map();
      expect(() =>
        service.convertAllBalancesToUsd(
          balances,
          Object.fromEntries(rates.entries()),
        ),
      ).toThrowError('Missing or invalid rate for currency: EUR');
    });
  });

  describe('convertToUsd', () => {
    it('should convert a given amount to USD correctly', () => {
      const rates: Map<string, Rate> = new Map([
        [
          DefaultCurrenciesEnum.EUR,
          {
            targetCurrencyCode: DefaultCurrenciesEnum.USD,
            value: new Decimal(1.2),
            id: 1,
            date: new Date(),
            baseCurrencyCode: DefaultCurrenciesEnum.EUR,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      ]);
      const amount = BigInt(2400);
      const result = service.convertToUsd(
        Object.fromEntries(rates.entries()),
        amount,
        DefaultCurrenciesEnum.EUR,
      );
      expect(result).toBe(BigInt(2000));
    });

    it('should throw an error for missing or invalid rate', () => {
      const rates: ReadonlyMap<string, Rate> = new Map();
      const amount = BigInt(2400);
      expect(() =>
        service.convertToUsd(
          Object.fromEntries(rates.entries()),
          amount,
          DefaultCurrenciesEnum.EUR,
        ),
      ).toThrowError('Missing or invalid rate for currency: EUR');
    });
  });
});
