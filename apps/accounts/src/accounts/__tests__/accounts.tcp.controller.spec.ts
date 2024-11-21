import { AccountsTcpController } from '../accounts.tcp.controller';
import { AccountsService } from '../accounts.service';
import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CreateAccountRequestDto } from '../request-dto/createAccountRequest.dto';
import { CreateAccountTMRequestDto } from '../request-dto/createAccountTMRequest.dto';
import { GetStrategyAmountsTMRequestDto } from '../request-dto/getStrategyAmountsTMRequest.dto';
import { DefaultCurrenciesEnum } from '@erp-modul/shared';

const CREATE_ACCOUNT_REQUEST_DTO: CreateAccountRequestDto = {
  userId: 1,
};

const CREATE_TM_ACCOUNT_REQUEST_DTO: CreateAccountTMRequestDto = {
  userId: 1,
  strategyId: 2,
  mainCurrency: DefaultCurrenciesEnum.USD,
};

const GET_STRATEGY_AMOUNTS_REQUEST_DTO: GetStrategyAmountsTMRequestDto = {
  userId: 1,
  strategyIds: [2],
  transactionIds: [3],
};

describe('AccountsTcpController', () => {
  let accountsTcpController: AccountsTcpController;
  let accountsServiceMock: DeepMockProxy<AccountsService>;

  beforeEach(async () => {
    accountsServiceMock = mockDeep<AccountsService>();

    const moduleRef = await Test.createTestingModule({
      controllers: [AccountsTcpController],
      providers: [
        {
          provide: AccountsService,
          useValue: accountsServiceMock,
        },
      ],
    }).compile();

    accountsTcpController = moduleRef.get<AccountsTcpController>(
      AccountsTcpController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AccountsTcpController: Create account', () => {
    it('should return success response for create account', async () => {
      accountsServiceMock.createAccount.mockResolvedValue({ id: 1 } as any);

      const result = await accountsTcpController.createAccount(
        CREATE_ACCOUNT_REQUEST_DTO,
      );

      expect(result).toEqual({ ok: true });
      expect(accountsServiceMock.createAccount).toHaveBeenCalledWith(
        CREATE_ACCOUNT_REQUEST_DTO.userId,
        {
          automatic: true,
        },
      );
    });
  });

  describe('AccountsTcpController: Create TM account', () => {
    it('should return success response for create TM account', async () => {
      accountsServiceMock.createTMAccount.mockResolvedValue({ id: 10 } as any);

      const result = await accountsTcpController.createTMAccount(
        CREATE_TM_ACCOUNT_REQUEST_DTO,
      );

      expect(result).toEqual({ ok: true, id: 10 });
      expect(accountsServiceMock.createTMAccount).toHaveBeenCalledWith(
        CREATE_TM_ACCOUNT_REQUEST_DTO.userId,
        CREATE_TM_ACCOUNT_REQUEST_DTO.strategyId,
        CREATE_TM_ACCOUNT_REQUEST_DTO.mainCurrency,
      );
    });
  });

  describe('AccountsTcpController: Get strategy amounts', () => {
    it('should return success response for get strategy amounts', async () => {
      const mockData = [
        { strategyId: 2, transactionId: 1, amount: BigInt(1000) },
      ];
      accountsServiceMock.getStrategyAmounts.mockResolvedValue(mockData);

      const result = await accountsTcpController.getStrategyAmounts(
        GET_STRATEGY_AMOUNTS_REQUEST_DTO,
      );

      expect(result).toEqual({ ok: true, data: mockData });
      expect(accountsServiceMock.getStrategyAmounts).toHaveBeenCalledWith(
        GET_STRATEGY_AMOUNTS_REQUEST_DTO.userId,
        GET_STRATEGY_AMOUNTS_REQUEST_DTO.strategyIds,
        GET_STRATEGY_AMOUNTS_REQUEST_DTO.transactionIds,
      );
    });
  });
});
