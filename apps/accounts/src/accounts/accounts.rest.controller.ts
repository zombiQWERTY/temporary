import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import {
  UserMetadataParams,
  GetMetaParams,
  DefaultCurrenciesEnum,
} from '@erp-modul/shared';
import { MakeDepositRequestDto } from './request-dto/makeDepositRequest.dto';
import { MakeWithdrawalRequestDto } from './request-dto/makeWithdrawalRequest.dto';
import { MakeP2PTransferRequestDto } from './request-dto/makeP2PTransferRequest.dto';
import { MakeInternalTransferRequestDto } from './request-dto/makeInternalTransferRequest.dto';
import { ConfirmTransactionRequestDto } from './request-dto/confirmTransactionRequest.dto';
import { MakeInternalChangeRequestDto } from './request-dto/makeInternalChangeRequest.dto';
import { MakeInvestTMTransferRequestDto } from './request-dto/makeInvestTMTransferRequest.dto';
import { MakeWithdrawTMTransferRequestDto } from './request-dto/makeWithdrawTMTransferRequestDto';
import { UpdateUserAccountSettingsDto } from './request-dto/updateUserAccountSettings.dto';

@Controller('accounts')
export class AccountsRestController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('create')
  createAccount(@GetMetaParams() meta: UserMetadataParams) {
    return this.accountsService.createAccount(meta.userId, {
      automatic: false,
    });
  }

  @Post('deposit')
  makeExternalDeposit(
    @GetMetaParams() meta: UserMetadataParams,
    @Body() dto: MakeDepositRequestDto,
  ) {
    return this.accountsService.makeExternalDeposit(meta, {
      accountId: dto.accountId,
      currency: dto.currency,
      amount: dto.amount,
      receiptId: dto.fileIds?.[0],
      comment: dto.comment,
    });
  }

  @Post('withdraw')
  makeExternalWithdrawal(
    @GetMetaParams() meta: UserMetadataParams,
    @Body() dto: MakeWithdrawalRequestDto,
  ) {
    return this.accountsService.makeExternalWithdrawal(meta, {
      accountId: dto.accountId,
      amount: dto.amount,
      currency: dto.currency,
      details: dto.details,
      code: dto.code,
      comment: dto.comment,
    });
  }

  @Post('invest-tm-transfer')
  makeInvestTMTransfer(
    @GetMetaParams() meta: UserMetadataParams,
    @Body() dto: MakeInvestTMTransferRequestDto,
  ) {
    return this.accountsService.makeInvestTMTransfer(meta, {
      strategyId: dto.strategyId,
      amount: dto.amount,
      currency: dto.currency,
      userId: dto.userId,
      code: dto.code,
      comment: dto.comment,
    });
  }

  @Post('withdraw-tm-transfer')
  makeWithdrawTransferTM(
    @GetMetaParams() meta: UserMetadataParams,
    @Body() dto: MakeWithdrawTMTransferRequestDto,
  ) {
    return this.accountsService.makeWithdrawTMTransfer(meta, {
      investmentId: dto.investmentId,
      sharesAmount: dto.sharesAmount,
      userId: dto.userId,
      code: dto.code,
    });
  }

  @Post('p2p-transfer')
  makeP2PTransfer(
    @GetMetaParams() meta: UserMetadataParams,
    @Body() dto: MakeP2PTransferRequestDto,
  ) {
    return this.accountsService.makeP2PTransfer(meta, {
      fromAccountId: dto.fromAccountId,
      targetAccountId: dto.targetAccountId,
      currency: dto.currency,
      amount: dto.amount,
      code: dto.code,
      comment: dto.comment,
    });
  }

  @Post('internal-change')
  makeInternalChange(
    @GetMetaParams() meta: UserMetadataParams,
    @Body() dto: MakeInternalChangeRequestDto,
  ) {
    return this.accountsService.makeInternalChange(meta, {
      fromAccountId: dto.fromAccountId,
      fromCurrency: dto.fromCurrency,
      toCurrency: dto.toCurrency,
      amount: dto.amount,
      code: dto.code,
      comment: dto.comment,
    });
  }

  @Post('internal-transfer')
  makeInternalTransfer(
    @GetMetaParams() meta: UserMetadataParams,
    @Body() dto: MakeInternalTransferRequestDto,
  ) {
    return this.accountsService.makeInternalTransfer(meta, {
      fromAccountId: dto.fromAccountId,
      targetAccountId: dto.targetAccountId,
      currency: dto.currency,
      amount: dto.amount,
      code: dto.code,
      comment: dto.comment,
    });
  }

  @Post('confirm-transaction')
  confirmTransaction(
    @GetMetaParams() meta: UserMetadataParams,
    @Body() dto: ConfirmTransactionRequestDto,
  ) {
    return this.accountsService.confirmTransaction(meta, {
      transactionId: dto.transactionId,
      isConfirmed: dto.isConfirmed,
      amount: dto.amount,
    });
  }

  @Get('unconfirmed-transactions')
  getUnconfirmedTransactionsInBranch(
    @GetMetaParams() meta: UserMetadataParams,
  ) {
    return this.accountsService.getUnconfirmedTransactionsInBranch(meta);
  }

  @Get('balance')
  async getBalance(@GetMetaParams() meta: UserMetadataParams) {
    try {
      await this.accountsService.throwErrorIfAccountBlocked(meta.userId);
    } catch (e) {
      return {
        balances: [
          { currencyCode: DefaultCurrenciesEnum.USD, balance: 0n },
          { currencyCode: DefaultCurrenciesEnum.EUR, balance: 0n },
          { currencyCode: DefaultCurrenciesEnum.JPY, balance: 0n },
          { currencyCode: DefaultCurrenciesEnum.RUB, balance: 0n },
        ],
      };
    }

    const balances = await this.accountsService.getBalance({
      ownerId: meta.userId,
    });

    return { balances };
  }

  @Get('balance/:subAccountId')
  async getSubAccountBalance(
    @GetMetaParams() meta: UserMetadataParams,
    @Param('subAccountId', ParseIntPipe) subAccountId: number,
  ) {
    const balance = await this.accountsService.getSubAccountBalance({
      ownerId: meta.userId,
      subAccountId,
    });

    return { balance };
  }

  @Get('my-accounts')
  getMyAccounts(
    @Query() query: Record<string, string>,
    @GetMetaParams() meta: UserMetadataParams,
  ) {
    const defaultTake = 20;

    const take = Math.min(parseInt(query.take, 10) || defaultTake, 100);
    const skip = parseInt(query.skip, 10) || 0;

    return this.accountsService.getMyAccounts(meta, {
      skip,
      take,
    });
  }

  @Get('my-accounts/:id')
  getMyAccountById(
    @GetMetaParams() meta: UserMetadataParams,
    @Param('id') accountId: string | number,
  ) {
    if (!isNaN(Number(accountId))) {
      accountId = Number(accountId);
    }

    return this.accountsService.getMyAccountById(meta, accountId);
  }

  @Get('client-accounts/:clientId')
  getClientAccounts(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.accountsService.getClientAccounts(clientId);
  }

  @Get('recent-transactions/:accountId?')
  getRecentTransactions(
    @GetMetaParams() meta: UserMetadataParams,
    @Query() query: Record<string, string>,
    @Param('accountId')
    accountId?: string,
  ) {
    const defaultTake = 20;

    const take = Math.min(parseInt(query.take, 10) || defaultTake, 100);
    const skip = parseInt(query.skip, 10) || 0;

    return this.accountsService.getRecentTransactions(meta, {
      accountId: accountId ? parseInt(accountId, 10) : undefined,
      skip,
      take,
    });
  }

  @Get('transactions/:subAccountId')
  getTransactions(
    @GetMetaParams() meta: UserMetadataParams,
    @Param('subAccountId', ParseIntPipe) subAccountId: number,
  ) {
    return this.accountsService.getTransactions(meta, {
      subAccountId,
    });
  }

  @Get('client-transactions/:clientId/:subAccountId')
  getClientTransactions(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('subAccountId', ParseIntPipe) subAccountId: number,
  ) {
    return this.accountsService.getClientTransactions({
      subAccountId,
      clientId,
    });
  }

  @Post('/settings/:userId')
  async updateUserAccountSettings(
    @Param('userId') userId: number,
    @Body() dto: UpdateUserAccountSettingsDto,
  ) {
    return this.accountsService.updateUserAccountSettings(userId, dto);
  }

  @Get('settings')
  async getMyAccountSettings(@GetMetaParams() meta: UserMetadataParams) {
    return this.accountsService.getUserAccountSettings(meta.userId);
  }

  @Get('settings/:userId')
  async getUserAccountSettings(@Param('userId') userId: number) {
    return this.accountsService.getUserAccountSettings(userId);
  }

  @Get('throw-error-if-account-blocked')
  async throwErrorIfAccountBlocked(@GetMetaParams() meta: UserMetadataParams) {
    return this.accountsService.throwErrorIfAccountBlocked(meta.userId);
  }
}
