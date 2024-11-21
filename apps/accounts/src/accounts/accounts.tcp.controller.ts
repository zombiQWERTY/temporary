import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AccountsService } from './accounts.service';
import { CreateAccountRequestDto } from './request-dto/createAccountRequest.dto';
import { CreateAccountTMRequestDto } from './request-dto/createAccountTMRequest.dto';
import { GetStrategyAmountsTMRequestDto } from './request-dto/getStrategyAmountsTMRequest.dto';
import { CreateServiceTransactionRequestDto } from './request-dto/createServiceTransactionRequest.dto';
import { CREATE_SERVICE_TRANSACTION } from '@app/service-connector';

@Controller()
export class AccountsTcpController {
  constructor(private readonly accountsService: AccountsService) {}

  @MessagePattern({ cmd: 'create_account' })
  async createAccount(dto: CreateAccountRequestDto): Promise<{ ok: boolean }> {
    await this.accountsService.createAccount(dto.userId, {
      automatic: true,
    });

    return { ok: true };
  }

  @MessagePattern({ cmd: 'create_tm_account' })
  async createTMAccount(
    dto: CreateAccountTMRequestDto,
  ): Promise<{ ok: boolean; id: number }> {
    const res = await this.accountsService.createTMAccount(
      dto.userId,
      dto.strategyId,
      dto.mainCurrency,
    );

    return { ok: true, id: res.id };
  }

  @MessagePattern({ cmd: 'get_strategy_amounts' })
  async getStrategyAmounts(
    @Payload() dto: GetStrategyAmountsTMRequestDto,
  ): Promise<{
    ok: boolean;
    data: {
      strategyId: number;
      amount: bigint;
      transactionId: number;
    }[];
  }> {
    const data = await this.accountsService.getStrategyAmounts(
      dto.userId,
      dto.strategyIds,
      dto.transactionIds,
    );

    return { ok: true, data };
  }

  @MessagePattern({ cmd: CREATE_SERVICE_TRANSACTION })
  async createServiceTransaction(
    @Payload() dto: CreateServiceTransactionRequestDto,
  ): Promise<{ ok: boolean; ids: [number, number] }> {
    const res = await this.accountsService.createServiceTransaction(dto);
    const ids = [res[0].id, res[1].id] as [number, number];

    return { ok: true, ids };
  }
}
