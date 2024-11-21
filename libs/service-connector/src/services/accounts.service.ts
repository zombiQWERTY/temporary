import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { CreateServiceTransaction } from '@app/service-connector/types/accounts.types';
import { ACCOUNTS_SERVICE } from '@erp-modul/shared';

export const CREATE_SERVICE_TRANSACTION = 'CREATE_SERVICE_TRANSACTION';

@Injectable()
export class AccountsService {
  constructor(
    @Inject(ACCOUNTS_SERVICE) private accountsServiceClient: ClientProxy,
  ) {}

  createTMAccount(userId: number, strategyId: number, mainCurrency: string) {
    return firstValueFrom(
      this.accountsServiceClient
        .send<{
          ok: boolean;
          id: number;
        }>({ cmd: 'create_tm_account' }, { userId, strategyId, mainCurrency })
        .pipe(timeout(5000)),
    );
  }

  getStrategyAmounts(
    userId: number,
    strategyIds: number[],
    transactionIds: number[],
  ) {
    return firstValueFrom(
      this.accountsServiceClient
        .send<{
          ok: boolean;
          data: {
            strategyId: number;
            amount: bigint;
            transactionId: number;
          }[];
        }>(
          { cmd: 'get_strategy_amounts' },
          { userId, strategyIds, transactionIds },
        )
        .pipe(timeout(5000)),
    );
  }

  createServiceTransaction(params: CreateServiceTransaction) {
    return firstValueFrom(
      this.accountsServiceClient
        .send<{
          ok: boolean;
          ids: [number, number];
        }>({ cmd: CREATE_SERVICE_TRANSACTION }, params)
        .pipe(timeout(5000)),
    );
  }
}
