import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateTMTransaction,
  GetInvestmentById,
} from '../types/productsTm.types';
import { DefaultCurrenciesEnum, PRODUCTS_TM_SERVICE } from '@erp-modul/shared';

export const ON_TRANSACTION_PROCESSING_EVENT =
  'ON_TRANSACTION_PROCESSING_EVENT';
export const ON_SHARE_UNIT_ADDED_EVENT = 'ON_SHARE_UNIT_ADDED_EVENT';

@Injectable()
export class ProductsTmService {
  constructor(
    @Inject(PRODUCTS_TM_SERVICE) private productsTMServiceClient: ClientProxy,
  ) {}

  async createTMTransaction(
    params: CreateTMTransaction,
  ): Promise<{ ok: true }> {
    return firstValueFrom(
      this.productsTMServiceClient
        .send<{
          ok: true;
        }>({ cmd: 'create_tm_transaction' }, params)
        .pipe(timeout(5000)),
    );
  }

  async getInvestmentById(params: GetInvestmentById): Promise<{
    baseCurrency: DefaultCurrenciesEnum;
    strategyId: number;
    totalShares: number;
    shareCost: bigint;
  }> {
    return firstValueFrom(
      this.productsTMServiceClient
        .send<{
          baseCurrency: DefaultCurrenciesEnum;
          strategyId: number;
          totalShares: number;
          shareCost: bigint;
        }>({ cmd: 'get_investment_by_id' }, params)
        .pipe(timeout(5000)),
    );
  }
}
