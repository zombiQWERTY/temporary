import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { of, throwError } from 'rxjs';
import { GetInvestmentById, ProductsTmService } from '@app/service-connector';
import { DefaultCurrenciesEnum, PRODUCTS_TM_SERVICE } from '@erp-modul/shared';

describe('SC => ProductsTmService', () => {
  let service: ProductsTmService;
  let productsTMServiceClientMock: DeepMockProxy<ClientProxy>;

  beforeEach(async () => {
    productsTMServiceClientMock = mockDeep<ClientProxy>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsTmService,
        { provide: PRODUCTS_TM_SERVICE, useValue: productsTMServiceClientMock },
      ],
    }).compile();

    service = module.get<ProductsTmService>(ProductsTmService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTMTransaction', () => {
    const params = {
      transactionId: 1,
      clientId: 1,
      strategyId: 100,
      operationType: 'Deposit',
      operationStatus: 'Completed',
      amount: BigInt(1000),
      branchId: 1,
      clientSubAccountId: 1,
      strategySubAccountId: 2,
      originalTransactionIds: [3, 4] as [number, number],
    };

    it('should return { ok: true } when transaction is successfully created', async () => {
      productsTMServiceClientMock.send.mockReturnValue(of({ ok: true }));

      const result = await service.createTMTransaction(params);

      expect(result).toEqual({ ok: true });
      expect(productsTMServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'create_tm_transaction' },
        params,
      );
    });

    it('should handle a timeout error when the service is unresponsive', async () => {
      productsTMServiceClientMock.send.mockReturnValue(
        of(
          new Promise((_, rej) => {
            setTimeout(() => {
              rej(new Error('timeout'));
            }, 100);
          }),
        ),
      );

      await expect(service.createTMTransaction(params)).rejects.toThrow(
        'timeout',
      );

      expect(productsTMServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'create_tm_transaction' },
        params,
      );
    });

    it('should return { ok: true, unusedAmount: bigint } if unused amount is returned', async () => {
      const unusedAmount = BigInt(500);
      productsTMServiceClientMock.send.mockReturnValue(
        of({ ok: true, unusedAmount }),
      );

      const result = await service.createTMTransaction(params);

      expect(result).toEqual({ ok: true, unusedAmount });
      expect(productsTMServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'create_tm_transaction' },
        params,
      );
    });

    it('should handle an error response from the service', async () => {
      productsTMServiceClientMock.send.mockReturnValue(
        of(
          new Promise((_, rej) => {
            rej(new Error('Internal Server Error'));
          }),
        ),
      );

      await expect(service.createTMTransaction(params)).rejects.toThrow(
        'Internal Server Error',
      );

      expect(productsTMServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'create_tm_transaction' },
        params,
      );
    });
  });

  describe('getInvestmentById', () => {
    const params: GetInvestmentById = { id: 1 };
    const expectedResponse = {
      baseCurrency: DefaultCurrenciesEnum.USD,
      strategyId: 2,
      totalShares: 100,
      shareCost: BigInt(5000),
    };

    it('should return investment details for a valid ID', async () => {
      productsTMServiceClientMock.send.mockReturnValue(of(expectedResponse));

      const result = await service.getInvestmentById(params);

      expect(result).toEqual(expectedResponse);
      expect(productsTMServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'get_investment_by_id' },
        params,
      );
    });

    it('should handle a timeout error when the service is unresponsive', async () => {
      productsTMServiceClientMock.send.mockReturnValue(
        throwError(() => new Error('timeout')),
      );

      await expect(service.getInvestmentById(params)).rejects.toThrow(
        'timeout',
      );

      expect(productsTMServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'get_investment_by_id' },
        params,
      );
    });

    it('should handle an error response from the service', async () => {
      productsTMServiceClientMock.send.mockReturnValue(
        throwError(() => new Error('Internal Server Error')),
      );

      await expect(service.getInvestmentById(params)).rejects.toThrow(
        'Internal Server Error',
      );

      expect(productsTMServiceClientMock.send).toHaveBeenCalledWith(
        { cmd: 'get_investment_by_id' },
        params,
      );
    });
  });
});
