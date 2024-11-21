import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { RatesService } from './rates.service';
import { AddCurrencyRateDto } from './request-dto/add-currency-rate.dto';
import { isValid } from 'date-fns';
import { DefaultCurrenciesEnum } from '@erp-modul/shared';

@Controller('rates')
export class RatesRestController {
  constructor(private readonly ratesService: RatesService) {}

  @Post()
  async addCurrencyRate(@Body() dto: AddCurrencyRateDto) {
    const rateDate = new Date();

    if (dto.targetCurrencyCode === DefaultCurrenciesEnum.USD) {
      throw new BadRequestException('Should not update USD');
    }

    return this.ratesService.addCurrencyRate(dto, rateDate);
  }

  @Get()
  async getRatesByDate(@Query() query: Record<string, string>) {
    const defaultTake = 20;

    const take = Math.min(parseInt(query.take, 10) || defaultTake, 100);
    const skip = parseInt(query.skip, 10) || 0;

    const date = new Date(query.date);
    return this.ratesService.getRatesByDate({
      date: isValid(date) ? date : undefined,
      take,
      skip,
    });
  }

  @Get('/latest')
  async getLatestRates() {
    return await this.ratesService.getMostActualRates();
  }
}
