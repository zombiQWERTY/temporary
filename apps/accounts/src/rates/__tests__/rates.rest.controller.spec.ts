import { Test, TestingModule } from '@nestjs/testing';
import { RatesRestController } from '../rates.rest.controller';
import { RatesService } from '../rates.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { AddCurrencyRateDto } from '../request-dto/add-currency-rate.dto';
import { DefaultCurrenciesEnum } from '@erp-modul/shared';

describe('RatesRestController', () => {
  let controller: RatesRestController;
  let ratesService: DeepMockProxy<RatesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatesRestController],
      providers: [
        {
          provide: RatesService,
          useValue: mockDeep<RatesService>(),
        },
      ],
    }).compile();

    controller = module.get<RatesRestController>(RatesRestController);
    ratesService = module.get(RatesService);
  });

  describe('addCurrencyRate', () => {
    it('should call ratesService.addCurrencyRate with the correct parameters', async () => {
      const dto: AddCurrencyRateDto = {
        targetCurrencyCode: DefaultCurrenciesEnum.EUR,
        value: 1.2,
      };

      await controller.addCurrencyRate(dto);

      expect(ratesService.addCurrencyRate).toHaveBeenCalledWith(
        dto,
        expect.any(Date),
      );
    });
  });

  describe('getRatesByDate', () => {
    it('should call ratesService.getRatesByDate with default pagination when no query params are provided', async () => {
      const query = { date: '2024-10-01' };
      const date = new Date(query.date);
      const defaultTake = 20;
      const skip = 0;

      await controller.getRatesByDate(query);

      expect(ratesService.getRatesByDate).toHaveBeenCalledWith({
        date,
        take: defaultTake,
        skip,
      });
    });

    it('should call ratesService.getRatesByDate with the correct take and skip parameters', async () => {
      const query = { date: '2024-10-01', take: '30', skip: '5' };
      const date = new Date(query.date);
      const take = 30;
      const skip = 5;

      await controller.getRatesByDate(query);

      expect(ratesService.getRatesByDate).toHaveBeenCalledWith({
        date,
        take,
        skip,
      });
    });

    it('should enforce a maximum take value of 100', async () => {
      const query = { date: '2024-10-01', take: '150', skip: '5' };
      const date = new Date(query.date);
      const take = 100;
      const skip = 5;

      await controller.getRatesByDate(query);

      expect(ratesService.getRatesByDate).toHaveBeenCalledWith({
        date,
        take,
        skip,
      });
    });

    it('should handle invalid date format gracefully', async () => {
      const query = { date: 'invalid-date', take: '150', skip: '5' };
      const take = 100;
      const skip = 5;

      await controller.getRatesByDate(query);

      expect(ratesService.getRatesByDate).toHaveBeenCalledWith({
        date: undefined,
        take,
        skip,
      });
    });
  });
});
