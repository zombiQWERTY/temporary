import { Test, TestingModule } from '@nestjs/testing';
import { RatesService } from '../rates.service';
import { PrismaService } from '../../services/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { AddCurrencyRateDto } from '../request-dto/add-currency-rate.dto';
import { Rate } from '../../../prisma/client';
import { PrismaClient } from '@prisma/client';
import { DefaultCurrenciesEnum } from '@erp-modul/shared';
import { Decimal } from '@prisma/client/runtime/library';

const mockRate: Rate = {
  id: 1,
  value: new Decimal(1.2),
  date: new Date('2024-10-01'),
  baseCurrencyCode: 'USD',
  targetCurrencyCode: 'EUR',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RatesService', () => {
  let service: RatesService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<RatesService>(RatesService);
  });

  describe('addCurrencyRate', () => {
    it('should throw an error if currency is not found', async () => {
      prismaMock.currency.findUnique.mockResolvedValue(null);
      const dto: AddCurrencyRateDto = {
        targetCurrencyCode: DefaultCurrenciesEnum.EUR,
        value: 1.2,
      };

      await expect(service.addCurrencyRate(dto, new Date())).rejects.toThrow(
        `Currency with code ${dto.targetCurrencyCode} not found`,
      );
    });

    it('should call prisma.rate.create with the correct data', async () => {
      prismaMock.currency.findUnique.mockResolvedValue({
        id: 1,
        code: 'EUR',
        name: 'Euro',
      });
      prismaMock.rate.create.mockResolvedValue(mockRate);

      const dto: AddCurrencyRateDto = {
        targetCurrencyCode: DefaultCurrenciesEnum.EUR,
        value: 1.2,
      };
      const date = new Date('2024-10-01');

      const result = await service.addCurrencyRate(dto, date);

      expect(prismaMock.rate.create).toHaveBeenCalledWith({
        data: {
          value: dto.value,
          date,
          targetCurrencyCode: dto.targetCurrencyCode.toUpperCase(),
        },
      });
      expect(result).toEqual(mockRate);
    });
  });

  describe('getRatesByDate', () => {
    it('should return list of rates with pagination info', async () => {
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock);
      });

      prismaMock.rate.findMany.mockResolvedValue([mockRate]);
      prismaMock.rate.count.mockResolvedValue(1);

      const params = {
        date: new Date('2024-10-01'),
        skip: 0,
        take: 10,
      };

      const result = await service.getRatesByDate(params);

      expect(prismaMock.rate.findMany).toHaveBeenCalledWith({
        skip: params.skip,
        take: params.take,
        orderBy: { date: 'desc' },
        where: { date: params.date },
      });
      expect(prismaMock.rate.count).toHaveBeenCalledWith({
        where: { date: params.date },
      });
      expect(result).toEqual({
        list: [mockRate],
        count: 1,
        take: params.take,
        skip: params.skip,
        pageIndex: 0,
      });
    });
  });

  describe('getMostActualRatesMap', () => {
    it('should return a map with the most recent rate for each currency', async () => {
      const mockRates: Rate[] = [
        {
          id: 1,
          value: new Decimal(1.2),
          baseCurrencyCode: 'USD',
          targetCurrencyCode: 'EUR',
          date: new Date('2023-10-10T00:00:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          value: new Decimal(1.3),
          baseCurrencyCode: 'USD',
          targetCurrencyCode: 'GBP',
          date: new Date('2023-10-09T00:00:00Z'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.$queryRaw.mockResolvedValue(mockRates);

      const result = await service.getMostActualRates();

      const expectedMap = new Map<string, Rate>();
      expectedMap.set('EUR', mockRates[0]);
      expectedMap.set('GBP', mockRates[1]);

      expect(result).toEqual(Object.fromEntries(expectedMap.entries()));
    });

    it('should return an empty map if there are no rates in the database', async () => {
      prismaMock.$queryRaw.mockResolvedValue([]);

      const result = await service.getMostActualRates();

      expect(Object.keys(result).length).toBe(0);
    });
  });
});
