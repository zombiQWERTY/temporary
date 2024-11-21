import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { AccountsService } from '@app/service-connector';
import { of, timeout } from 'rxjs';
import { ACCOUNTS_SERVICE } from '@erp-modul/shared';

describe('SC => AccountsService', () => {
  let service: AccountsService;
  let accountsServiceClientMock: DeepMockProxy<ClientProxy>;

  beforeEach(async () => {
    accountsServiceClientMock = mockDeep<ClientProxy>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: ACCOUNTS_SERVICE,
          useValue: accountsServiceClientMock,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTMAccount', () => {
    const userId = 123;
    const strategyId = 456;
    const mainCurrency = 'USD';

    it('should create a TM account and return the account ID', async () => {
      const response = { ok: true, id: 789 };
      accountsServiceClientMock.send.mockReturnValue(
        of(response).pipe(timeout(5000)),
      );

      const result = await service.createTMAccount(
        userId,
        strategyId,
        mainCurrency,
      );

      expect(accountsServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'create_tm_account' },
        { userId, strategyId, mainCurrency },
      );

      expect(result).toEqual(response);
    });
  });

  describe('getStrategyAmounts', () => {
    const userId = 123;
    const strategyIds = [1, 2, 3];
    const transactionIds = [10, 20, 30];

    it('should return the strategy amounts', async () => {
      const response = {
        ok: true,
        data: [
          { strategyId: '1', amount: BigInt(1000) },
          { strategyId: '2', amount: BigInt(2000) },
        ],
      };
      accountsServiceClientMock.send.mockReturnValue(
        of(response).pipe(timeout(5000)),
      );

      const result = await service.getStrategyAmounts(
        userId,
        strategyIds,
        transactionIds,
      );

      expect(accountsServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'get_strategy_amounts' },
        { userId, strategyIds, transactionIds },
      );

      expect(result).toEqual(response);
    });
  });
});
