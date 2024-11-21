import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs';

import {
  AUDIT_LOG_SERVICE,
  AuditLog,
  DefaultCurrenciesEnum,
  UserMetadataParams,
  UserMetaService,
} from '@erp-modul/shared';
import { Account } from '../../prisma/client';

@Injectable()
export class AccountsTriggersService {
  constructor(
    @Inject(AUDIT_LOG_SERVICE) private auditLogServiceClient: ClientProxy,
    private readonly _userMetaService: UserMetaService,
  ) {}

  private logger = new Logger(AccountsTriggersService.name);

  postAccountCreation(account: Account, automatic: boolean) {
    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Account',
        event: {
          eventType: AuditLog.EventTypeEnum.Create,
          eventDescription: automatic
            ? 'New account for user was generated'
            : 'User self opened new account',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: { newState: account },
        user: {
          id: account.ownerId,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postTMAccountCreation(account: Account) {
    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Account',
        event: {
          eventType: AuditLog.EventTypeEnum.Create,
          eventDescription: 'New account for TM was generated',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: { newState: account },
        user: {
          id: account.ownerId,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postExternalDeposit(
    meta: UserMetadataParams,
    params: {
      receiptId?: number;
      accountId: number;
      currency: DefaultCurrenciesEnum;
      amount: bigint;
    },
    extra?: { isAccountant: boolean },
  ) {
    const isAccountant = extra?.isAccountant || false;

    return this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Account',
        event: {
          eventType: AuditLog.EventTypeEnum.Income,
          eventDescription: 'User initiated external deposit',
        },
        outcome: AuditLog.OutcomeEnum.Process,
        state: { newState: params },
        user: {
          id: meta.userId,
        },
        additionalParams: {
          isAccountant,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postExternalWithdrawal(
    meta: UserMetadataParams,
    params: Record<string, any>,
    extra?: { isAccountant: boolean },
  ) {
    const isAccountant = extra?.isAccountant || false;

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Account',
        event: {
          eventType: AuditLog.EventTypeEnum.Outgo,
          eventDescription: 'User initiated external withdrawal',
        },
        outcome: AuditLog.OutcomeEnum.Process,
        state: { newState: params },
        user: {
          id: meta.userId,
        },
        additionalParams: {
          isAccountant,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postP2PTransferOutgo(
    meta: UserMetadataParams,
    params: {
      fromAccountId: number;
      targetAccountId: string;
      currency: string;
      amount: bigint;
    },
    extra?: { isAccountant: boolean },
  ) {
    const isAccountant = extra?.isAccountant || false;

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Account',
        event: {
          eventType: AuditLog.EventTypeEnum.Outgo,
          eventDescription: 'User initiated P2P transfer',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: { newState: params },
        user: {
          id: meta.userId,
        },
        additionalParams: {
          isAccountant,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postP2PTransferIncome(
    meta: UserMetadataParams,
    params: {
      fromAccountId: number;
      targetAccountId: string;
      targetUserId: number;
      currency: string;
      amount: bigint;
    },
    extra?: { isAccountant: boolean },
  ) {
    const isAccountant = extra?.isAccountant || false;

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Account',
        event: {
          eventType: AuditLog.EventTypeEnum.Income,
          eventDescription: 'User received P2P transfer',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: { newState: { ...params, from: meta.userId } },
        user: {
          id: params.targetUserId,
        },
        additionalParams: {
          isAccountant,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postInvestTMTransferOutgo(
    meta: UserMetadataParams,
    params: Record<string, any>,
    extra?: { isAccountant: boolean },
  ) {
    const isAccountant = extra?.isAccountant || false;

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Account',
        event: {
          eventType: AuditLog.EventTypeEnum.Outgo,
          eventDescription: 'User initiated invest tm transfer',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: { newState: params },
        user: {
          id: meta.userId,
        },
        additionalParams: {
          isAccountant,
          strategyId: params.strategyId,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postInvestTMTransferIncome(
    meta: UserMetadataParams,
    params: Record<string, any>,
    extra?: { isAccountant: boolean; trusteeId: number },
  ) {
    const isAccountant = extra?.isAccountant || false;

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Account',
        event: {
          eventType: AuditLog.EventTypeEnum.Income,
          eventDescription: 'Trustee received invest tm transfer',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: { newState: { ...params, from: meta.userId } },
        user: {
          id: extra.trusteeId,
        },
        additionalParams: {
          isAccountant,
          strategyId: params.strategyId,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postInternalChangeOutgo(
    meta: UserMetadataParams,
    params: {
      fromAccountId: number;
      fromCurrency: DefaultCurrenciesEnum;
      toCurrency: DefaultCurrenciesEnum;
      amount: bigint;
    },
    extra?: { isAccountant: boolean },
  ) {
    const isAccountant = extra?.isAccountant || false;

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Account',
        event: {
          eventType: AuditLog.EventTypeEnum.Outgo,
          eventDescription: 'User initiated internal change',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: { newState: params },
        user: {
          id: meta.userId,
        },
        additionalParams: {
          isAccountant,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postInternalChangeIncome(
    meta: UserMetadataParams,
    params: {
      fromAccountId: number;
      fromCurrency: DefaultCurrenciesEnum;
      toCurrency: DefaultCurrenciesEnum;
      amount: bigint;
    },
    extra?: { isAccountant: boolean },
  ) {
    const isAccountant = extra?.isAccountant || false;

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Account',
        event: {
          eventType: AuditLog.EventTypeEnum.Income,
          eventDescription: 'User received internal change',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: { newState: { ...params, from: meta.userId } },
        user: {
          id: meta.userId,
        },
        additionalParams: {
          isAccountant,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postInternalTransferOutgo(
    meta: UserMetadataParams,
    params: {
      fromAccountId: number;
      targetAccountId: number;
      amount: bigint;
    },
    extra?: { isAccountant: boolean },
  ) {
    const isAccountant = extra?.isAccountant || false;

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Account',
        event: {
          eventType: AuditLog.EventTypeEnum.Outgo,
          eventDescription: 'User initiated Internal transfer',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: { newState: params },
        user: {
          id: meta.userId,
        },
        additionalParams: {
          isAccountant,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postInternalTransferIncome(
    meta: UserMetadataParams,
    params: {
      fromAccountId: number;
      targetAccountId: number;
      amount: bigint;
    },
    extra?: { isAccountant: boolean },
  ) {
    const isAccountant = extra?.isAccountant || false;

    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Account',
        event: {
          eventType: AuditLog.EventTypeEnum.Income,
          eventDescription: 'User received Internal transfer',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: { newState: { ...params, from: meta.userId } },
        user: {
          id: meta.userId,
        },
        additionalParams: {
          isAccountant,
        },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }

  postConfirmTransaction(
    meta: UserMetadataParams,
    params: {
      transactionId: number;
      isConfirmed: boolean;
      ownerId: number;
    },
    extra?: { amountChanged?: string },
  ) {
    this.auditLogServiceClient
      .send<never, AuditLog.PutLogRequestDto>('put', {
        resource: 'Account',
        event: {
          eventType: AuditLog.EventTypeEnum.Update,
          eventDescription: 'Manager confirmed transaction',
        },
        outcome: AuditLog.OutcomeEnum.Success,
        state: { newState: { ...params, managerId: meta.userId } },
        user: {
          id: params.ownerId,
        },
        additionalParams: { amountChanged: extra.amountChanged },
      })
      .pipe(timeout(5000))
      .subscribe({
        error: (err) =>
          this.logger.error('Unexpected send audit log error:', err),
      });
  }
}
