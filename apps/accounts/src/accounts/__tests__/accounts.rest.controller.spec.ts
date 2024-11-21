import { AccountsRestController } from '../accounts.rest.controller';
import { AccountsService } from '../accounts.service';
import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import {
  DefaultCurrenciesEnum,
  RoleEnum,
  UserMetadataParams,
} from '@erp-modul/shared';
import { MakeDepositRequestDto } from '../request-dto/makeDepositRequest.dto';
import { MakeWithdrawalRequestDto } from '../request-dto/makeWithdrawalRequest.dto';
import { MakeP2PTransferRequestDto } from '../request-dto/makeP2PTransferRequest.dto';
import { MakeInternalTransferRequestDto } from '../request-dto/makeInternalTransferRequest.dto';
import { ConfirmTransactionRequestDto } from '../request-dto/confirmTransactionRequest.dto';
import { $Enums, AccountTypeEnum } from '../../../prisma/client';
import { MakeInternalChangeRequestDto } from '../request-dto/makeInternalChangeRequest.dto';
import { MakeInvestTMTransferRequestDto } from '../request-dto/makeInvestTMTransferRequest.dto';
import { MakeWithdrawTMTransferRequestDto } from '../request-dto/makeWithdrawTMTransferRequestDto';
import { UpdateUserAccountSettingsDto } from '../request-dto/updateUserAccountSettings.dto';

const META: UserMetadataParams = {
  userId: 1,
  authId: 1,
  branchId: 1,
  role: RoleEnum.Client,
};

describe('AccountsRestController', () => {
  let accountsRestController: AccountsRestController;
  let accountsServiceMock: DeepMockProxy<AccountsService>;

  beforeEach(async () => {
    accountsServiceMock = mockDeep<AccountsService>();

    const moduleRef = await Test.createTestingModule({
      controllers: [AccountsRestController],
      providers: [
        {
          provide: AccountsService,
          useValue: accountsServiceMock,
        },
      ],
    }).compile();

    accountsRestController = moduleRef.get<AccountsRestController>(
      AccountsRestController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AccountsRestController: createAccount', () => {
    it('should create an account', async () => {
      const expectedResponse = {
        id: 1,
        walletId: 'string',
        accountType: AccountTypeEnum.Master,
        ownerId: META.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        extra: {},
      };
      accountsServiceMock.createAccount.mockResolvedValue(expectedResponse);

      const result = await accountsRestController.createAccount(META);

      expect(accountsServiceMock.createAccount).toHaveBeenCalledWith(
        META.userId,
        {
          automatic: false,
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('AccountsRestController: makeExternalDeposit', () => {
    it('should make an external deposit', async () => {
      const dto: MakeDepositRequestDto = {
        accountId: 1,
        currency: DefaultCurrenciesEnum.USD,
        amount: BigInt(100),
        fileIds: [1],
      };
      const expectedResponse = { ok: true };

      accountsServiceMock.makeExternalDeposit.mockResolvedValue(
        expectedResponse,
      );

      const result = await accountsRestController.makeExternalDeposit(
        META,
        dto,
      );

      expect(accountsServiceMock.makeExternalDeposit).toHaveBeenCalledWith(
        META,
        {
          accountId: dto.accountId,
          currency: dto.currency,
          amount: dto.amount,
          receiptId: dto.fileIds[0],
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('AccountsRestController: makeExternalWithdrawal', () => {
    it('should make an external withdrawal', async () => {
      const dto: MakeWithdrawalRequestDto = {
        accountId: 1,
        currency: DefaultCurrenciesEnum.USD,
        details: {
          bic: '',
          bankName: '',
          countryCode: '',
          iban: '',
          purposeOfPayment: '',
          recipientName: '',
        },
        amount: BigInt(100),
        code: '0000',
      };
      const expectedResponse = { ok: true };

      accountsServiceMock.makeExternalWithdrawal.mockResolvedValue({
        ok: true,
      });

      const result = await accountsRestController.makeExternalWithdrawal(
        META,
        dto,
      );

      expect(accountsServiceMock.makeExternalWithdrawal).toHaveBeenCalledWith(
        META,
        {
          accountId: dto.accountId,
          amount: dto.amount,
          code: '0000',
          currency: DefaultCurrenciesEnum.USD,
          details: {
            bic: '',
            bankName: '',
            countryCode: '',
            iban: '',
            purposeOfPayment: '',
            recipientName: '',
          },
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('AccountsRestController: makeP2PTransfer', () => {
    it('should make a P2P transfer', async () => {
      const dto: MakeP2PTransferRequestDto = {
        fromAccountId: 1,
        targetAccountId: 'M1111111',
        currency: DefaultCurrenciesEnum.USD,
        amount: BigInt(100),
        code: '0000',
      };
      const expectedResponse = { ok: true };

      accountsServiceMock.makeP2PTransfer.mockResolvedValue(expectedResponse);

      const result = await accountsRestController.makeP2PTransfer(META, dto);

      expect(accountsServiceMock.makeP2PTransfer).toHaveBeenCalledWith(META, {
        fromAccountId: dto.fromAccountId,
        targetAccountId: dto.targetAccountId,
        currency: dto.currency,
        amount: dto.amount,
        code: '0000',
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('AccountsRestController: makeInvestTMTransfer', () => {
    it('should make a invest TM transfer', async () => {
      const dto: MakeInvestTMTransferRequestDto = {
        strategyId: 2,
        currency: DefaultCurrenciesEnum.USD,
        amount: BigInt(100),
        code: '0000',
      };
      const expectedResponse = { ok: true };

      accountsServiceMock.makeInvestTMTransfer.mockResolvedValue(
        expectedResponse,
      );

      const result = await accountsRestController.makeInvestTMTransfer(
        META,
        dto,
      );

      expect(accountsServiceMock.makeInvestTMTransfer).toHaveBeenCalledWith(
        META,
        {
          strategyId: dto.strategyId,
          currency: dto.currency,
          amount: dto.amount,
          code: '0000',
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('AccountsRestController: makeInternalChange', () => {
    it('should make a P2P transfer', async () => {
      const dto: MakeInternalChangeRequestDto = {
        fromAccountId: 1,
        fromCurrency: DefaultCurrenciesEnum.USD,
        toCurrency: DefaultCurrenciesEnum.JPY,
        amount: BigInt(100),
        code: '0000',
      };
      const expectedResponse = { ok: true };

      accountsServiceMock.makeInternalChange.mockResolvedValue(
        expectedResponse,
      );

      const result = await accountsRestController.makeInternalChange(META, dto);

      expect(accountsServiceMock.makeInternalChange).toHaveBeenCalledWith(
        META,
        {
          fromAccountId: dto.fromAccountId,
          fromCurrency: dto.fromCurrency,
          toCurrency: dto.toCurrency,
          amount: dto.amount,
          code: '0000',
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('AccountsRestController: makeWithdrawTransferTM', () => {
    it('should make a TM withdrawal transfer', async () => {
      const dto: MakeWithdrawTMTransferRequestDto = {
        investmentId: 1,
        sharesAmount: 10,
        userId: 1,
        code: '1234',
      };
      const expectedResponse = { ok: true };

      accountsServiceMock.makeWithdrawTMTransfer.mockResolvedValue(
        expectedResponse,
      );

      const result = await accountsRestController.makeWithdrawTransferTM(
        META,
        dto,
      );

      expect(accountsServiceMock.makeWithdrawTMTransfer).toHaveBeenCalledWith(
        META,
        {
          investmentId: dto.investmentId,
          sharesAmount: dto.sharesAmount,
          userId: dto.userId,
          code: dto.code,
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('AccountsRestController: makeInternalTransfer', () => {
    it('should make an internal transfer', async () => {
      const dto: MakeInternalTransferRequestDto = {
        fromAccountId: 1,
        targetAccountId: 2,
        currency: DefaultCurrenciesEnum.USD,
        amount: BigInt(100),
        code: '0000',
      };
      const expectedResponse = { ok: true };

      accountsServiceMock.makeInternalTransfer.mockResolvedValue(
        expectedResponse,
      );

      const result = await accountsRestController.makeInternalTransfer(
        META,
        dto,
      );

      expect(accountsServiceMock.makeInternalTransfer).toHaveBeenCalledWith(
        META,
        {
          fromAccountId: dto.fromAccountId,
          targetAccountId: dto.targetAccountId,
          currency: dto.currency,
          amount: dto.amount,
          code: '0000',
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('AccountsRestController: confirmTransaction', () => {
    it('should confirm a transaction', async () => {
      const dto: ConfirmTransactionRequestDto = {
        transactionId: 1,
        isConfirmed: true,
      };
      const expectedResponse = { ok: true };

      accountsServiceMock.confirmTransaction.mockResolvedValue(
        expectedResponse,
      );

      const result = await accountsRestController.confirmTransaction(META, dto);

      expect(accountsServiceMock.confirmTransaction).toHaveBeenCalledWith(
        META,
        {
          transactionId: dto.transactionId,
          isConfirmed: dto.isConfirmed,
        },
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should confirm a transaction with changed amount', async () => {
      const dto: ConfirmTransactionRequestDto = {
        transactionId: 1,
        isConfirmed: true,
        amount: BigInt(200),
      };
      const expectedResponse = { ok: true };

      accountsServiceMock.confirmTransaction.mockResolvedValue(
        expectedResponse,
      );

      const result = await accountsRestController.confirmTransaction(META, dto);

      expect(accountsServiceMock.confirmTransaction).toHaveBeenCalledWith(
        META,
        {
          transactionId: dto.transactionId,
          isConfirmed: dto.isConfirmed,
          amount: dto.amount,
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('AccountsRestController: getUnconfirmedTransactionsInBranch', () => {
    it('should get unconfirmed transactions in branch', async () => {
      const expectedResponse = {
        transactions: [
          {
            amount: BigInt(10000),
            branchId: 2,
            confirmationDate: null,
            confirmedBy: null,
            createdAt: new Date(),
            id: 2,
            isConfirmed: false,
            operationStatus: $Enums.OperationStatusEnum.Pending,
            operationSubType: $Enums.OperationSubTypeEnum.ExternalDeposit,
            operationType: $Enums.OperationTypeEnum.Deposit,
            paymentMethodUsed: {
              type: 'bankAccount',
            },
            receiptId: '',
            receiptUrl: null,
            subAccount: {
              account: {
                ownerId: 4,
              },
              accountId: 1,
              createdAt: new Date(),
              currencyCode: 'USD',
              id: 1,
              isPrimary: true,
              updatedAt: new Date(),
            },
            subAccountId: 1,
            transferFrom: null,
            transferTo: null,
            updatedAt: new Date(),
          },
        ],
      } as any;

      accountsServiceMock.getUnconfirmedTransactionsInBranch.mockResolvedValue(
        expectedResponse,
      );

      const result =
        await accountsRestController.getUnconfirmedTransactionsInBranch(META);

      expect(
        accountsServiceMock.getUnconfirmedTransactionsInBranch,
      ).toHaveBeenCalledWith(META);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('AccountsRestController: getSubAccountBalance', () => {
    it('should get sub-account balance', async () => {
      const subAccountId = 1;
      const expectedResponse = BigInt(100);

      accountsServiceMock.getSubAccountBalance.mockResolvedValue(
        expectedResponse,
      );

      const result = await accountsRestController.getSubAccountBalance(
        META,
        subAccountId,
      );

      expect(accountsServiceMock.getSubAccountBalance).toHaveBeenCalledWith({
        ownerId: META.userId,
        subAccountId,
      });
      expect(result).toEqual({ balance: BigInt('100') });
    });
  });

  describe('AccountsRestController: getBalance', () => {
    it('should get full balance', async () => {
      const expectedResult = {
        balances: [
          {
            balance: 0,
            currencyCode: 'RUB',
          },
          {
            balance: 10000,
            currencyCode: 'USD',
          },
          {
            balance: 0,
            currencyCode: 'EUR',
          },
          {
            balance: 0,
            currencyCode: 'JPY',
          },
        ],
      };

      accountsServiceMock.getBalance.mockResolvedValue(expectedResult.balances);

      const result = await accountsRestController.getBalance(META);
      expect(accountsServiceMock.getBalance).toHaveBeenCalledWith({
        ownerId: META.userId,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('AccountsRestController: getMyAccounts', () => {
    it('should get my accounts', async () => {
      const expectedResponse = {
        count: 1,
        pageIndex: 1,
        take: 20,
        skip: 0,
        list: [
          {
            branchId: 2,
            createdAt: new Date(),
            id: 1,
            ownerId: 4,
            accountType: AccountTypeEnum.Master,
            extra: {},
            walletNumber: {
              id: 1,
              accountId: 1,
              walletId: 'M1111111',
            },
            subAccounts: [
              {
                accountId: 1,
                balance: BigInt('10000'),
                createdAt: new Date(),
                currencyCode: 'USD',
                id: 1,
                isPrimary: true,
                updatedAt: new Date(),
              },
              {
                accountId: 1,
                balance: BigInt('0'),
                createdAt: new Date(),
                currencyCode: 'EUR',
                id: 2,
                isPrimary: false,
                updatedAt: new Date(),
              },
              {
                accountId: 1,
                balance: BigInt('0'),
                createdAt: new Date(),
                currencyCode: 'RUB',
                id: 3,
                isPrimary: false,
                updatedAt: new Date(),
              },
              {
                accountId: 1,
                balance: BigInt('0'),
                createdAt: new Date(),
                currencyCode: 'JPY',
                id: 4,
                isPrimary: false,
                updatedAt: new Date(),
              },
            ],
            updatedAt: new Date(),
            walletId: 'A44b2277-24137154103889',
          },
        ],
      };

      accountsServiceMock.getMyAccounts.mockResolvedValue(expectedResponse);

      const result = await accountsRestController.getMyAccounts({}, META);

      expect(accountsServiceMock.getMyAccounts).toHaveBeenCalledWith(META, {
        skip: 0,
        take: 20,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('AccountsRestController: getMyAccountById', () => {
    it('should get account by id', async () => {
      const expectedResponse = {
        account: {
          branchId: 2,
          createdAt: new Date(),
          id: 1,
          ownerId: 4,
          accountType: AccountTypeEnum.Master,
          extra: {},
          walletNumber: {
            id: 1,
            accountId: 1,
            walletId: 'M1111111',
          },
          subAccounts: [
            {
              accountId: 1,
              balance: BigInt('10000'),
              createdAt: new Date(),
              currencyCode: 'USD',
              id: 1,
              isPrimary: true,
              updatedAt: new Date(),
            },
            {
              accountId: 1,
              balance: BigInt('0'),
              createdAt: new Date(),
              currencyCode: 'EUR',
              id: 2,
              isPrimary: false,
              updatedAt: new Date(),
            },
            {
              accountId: 1,
              balance: BigInt('0'),
              createdAt: new Date(),
              currencyCode: 'RUB',
              id: 3,
              isPrimary: false,
              updatedAt: new Date(),
            },
            {
              accountId: 1,
              balance: BigInt('0'),
              createdAt: new Date(),
              currencyCode: 'JPY',
              id: 4,
              isPrimary: false,
              updatedAt: new Date(),
            },
          ],
          updatedAt: new Date(),
          walletId: 'A44b2277-24137154103889',
        },
      };

      accountsServiceMock.getMyAccountById.mockResolvedValue(expectedResponse);

      const result = await accountsRestController.getMyAccountById(META, 1);

      expect(accountsServiceMock.getMyAccountById).toHaveBeenCalledWith(
        META,
        1,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('AccountsRestController: getTransactions', () => {
    it('should get transactions for sub-account', async () => {
      const subAccountId = 1;
      const expectedResponse = {
        transactions: [
          {
            amount: BigInt('10000'),
            branchId: 2,
            confirmationDate: null,
            confirmedBy: null,
            createdAt: new Date(),
            id: 2,
            isConfirmed: false,
            operationStatus: $Enums.OperationStatusEnum.Pending,
            operationSubType: $Enums.OperationSubTypeEnum.ExternalDeposit,
            operationType: $Enums.OperationTypeEnum.Deposit,
            paymentMethodUsed: {
              type: 'bankAccount',
            },
            receiptId: null,
            comment: '',
            subAccountId: 1,
            transferFrom: null,
            transferTo: null,
            updatedAt: new Date(),
            pairedTransactionId: null,
          },
        ],
      };

      accountsServiceMock.getTransactions.mockResolvedValue(expectedResponse);

      const result = await accountsRestController.getTransactions(
        META,
        subAccountId,
      );

      expect(accountsServiceMock.getTransactions).toHaveBeenCalledWith(META, {
        subAccountId,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('AccountsRestController: getRecentTransactions', () => {
    it('should get transactions for account', async () => {
      const accountId = '1';
      const expectedResponse = {
        count: 1,
        pageIndex: 1,
        take: 20,
        skip: 0,
        list: [
          {
            amount: BigInt('10000'),
            branchId: 2,
            confirmationDate: null,
            confirmedBy: null,
            createdAt: new Date(),
            id: 2,
            isConfirmed: false,
            operationStatus: $Enums.OperationStatusEnum.Pending,
            operationSubType: $Enums.OperationSubTypeEnum.ExternalDeposit,
            operationType: $Enums.OperationTypeEnum.Deposit,
            paymentMethodUsed: {
              type: 'bankAccount',
            },
            subAccount: {
              account: {
                id: 1,
                accountType: AccountTypeEnum.Master,
                walletNumber: {
                  id: 1,
                  accountId: 1,
                  walletId: 'M1111111',
                },
              },
              id: 1,
              currencyCode: 'USD',
            },
            receiptId: null,
            comment: '',
            subAccountId: 1,
            transferFrom: null,
            transferTo: null,
            updatedAt: new Date(),
            pairedTransactionId: null,
          },
        ],
      };

      accountsServiceMock.getRecentTransactions.mockResolvedValue(
        expectedResponse,
      );

      const result = await accountsRestController.getRecentTransactions(
        META,
        {},
        accountId,
      );

      expect(accountsServiceMock.getRecentTransactions).toHaveBeenCalledWith(
        META,
        {
          accountId: parseInt(accountId),
          skip: 0,
          take: 20,
        },
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should get transactions for all accounts', async () => {
      const expectedResponse = {
        count: 1,
        pageIndex: 1,
        take: 20,
        skip: 0,
        list: [
          {
            amount: BigInt('10000'),
            branchId: 2,
            confirmationDate: null,
            confirmedBy: null,
            createdAt: new Date(),
            id: 2,
            isConfirmed: false,
            operationStatus: $Enums.OperationStatusEnum.Pending,
            operationSubType: $Enums.OperationSubTypeEnum.ExternalDeposit,
            operationType: $Enums.OperationTypeEnum.Deposit,
            paymentMethodUsed: {
              type: 'bankAccount',
            },
            subAccount: {
              account: {
                id: 1,
                accountType: AccountTypeEnum.Master,
                walletNumber: { walletId: 'M1111111' },
              },
              id: 1,
              currencyCode: 'USD',
            },
            receiptId: null,
            comment: '',
            subAccountId: 1,
            transferFrom: null,
            transferTo: null,
            updatedAt: new Date(),
            pairedTransactionId: null,
          },
        ],
      };

      accountsServiceMock.getRecentTransactions.mockResolvedValue(
        expectedResponse,
      );

      const result = await accountsRestController.getRecentTransactions(
        META,
        {},
        null,
      );

      expect(accountsServiceMock.getRecentTransactions).toHaveBeenCalledWith(
        META,
        {
          skip: 0,
          take: 20,
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('updateUserAccountSettings', () => {
    it('should call service.updateUserAccountSettings with correct params', async () => {
      const userId = 1;
      const dto: UpdateUserAccountSettingsDto = {
        accountOperationsBlocked: false,
        limitInUsd: 2000n,
      };
      accountsServiceMock.updateUserAccountSettings.mockResolvedValue({
        id: userId,
        ...dto,
      } as any);

      const result = await accountsRestController.updateUserAccountSettings(
        userId,
        dto,
      );

      expect(
        accountsServiceMock.updateUserAccountSettings,
      ).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual({ id: userId, ...dto });
    });
  });

  describe('getUserAccountSettings', () => {
    it('should call service.getUserAccountSettings with correct params', async () => {
      const userId = 1;
      const mockSettings = { id: userId, someSetting: 'someValue' };
      accountsServiceMock.getUserAccountSettings.mockResolvedValue(
        mockSettings as any,
      );

      const result =
        await accountsRestController.getUserAccountSettings(userId);

      expect(accountsServiceMock.getUserAccountSettings).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(mockSettings);
    });
  });

  describe('throwErrorIfAccountBlocked', () => {
    it('should call service.throwErrorIfAccountBlocked with correct params', async () => {
      const userId = 1;
      accountsServiceMock.throwErrorIfAccountBlocked.mockResolvedValue({});

      const result = await accountsRestController.throwErrorIfAccountBlocked({
        userId,
      } as any);

      expect(
        accountsServiceMock.throwErrorIfAccountBlocked,
      ).toHaveBeenCalledWith(userId);
      expect(result).toEqual({});
    });
  });
});
