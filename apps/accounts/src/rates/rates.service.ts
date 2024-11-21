import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Rate } from '../../prisma/client';
import { AddCurrencyRateDto } from './request-dto/add-currency-rate.dto';

@Injectable()
export class RatesService {
  constructor(private prisma: PrismaService) {}

  async addCurrencyRate(dto: AddCurrencyRateDto, date: Date): Promise<Rate> {
    const currency = await this.prisma.currency.findUnique({
      where: { code: dto.targetCurrencyCode.toUpperCase() },
    });

    if (!currency) {
      throw new Error(`Currency with code ${dto.targetCurrencyCode} not found`);
    }

    return this.prisma.rate.create({
      data: {
        value: dto.value,
        date: date,
        targetCurrencyCode: dto.targetCurrencyCode.toUpperCase(),
      },
    });
  }

  async getRatesByDate(params: { skip: number; take: number; date: Date }) {
    return this.prisma.$transaction(async (tx) => {
      const list = await tx.rate.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { date: 'desc' },
        where: { date: params.date },
      });

      const ratesCount = await tx.rate.count({
        where: { date: params.date },
      });

      const pageIndex = Math.floor(params.skip / params.take);

      return {
        list,
        count: ratesCount,
        take: params.take,
        skip: params.skip,
        pageIndex,
      };
    });
  }

  async getMostActualRates(): Promise<Record<string, Rate>> {
    const latestRates = await this.prisma.$queryRaw<Rate[]>`
      SELECT DISTINCT ON ("targetCurrencyCode") value, "baseCurrencyCode", "targetCurrencyCode", date
      FROM "Rate"
      ORDER BY "targetCurrencyCode", "date" DESC
    `;

    const ratesMap = new Map<string, Rate>();
    latestRates.forEach((rate) => {
      ratesMap.set(rate.targetCurrencyCode, rate);
    });

    return Object.fromEntries(ratesMap.entries());
  }
}
