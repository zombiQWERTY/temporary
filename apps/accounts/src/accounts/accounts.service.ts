import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as R from 'ramda';
import { firstValueFrom, timeout } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

import { PrismaService } from '../services/prisma.service';
import { AccountsTriggersService } from './accountsTriggers.service';
import {
  AccountTypeEnum,
  OperationStatusEnum,
  OperationSubTypeEnum,
  OperationTypeEnum,
  Prisma,
  PrismaClient,
  Rate,
} from '../../prisma/client';
import {
  ALERT_SERVICE,
  CORE_SERVICE,
  DefaultCurrenciesEnum,
  FILES_SERVICE,
  RoleEnum,
  UserMetadataParams,
} from '@erp-modul/shared';
import { ProductsTmService } from '@app/service-connector';
import { CreateServiceTransactionRequestDto } from './request-dto/createServiceTransactionRequest.dto';
import { Details } from './request-dto/makeWithdrawalRequest.dto';
import { UpdateUserAccountSettingsDto } from './request-dto/updateUserAccountSettings.dto';
import { RatesService } from '../rates/rates.service';
import { Decimal } from '@prisma/client/runtime/library';
import { WalletNumberService } from '../services/wallet-number.service';

type PrismaTransactionalClient = Prisma.TransactionClient | PrismaClient;

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private accountsTriggersService: AccountsTriggersService,
    private ratesService: RatesService,
    private walletNumberService: WalletNumberService,
    private readonly scProductsTm: ProductsTmService,
    @Inject(FILES_SERVICE) private filesServiceClient: ClientProxy,
    @Inject(CORE_SERVICE) private coreServiceClient: ClientProxy,
    @Inject(ALERT_SERVICE) private alertServiceClient: ClientProxy,
  ) {}

  createAccount(userId: number, { automatic }: { automatic: boolean }) {
    return this.prisma.$transaction(async (tx) => {
      if (automatic) {
        const hasAccounts = await tx.account.count({
          where: { ownerId: userId },
        });

        if (hasAccounts) {
          return null;
        }
      }

      const walletNumberForMain =
        await this.walletNumberService.generateWalletId(tx);

      const created = await tx.account.create({
        data: {
          ownerId: userId,
          accountType: AccountTypeEnum.Master,
          walletNumber: {
            create: {
              walletId: walletNumberForMain,
            },
          },
          subAccounts: {
            createMany: {
              data: Object.values(DefaultCurrenciesEnum).map((currency) => {
                return {
                  currencyCode: currency,
                  isPrimary: currency === DefaultCurrenciesEnum.USD,
                };
              }),
            },
          },
        },
      });

      const walletNumberForSavings =
        await this.walletNumberService.generateWalletId(tx);

      await tx.account.create({
        data: {
          ownerId: userId,
          accountType: AccountTypeEnum.Savings,
          walletNumber: {
            create: {
              walletId: walletNumberForSavings,
            },
          },
          subAccounts: {
            createMany: {
              data: Object.values(DefaultCurrenciesEnum).map((currency) => {
                return {
                  currencyCode: currency,
                  isPrimary: currency === DefaultCurrenciesEnum.USD,
                };
              }),
            },
          },
        },
      });

      await this.createUserAccountSettings(tx, userId);

      this.accountsTriggersService.postAccountCreation(created, automatic);

      return created;
    });
  }

  createTMAccount(
    userId: number,
    strategyId: number,
    mainCurrency: DefaultCurrenciesEnum,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const walletNumber = await this.walletNumberService.generateWalletId(tx);

      const created = await tx.account.create({
        data: {
          ownerId: userId,
          accountType: AccountTypeEnum.TM,
          extra: { strategyId },
          walletNumber: {
            create: {
              walletId: walletNumber,
            },
          },
          subAccounts: {
            createMany: {
              data: Object.values(DefaultCurrenciesEnum).map((currency) => {
                return {
                  currencyCode: currency,
                  isPrimary: currency === mainCurrency,
                };
              }),
            },
          },
        },
      });

      await this.createUserAccountSettings(tx, userId);

      this.accountsTriggersService.postTMAccountCreation(created);

      return created;
    });
  }

  async makeExternalDeposit(
    meta: UserMetadataParams,
    params: {
      receiptId?: number;
      accountId: number;
      amount: bigint;
      currency: DefaultCurrenciesEnum;
      comment?: string;
    },
  ) {
    const isAccountant = meta.role === RoleEnum.Accountant;

    await this.prisma.$transaction(async (tx) => {
      const ownerAccount = await this.getOwnerAccount(
        tx,
        params.accountId,
        isAccountant,
        meta.userId,
      );

      if (!ownerAccount) {
        throw new BadRequestException('Initiator account not found');
      }

      const subAccount = await this.findSubAccountOrThrow(
        tx,
        params.currency,
        ownerAccount.id,
        'Sub account not found',
      );

      await this.checkIfAccountsIsNotOverLimit({
        tx,
        extraAmount: params.amount,
        extraAmountCurrency: params.currency,
        ownerId: ownerAccount.ownerId,
      });

      const result = await tx.transaction.create({
        data: {
          branchId: meta.branchId,
          amount: params.amount,
          receiptId: params.receiptId,
          subAccountId: subAccount.id,
          operationStatus: isAccountant
            ? OperationStatusEnum.Completed
            : OperationStatusEnum.Pending,
          operationType: OperationTypeEnum.Deposit,
          operationSubType: OperationSubTypeEnum.ExternalDeposit,
          paymentMethodUsed: { type: 'bankAccount' }, // Default for now
          comment: params.comment,
        },
      });

      this.accountsTriggersService.postExternalDeposit(meta, params, {
        isAccountant,
      });

      if (isAccountant) {
        await this.confirmTransaction(
          meta,
          {
            isConfirmed: true,
            transactionId: result.id,
          },
          { tx },
        );
      }
    });

    return { ok: true };
  }

  async makeExternalWithdrawal(
    meta: UserMetadataParams,
    params: {
      accountId: number;
      currency: DefaultCurrenciesEnum;
      details: Details;
      amount: bigint;
      code: string;
      comment?: string;
    },
  ) {
    const isAccountant = meta.role === RoleEnum.Accountant;

    if (!isAccountant) {
      await this.confirmTransactionByCode(meta.userId, params.code);
    }

    await this.prisma.$transaction(async (tx) => {
      const ownerAccount = await this.getOwnerAccount(
        tx,
        params.accountId,
        isAccountant,
        meta.userId,
      );

      if (!ownerAccount) {
        throw new BadRequestException('Initiator account not found');
      }

      const subAccount = await this.findSubAccountOrThrow(
        tx,
        params.currency,
        ownerAccount.id,
        'Sub account not found',
      );

      await this.ensureEnoughBalance({
        tx,
        ownerId: isAccountant ? ownerAccount.ownerId : meta.userId,
        subAccountId: subAccount.id,
        amount: params.amount,
      });

      const result = await tx.transaction.create({
        data: {
          branchId: meta.branchId,
          amount: params.amount,
          subAccountId: subAccount.id,
          operationStatus: OperationStatusEnum.Pending,
          operationType: OperationTypeEnum.Withdrawal,
          operationSubType: OperationSubTypeEnum.ExternalWithdrawal,
          paymentMethodUsed: {
            type: 'bankAccount',
            details: JSON.stringify(params.details),
          }, // Default for now
          comment: params.comment,
        },
      });

      this.accountsTriggersService.postExternalWithdrawal(meta, params, {
        isAccountant,
      });

      if (isAccountant) {
        await this.confirmTransaction(
          meta,
          {
            isConfirmed: true,
            transactionId: result.id,
          },
          { tx },
        );
      }
    });

    return { ok: true };
  }

  async makeInvestTMTransfer(
    meta: UserMetadataParams,
    params: {
      strategyId: number;
      userId?: number;
      amount: bigint;
      currency: DefaultCurrenciesEnum;
      code: string;
      comment?: string;
    },
  ) {
    const isAccountant = meta.role === RoleEnum.Accountant;

    if (!isAccountant) {
      await this.confirmTransactionByCode(meta.userId, params.code);
    }

    await this.prisma.$transaction(async (tx) => {
      const ownerAccount = await tx.account.findFirst({
        where: {
          ownerId: isAccountant ? params.userId : meta.userId,
          accountType: AccountTypeEnum.Master,
        },
      });

      const subAccount = await this.findSubAccountOrThrow(
        tx,
        params.currency,
        ownerAccount.id,
        'Sub account not found',
      );

      const targetDataRaw = await tx.$queryRaw<
        {
          ownerId: number;
          subAccountId?: number;
        }[]
      >`
        SELECT account."ownerId" as "ownerId",
               sub_account.id as "subAccountId"
        FROM "Account" AS account
        LEFT JOIN "SubAccount" AS sub_account
               ON account.id = sub_account."accountId"
        WHERE account."accountType" = 'TM'
          AND (account."extra"->>'strategyId')::int = ${params.strategyId}
          AND sub_account."currencyCode" = ${subAccount.currencyCode}
        ORDER BY sub_account."id"
        LIMIT 1;
      `;

      if (!targetDataRaw?.[0]) {
        throw new BadRequestException('Target account not found');
      }

      if (!targetDataRaw[0]?.subAccountId) {
        throw new BadRequestException('Target sub account not found');
      }

      const targetData = targetDataRaw[0];

      await this.ensureEnoughBalance({
        tx,
        ownerId: isAccountant ? ownerAccount.ownerId : meta.userId,
        subAccountId: subAccount.id,
        amount: params.amount,
      });

      const [fromResult, toResult] = await this.createLinkedTransactions(tx, {
        branchId: meta.branchId,
        amount: params.amount,
        fromSubAccountId: subAccount.id,
        toSubAccountId: targetData.subAccountId,
        operationSubType: OperationSubTypeEnum.TransferToStrategy,
        isConfirmed: true,
        paymentMethodUsed: { type: 'internal' },
        comment: params.comment,
      });

      await this.scProductsTm.createTMTransaction({
        clientId: meta.userId,
        strategyId: params.strategyId,
        operationType: OperationTypeEnum.Deposit,
        operationStatus: OperationStatusEnum.Completed,
        branchId: meta.branchId,
        clientSubAccountId: subAccount.id,
        strategySubAccountId: targetData.subAccountId,
        originalTransactionIds: [fromResult.id, toResult.id],
      });

      this.accountsTriggersService.postInvestTMTransferOutgo(meta, params, {
        isAccountant,
      });

      this.accountsTriggersService.postInvestTMTransferIncome(meta, params, {
        isAccountant,
        trusteeId: targetData.ownerId,
      });
    });

    return { ok: true };
  }

  async makeWithdrawTMTransfer(
    meta: UserMetadataParams,
    params: {
      investmentId: number;
      sharesAmount: number;
      userId?: number;
      code: string;
    },
  ) {
    const isAccountant = meta.role === RoleEnum.Accountant;

    if (!isAccountant) {
      await this.confirmTransactionByCode(meta.userId, params.code);
    }

    const investment = await this.scProductsTm.getInvestmentById({
      id: params.investmentId,
    });

    if (investment.totalShares < params.sharesAmount) {
      throw new BadRequestException('Total shares amount lower than requested');
    }

    await this.prisma.$transaction(async (tx) => {
      const ownerAccount = await tx.account.findFirst({
        where: {
          ownerId: isAccountant ? params.userId : meta.userId,
          accountType: AccountTypeEnum.Master,
        },
      });

      const subAccount = await this.findSubAccountOrThrow(
        tx,
        investment.baseCurrency,
        ownerAccount.id,
        'Sub account not found',
      );

      const strategyAccountRaw = await tx.$queryRaw<
        {
          ownerId: number;
          subAccountId?: number;
        }[]
      >`
        SELECT account."ownerId" as "ownerId",
               sub_account.id as "subAccountId"
        FROM "Account" AS account
        LEFT JOIN "SubAccount" AS sub_account
               ON account.id = sub_account."accountId"
        WHERE account."accountType" = 'TM'
          AND (account."extra"->>'strategyId')::int = ${investment.strategyId}
          AND sub_account."currencyCode" = ${subAccount.currencyCode}
        ORDER BY sub_account."id"
        LIMIT 1;
      `;

      if (!strategyAccountRaw?.[0]) {
        throw new BadRequestException('Strategy account not found');
      }

      if (!strategyAccountRaw[0]?.subAccountId) {
        throw new BadRequestException('Strategy sub account not found');
      }

      const strategyAccount = strategyAccountRaw[0];

      // @TODO: how we change TM strategy account amount?
      // await this.ensureEnoughBalance({
      //   tx,
      //   ownerId: strategyAccount.ownerId,
      //   subAccountId: subAccount.id,
      //   amount: params.amount,
      // });

      const amount = BigInt(params.sharesAmount) * BigInt(investment.shareCost);

      const [fromResult, toResult] = await this.createLinkedTransactions(tx, {
        branchId: meta.branchId,
        amount,
        fromSubAccountId: strategyAccount.subAccountId,
        toSubAccountId: subAccount.id,
        operationSubType: OperationSubTypeEnum.TransferFromStrategy,
        isConfirmed: true,
        paymentMethodUsed: { type: 'internal' },
      });

      await this.scProductsTm.createTMTransaction({
        clientId: meta.userId,
        strategyId: investment.strategyId,
        operationType: OperationTypeEnum.Withdrawal,
        operationStatus: OperationStatusEnum.Completed,
        sharesProcessed: params.sharesAmount,
        branchId: meta.branchId,
        clientSubAccountId: subAccount.id,
        strategySubAccountId: strategyAccount.subAccountId,
        originalTransactionIds: [fromResult.id, toResult.id],
      });

      this.accountsTriggersService.postInvestTMTransferOutgo(meta, params, {
        isAccountant,
      });

      this.accountsTriggersService.postInvestTMTransferIncome(meta, params, {
        isAccountant,
        trusteeId: strategyAccount.ownerId,
      });
    });

    return { ok: true };
  }

  createServiceTransaction(params: CreateServiceTransactionRequestDto) {
    return this.prisma.$transaction((tx) => {
      return this.createLinkedTransactions(tx, {
        branchId: params.branchId,
        amount: params.amount,
        operationSubType: OperationSubTypeEnum.ServiceInternalTransfer,
        isConfirmed: true,
        toSubAccountId: params.clientSubAccountId,
        fromSubAccountId: params.strategySubAccountId,
        comment: 'Refund of unused amount due to fractional shares.',
        paymentMethodUsed: {
          strategyId: params.strategyId,
          type: 'internal',
          originalTransactionIds: params.originalTransactionIds,
        },
      });
    });
  }

  async getOwnerSubAccount(
    tx: Prisma.TransactionClient,
    subAccountId: number,
    isAccountant: boolean,
    userId: number,
  ) {
    return tx.subAccount.findFirst({
      where: {
        id: subAccountId,
        account: isAccountant ? undefined : { ownerId: userId },
      },
      include: {
        account: isAccountant ? { select: { ownerId: true } } : undefined,
      },
    });
  }

  async findAccountOrThrow(
    tx: PrismaTransactionalClient,
    accountId: number | string,
    errorMessage: string,
  ) {
    if (typeof accountId === 'string') {
      const account = await tx.account.findFirst({
        where: {
          walletNumber: {
            walletId: accountId,
          },
        },
      });

      if (!account) {
        throw new BadRequestException(errorMessage);
      }

      return account;
    }

    if (typeof accountId === 'number') {
      const account = await tx.account.findFirst({
        where: {
          id: accountId,
        },
      });

      if (!account) {
        throw new BadRequestException(errorMessage);
      }

      return account;
    }
  }

  async findSubAccountOrThrow(
    tx: PrismaTransactionalClient,
    currencyCode: string,
    accountId: number,
    errorMessage: string,
  ) {
    const subAccount = await tx.subAccount.findFirst({
      where: {
        currencyCode: currencyCode,
        accountId: accountId,
      },
    });

    if (!subAccount) {
      throw new BadRequestException(errorMessage);
    }

    return subAccount;
  }

  async getOwnerAccount(
    tx: Prisma.TransactionClient,
    accountId: number,
    isAccountant: boolean,
    userId: number,
  ) {
    return tx.account.findFirst({
      where: {
        id: accountId,
        ownerId: isAccountant ? undefined : userId,
      },
    });
  }

  async createLinkedTransactions(
    tx: PrismaTransactionalClient,
    params: {
      branchId: number;
      fromSubAccountId: number;
      toSubAccountId: number;
      amount: bigint;
      operationSubType: OperationSubTypeEnum;
      comment?: string;
      isConfirmed?: boolean;
      resultingAmount?: bigint;
      paymentMethodUsed: Record<string, any>;
    },
  ) {
    const fromResult = await tx.transaction.create({
      data: {
        branchId: params.branchId,
        amount: params.amount,
        subAccountId: params.fromSubAccountId,
        operationStatus: params.isConfirmed
          ? OperationStatusEnum.Completed
          : OperationStatusEnum.Pending,
        operationType: OperationTypeEnum.Withdrawal,
        operationSubType: params.operationSubType,
        isConfirmed: Boolean(params.isConfirmed),
        transferTo: params.toSubAccountId,
        paymentMethodUsed: params.paymentMethodUsed,
        comment: params.comment,
      },
    });

    const toResult = await tx.transaction.create({
      data: {
        branchId: params.branchId,
        amount: params.resultingAmount || params.amount,
        subAccountId: params.toSubAccountId,
        operationStatus: params.isConfirmed
          ? OperationStatusEnum.Completed
          : OperationStatusEnum.Pending,
        operationType: OperationTypeEnum.Deposit,
        operationSubType: params.operationSubType,
        isConfirmed: Boolean(params.isConfirmed),
        transferFrom: params.fromSubAccountId,
        paymentMethodUsed: params.paymentMethodUsed,
        comment: params.comment,
      },
    });

    await this.linkTransactions(tx, fromResult.id, toResult.id);

    return [fromResult, toResult];
  }

  async linkTransactions(
    tx: Prisma.TransactionClient,
    fromTransactionId: number,
    toTransactionId: number,
  ) {
    await tx.transaction.update({
      where: { id: toTransactionId },
      data: { pairedTransactionId: fromTransactionId },
    });

    await tx.transaction.update({
      where: { id: fromTransactionId },
      data: { pairedTransactionId: toTransactionId },
    });
  }

  async makeP2PTransfer(
    meta: UserMetadataParams,
    params: {
      fromAccountId: number;
      targetAccountId: string;
      currency: DefaultCurrenciesEnum;
      amount: bigint;
      code: string;
      comment?: string;
    },
  ) {
    const isAccountant = meta.role === RoleEnum.Accountant;

    if (!isAccountant) {
      await this.confirmTransactionByCode(meta.userId, params.code);
    }

    await this.prisma.$transaction(async (tx) => {
      const ownerAccount = await this.getOwnerAccount(
        tx,
        params.fromAccountId,
        isAccountant,
        meta.userId,
      );

      if (!ownerAccount) {
        throw new BadRequestException('Initiator account not found');
      }

      const ownerSubAccount = await this.findSubAccountOrThrow(
        tx,
        params.currency,
        ownerAccount.id,
        'Target sub account not found',
      );

      const targetAccount = await this.findAccountOrThrow(
        tx,
        params.targetAccountId,
        'Target account not found',
      );

      const targetSubAccount = await this.findSubAccountOrThrow(
        tx,
        params.currency,
        targetAccount.id,
        'Target sub account not found',
      );

      if (ownerAccount.ownerId === targetAccount.ownerId) {
        throw new BadRequestException('Can not send to yourself');
      }

      await this.ensureEnoughBalance({
        tx,
        ownerId: isAccountant ? ownerAccount.ownerId : meta.userId,
        subAccountId: ownerSubAccount.id,
        amount: params.amount,
      });

      await this.createLinkedTransactions(tx, {
        branchId: meta.branchId,
        amount: params.amount,
        fromSubAccountId: ownerSubAccount.id,
        toSubAccountId: targetSubAccount.id,
        operationSubType: OperationSubTypeEnum.PeerToPeerTransfer,
        isConfirmed: true,
        paymentMethodUsed: { type: 'p2p' },
        comment: params.comment,
      });

      this.accountsTriggersService.postP2PTransferOutgo(meta, params, {
        isAccountant,
      });

      this.accountsTriggersService.postP2PTransferIncome(
        meta,
        { ...params, targetUserId: targetAccount.ownerId },
        {
          isAccountant,
        },
      );
    });

    return { ok: true };
  }

  async makeInternalChange(
    meta: UserMetadataParams,
    params: {
      fromAccountId: number;
      fromCurrency: DefaultCurrenciesEnum;
      toCurrency: DefaultCurrenciesEnum;
      amount: bigint;
      code: string;
      comment?: string;
    },
  ) {
    if (params.fromCurrency === params.toCurrency) {
      throw new BadRequestException('Can not change to same currency');
    }

    const isAccountant = meta.role === RoleEnum.Accountant;

    if (!isAccountant) {
      await this.confirmTransactionByCode(meta.userId, params.code);
    }

    const rates = await this.ratesService.getMostActualRates();

    await this.prisma.$transaction(async (tx) => {
      const ownerAccount = await this.getOwnerAccount(
        tx,
        params.fromAccountId,
        isAccountant,
        meta.userId,
      );

      if (!ownerAccount) {
        throw new BadRequestException('Initiator account not found');
      }

      const ownerSubAccount = await this.findSubAccountOrThrow(
        tx,
        params.fromCurrency,
        ownerAccount.id,
        'Owner sub account not found',
      );

      if (!ownerSubAccount) {
        throw new BadRequestException('Owner sub account not found');
      }

      const targetSubAccount = await this.findSubAccountOrThrow(
        tx,
        params.toCurrency,
        ownerAccount.id,
        'Target sub account not found',
      );

      if (!targetSubAccount) {
        throw new BadRequestException('Target sub account not found');
      }

      if (ownerSubAccount.id === targetSubAccount.id) {
        throw new BadRequestException(
          'Can not change between same sub accounts',
        );
      }

      await this.ensureEnoughBalance({
        tx,
        ownerId: isAccountant ? ownerAccount.ownerId : meta.userId,
        subAccountId: ownerSubAccount.id,
        amount: params.amount,
      });

      const resultingAmount = params.amount
        ? this.convertCurrency(
            rates,
            params.amount,
            params.fromCurrency,
            params.toCurrency,
          )
        : BigInt(0);

      const [fromResult, toResult] = await this.createLinkedTransactions(tx, {
        branchId: meta.branchId,
        amount: params.amount,
        fromSubAccountId: ownerSubAccount.id,
        toSubAccountId: targetSubAccount.id,
        operationSubType: OperationSubTypeEnum.InternalChange,
        isConfirmed: false,
        paymentMethodUsed: { type: 'internal change' },
        comment: params.comment,
        resultingAmount,
      });

      this.accountsTriggersService.postInternalChangeOutgo(meta, params, {
        isAccountant,
      });

      this.accountsTriggersService.postInternalChangeIncome(meta, params, {
        isAccountant,
      });

      if (isAccountant) {
        await this.confirmTransaction(
          meta,
          {
            isConfirmed: true,
            transactionId: fromResult.id,
            amount: fromResult.amount,
          },
          { tx },
        );

        await this.confirmTransaction(
          meta,
          {
            isConfirmed: true,
            transactionId: toResult.id,
          },
          { tx },
        );
      }
    });

    return { ok: true };
  }

  async makeInternalTransfer(
    meta: UserMetadataParams,
    params: {
      fromAccountId: number;
      targetAccountId: number;
      currency: DefaultCurrenciesEnum;
      amount: bigint;
      code: string;
      comment?: string;
    },
  ) {
    const isAccountant = meta.role === RoleEnum.Accountant;

    if (!isAccountant) {
      await this.confirmTransactionByCode(meta.userId, params.code);
    }

    await this.prisma.$transaction(async (tx) => {
      const ownerAccount = await this.getOwnerAccount(
        tx,
        params.fromAccountId,
        isAccountant,
        meta.userId,
      );

      if (!ownerAccount) {
        throw new BadRequestException('Initiator account not found');
      }

      const ownerSubAccount = await this.findSubAccountOrThrow(
        tx,
        params.currency,
        ownerAccount.id,
        'Target sub account not found',
      );

      const targetAccount = await this.findAccountOrThrow(
        tx,
        params.targetAccountId,
        'Target account not found',
      );

      const targetSubAccount = await this.findSubAccountOrThrow(
        tx,
        params.currency,
        targetAccount.id,
        'Target sub account not found',
      );

      if (ownerAccount.ownerId !== targetAccount.ownerId) {
        throw new BadRequestException('Can not send not to yourself');
      }

      await this.ensureEnoughBalance({
        tx,
        ownerId: isAccountant ? ownerAccount.ownerId : meta.userId,
        subAccountId: ownerSubAccount.id,
        amount: params.amount,
      });

      await this.createLinkedTransactions(tx, {
        branchId: meta.branchId,
        amount: params.amount,
        fromSubAccountId: ownerSubAccount.id,
        toSubAccountId: targetSubAccount.id,
        operationSubType: OperationSubTypeEnum.InternalTransfer,
        isConfirmed: true,
        paymentMethodUsed: { type: 'internal' },
        comment: params.comment,
      });

      this.accountsTriggersService.postInternalTransferOutgo(meta, params, {
        isAccountant,
      });

      this.accountsTriggersService.postInternalTransferIncome(meta, params, {
        isAccountant,
      });
    });

    return { ok: true };
  }

  async confirmTransactionByCode(userId: number, code: string) {
    const credentials = await this.findCredentials(userId);

    if (credentials?.email) {
      const isConfirmed = await this.confirmCodeFromEmail(
        credentials.email,
        userId,
        code || '',
        'CONFIRM_TRANSACTION',
      );

      if (!isConfirmed) {
        throw new BadRequestException(
          'Can not confirm transaction. Code not found',
        );
      }
    }
  }

  async confirmTransaction(
    meta: UserMetadataParams,
    params: {
      transactionId: number;
      isConfirmed: boolean;
      amount?: bigint;
    },
    extra?: { tx?: PrismaTransactionalClient },
  ) {
    const transaction = extra?.tx
      ? (cb: (tx: PrismaTransactionalClient) => Promise<any>) => cb(extra.tx)
      : (cb: (tx: PrismaTransactionalClient) => Promise<any>) =>
          this.prisma.$transaction((tx) => cb(tx));

    await transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: {
          id: params.transactionId,
          // Can confirm or decline every transaction
          // confirmationDate: null,
          // isConfirmed: false,
          // operationStatus: OperationStatusEnum.Pending,
          branchId: meta.branchId,
        },
        include: {
          subAccount: {
            include: {
              account: {
                select: {
                  ownerId: true,
                },
              },
            },
          },
        },
      });

      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }

      const ownerId = transaction.subAccount.account.ownerId;

      await tx.transaction.update({
        where: {
          id: params.transactionId,
          branchId: meta.branchId,
        },
        data: {
          amount: params.amount,
          confirmationDate: new Date(),
          confirmedBy: meta.userId,
          isConfirmed: true,
          operationStatus: params.isConfirmed
            ? OperationStatusEnum.Completed
            : OperationStatusEnum.Failed,
        },
      });

      this.accountsTriggersService.postConfirmTransaction(
        meta,
        {
          ...params,
          ownerId,
        },
        {
          amountChanged:
            params.amount && params.amount !== transaction.amount
              ? `${transaction.amount} => ${params.amount}`
              : undefined,
        },
      );
    });

    return { ok: true };
  }

  async getUnconfirmedTransactionsInBranch(meta: UserMetadataParams) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        confirmationDate: null,
        operationStatus: OperationStatusEnum.Pending,
        branchId: meta.branchId,
      },
      include: {
        subAccount: {
          include: {
            account: {
              include: {
                walletNumber: true,
              },
            },
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
        { branchId: 'asc' },
        {
          subAccount: {
            account: {
              ownerId: 'asc',
            },
          },
        },
      ],
    });

    if (!transactions.length) {
      return { transactions: [] };
    }

    const documentIds = transactions.map((t) => t.receiptId);

    const documentUrls = documentIds.length
      ? await this.getFilesUrls(documentIds)
      : [];

    const normalizeFiles = R.pipe(
      R.map<(typeof documentUrls)[0], [string, (typeof documentUrls)[0]]>(
        (a) => [a.id, a],
      ),
      R.fromPairs,
    );

    const normalizedFiles = normalizeFiles(documentUrls);

    return {
      transactions: transactions.map((t) => ({
        ...t,
        receiptUrl:
          t.receiptId && normalizedFiles[t.receiptId]
            ? normalizedFiles[t.receiptId].url
            : null,
      })),
    };
  }

  async ensureEnoughBalance({
    amount,
    ...params
  }: {
    tx: PrismaTransactionalClient;
    ownerId: number;
    amount: bigint;
    subAccountId: number;
  }) {
    const balance = await this.getSubAccountBalance(params);

    if (amount > balance) {
      throw new BadRequestException(
        'Amount must be lower or equal than balance',
      );
    }
  }

  async getSubAccountBalance(params: {
    ownerId: number;
    subAccountId: number;
    tx?: PrismaTransactionalClient;
  }): Promise<bigint> {
    const transaction = params.tx
      ? (cb: (tx: PrismaTransactionalClient) => Promise<number>) =>
          cb(params.tx)
      : (cb: (tx: PrismaTransactionalClient) => Promise<number>) =>
          this.prisma.$transaction((tx) => cb(tx));

    const result = await transaction((tx) => {
      return tx.$queryRaw<number>`
        SELECT
          SUM(
            CASE
              WHEN "operationType" = 'Deposit' AND "operationStatus" = 'Completed' THEN "amount"
              WHEN "operationType" = 'Withdrawal' AND "operationStatus" = 'Completed' THEN -"amount"
              ELSE 0
            END
          ) AS balance
        FROM "Transaction" "transaction"
        LEFT JOIN "SubAccount" "subAccount" ON "transaction"."subAccountId" = "subAccount"."id"
        LEFT JOIN "Account" "account" ON "account"."id" = "subAccount"."accountId"
        WHERE "account"."ownerId" = ${params.ownerId} AND "subAccount"."id" = ${params.subAccountId}
        GROUP BY "transaction"."subAccountId";
      `;
    });

    return result?.[0]?.balance || BigInt(0);
  }

  async getBalance(params: {
    ownerId: number;
    tx?: PrismaTransactionalClient;
  }): Promise<{ currencyCode: string; balance: number }[]> {
    const transaction = params.tx
      ? (cb: (tx: PrismaTransactionalClient) => Promise<any>) => cb(params.tx)
      : (cb: (tx: PrismaTransactionalClient) => Promise<any>) =>
          this.prisma.$transaction(cb);

    return transaction((tx) => {
      return tx.$queryRaw<{ currency: string; balance: bigint }[]>`
        WITH currencies AS (
          SELECT DISTINCT "currencyCode"
          FROM "SubAccount"
        ),
        balances AS (
          SELECT
            "subAccount"."currencyCode",
            SUM(
              CASE
                WHEN "transaction"."operationType" = 'Deposit' AND "transaction"."operationStatus" = 'Completed' THEN "transaction"."amount"
                WHEN "transaction"."operationType" = 'Withdrawal' AND "transaction"."operationStatus" = 'Completed' THEN -"transaction"."amount"
                ELSE 0
              END
            ) AS balance
          FROM "Transaction" "transaction"
          LEFT JOIN "SubAccount" "subAccount" ON "transaction"."subAccountId" = "subAccount"."id"
          LEFT JOIN "Account" "account" ON "account"."id" = "subAccount"."accountId"
          WHERE "account"."ownerId" = ${params.ownerId}
          GROUP BY "subAccount"."currencyCode"
        )
        SELECT
          c."currencyCode",
          COALESCE(b."balance", 0) AS "balance"
        FROM currencies c
        LEFT JOIN balances b ON c."currencyCode" = b."currencyCode";
      `;
    });
  }

  async checkIfAccountsIsNotOverLimit(params: {
    tx?: PrismaTransactionalClient;
    ownerId: number;
    extraAmount?: bigint;
    extraAmountCurrency?: DefaultCurrenciesEnum;
  }) {
    const transaction = params.tx
      ? (cb: (tx: PrismaTransactionalClient) => Promise<any>) => cb(params.tx)
      : (cb: (tx: PrismaTransactionalClient) => Promise<any>) =>
          this.prisma.$transaction(cb);

    const rates = await this.ratesService.getMostActualRates();

    await transaction(async (tx) => {
      const balances = await this.getBalance({ ...params, tx });
      const settings = await tx.userAccountSettings.findFirst({
        where: { userId: params.ownerId },
      });

      const res = this.convertAllBalancesToUsd(balances, rates);

      const extraAmount =
        params.extraAmount && params.extraAmountCurrency
          ? this.convertToUsd(
              rates,
              params.extraAmount,
              params.extraAmountCurrency,
            )
          : BigInt(0);

      if (res + extraAmount >= settings.limitInUsd) {
        throw new BadRequestException(
          `Over limits: $${settings.limitInUsd / BigInt(100)}`,
        );
      }
    });
  }

  convertCurrency(
    rates: Record<string, Rate>,
    amount: bigint,
    fromCurrency: DefaultCurrenciesEnum,
    toCurrency: DefaultCurrenciesEnum,
  ): bigint {
    const inUsd = this.convertToUsd(rates, amount, fromCurrency);
    return this.convertFromUsd(rates, inUsd, toCurrency);
  }

  convertFromUsd(
    rates: Record<string, Rate>,
    amount: bigint,
    targetCurrency: DefaultCurrenciesEnum,
  ): bigint {
    const rate = rates[targetCurrency];

    if (!rate) {
      throw new BadRequestException(
        `Missing or invalid rate for currency: ${targetCurrency}`,
      );
    }

    const rateValueDecimal = new Decimal(rate.value);
    const targetAmountDecimal = new Decimal(amount.toString()).times(
      rateValueDecimal,
    );

    const totalTargetRounded = targetAmountDecimal.toDecimalPlaces(
      0,
      Decimal.ROUND_HALF_UP,
    );

    return BigInt(totalTargetRounded.toString());
  }

  convertToUsd(
    rates: Record<string, Rate>,
    amount: bigint,
    currency: DefaultCurrenciesEnum,
  ): bigint {
    const rate = rates[currency];

    if (!rate) {
      throw new BadRequestException(
        `Missing or invalid rate for currency: ${currency}`,
      );
    }

    const rateValueDecimal = new Decimal(rate.value);
    const usdAmountDecimal = new Decimal(amount.toString()).div(
      rateValueDecimal,
    );

    const totalUsdRounded = usdAmountDecimal.toDecimalPlaces(
      0,
      Decimal.ROUND_HALF_UP,
    );

    return BigInt(totalUsdRounded.toString());
  }

  convertAllBalancesToUsd = (
    balances: readonly { currencyCode: string; balance: number }[],
    rates: Record<string, Rate>,
  ): bigint => {
    const totalUsdDecimal = balances.reduce((totalUsdBalance, balance) => {
      const { currencyCode, balance: amount } = balance;

      if (currencyCode === DefaultCurrenciesEnum.USD) {
        return totalUsdBalance.plus(new Decimal(amount));
      }

      const rate = rates[currencyCode];
      if (!rate) {
        throw new BadRequestException(
          `Missing or invalid rate for currency: ${currencyCode}`,
        );
      }

      const rateValueDecimal = new Decimal(rate.value);

      const usdAmountDecimal = new Decimal(amount).div(rateValueDecimal);
      return totalUsdBalance.plus(usdAmountDecimal);
    }, new Decimal(0));

    const totalUsdRounded = totalUsdDecimal.toDecimalPlaces(
      0,
      Decimal.ROUND_HALF_UP,
    );

    return BigInt(totalUsdRounded.toString());
  };

  async getAllSubAccountsBalances(params: {
    ownerId: number;
    tx?: PrismaTransactionalClient;
  }) {
    type Ret = { balance: bigint; subAccountId: number }[];

    const transaction = params.tx
      ? (cb: (tx: PrismaTransactionalClient) => Promise<Ret>) => cb(params.tx)
      : (cb: (tx: PrismaTransactionalClient) => Promise<Ret>) =>
          this.prisma.$transaction((tx) => cb(tx));

    return transaction((tx) => {
      return tx.$queryRaw<Ret>`
        SELECT
          SUM(
            CASE
              WHEN "operationType" = 'Deposit' AND "operationStatus" = 'Completed' THEN "amount"
              WHEN "operationType" = 'Withdrawal' AND "operationStatus" = 'Completed' THEN -"amount"
              ELSE 0
            END
          ) AS balance,
          "subAccountId"
        FROM "Transaction" "transaction"
        LEFT JOIN "SubAccount" "subAccount" ON "transaction"."subAccountId" = "subAccount"."id"
        LEFT JOIN "Account" "account" ON "account"."id" = "subAccount"."accountId"
        WHERE "account"."ownerId" = ${params.ownerId}
        GROUP BY "transaction"."subAccountId";
      `;
    });
  }

  async getAllSubAccountsBalancesByAccountId(params: {
    ownerId: number;
    accountId: number;
    tx?: PrismaTransactionalClient;
  }) {
    type Ret = { balance: bigint; subAccountId: number }[];

    const transaction = params.tx
      ? (cb: (tx: PrismaTransactionalClient) => Promise<Ret>) => cb(params.tx)
      : (cb: (tx: PrismaTransactionalClient) => Promise<Ret>) =>
          this.prisma.$transaction((tx) => cb(tx));

    return transaction((tx) => {
      return tx.$queryRaw<Ret>`
        SELECT
          SUM(
            CASE
              WHEN "operationType" = 'Deposit' AND "operationStatus" = 'Completed' THEN "amount"
              WHEN "operationType" = 'Withdrawal' AND "operationStatus" = 'Completed' THEN -"amount"
              ELSE 0
            END
          ) AS balance,
          "subAccountId"
        FROM "Transaction" "transaction"
        LEFT JOIN "SubAccount" "subAccount" ON "transaction"."subAccountId" = "subAccount"."id"
        LEFT JOIN "Account" "account" ON "account"."id" = "subAccount"."accountId"
        WHERE "account"."ownerId" = ${params.ownerId} AND "account"."id" = ${params.accountId}
        GROUP BY "transaction"."subAccountId";
      `;
    });
  }

  getMyAccounts(
    meta: UserMetadataParams,
    params: {
      skip: number;
      take: number;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const accounts = await tx.account.findMany({
        skip: params.skip,
        take: params.take,
        where: { ownerId: meta.userId },
        include: {
          walletNumber: true,
          subAccounts: true,
        },
        orderBy: { accountType: 'asc' },
      });

      const accountsCount = await tx.account.count({
        where: { ownerId: meta.userId },
      });

      if (!accounts.length) {
        return {
          list: [],
          count: 0,
          take: params.take,
          skip: params.skip,
          pageIndex: 0,
        };
      }

      const balances = await this.getAllSubAccountsBalances({
        ownerId: meta.userId,
        tx,
      });

      const pageIndex = Math.floor(params.skip / params.take);

      const list = accounts.map((account) => ({
        ...account,
        subAccounts: account?.subAccounts?.map((subAccount) => ({
          ...subAccount,
          balance:
            balances.find((b) => b.subAccountId === subAccount.id)?.balance ||
            BigInt(0),
        })),
      }));

      return {
        list,
        count: accountsCount,
        take: params.take,
        skip: params.skip,
        pageIndex,
      };
    });
  }

  getMyAccountById(meta: UserMetadataParams, accountId: number | string) {
    return this.prisma.$transaction(async (tx) => {
      const condition =
        typeof accountId === 'string'
          ? {
              walletNumber: { walletId: accountId },
            }
          : { id: accountId };

      const account = await tx.account.findFirst({
        where: { ownerId: meta.userId, ...condition },
        include: {
          subAccounts: true,
          walletNumber: true,
        },
      });

      if (!account) {
        throw new BadRequestException('Account not found');
      }

      const balances = await this.getAllSubAccountsBalancesByAccountId({
        ownerId: meta.userId,
        accountId: account.id,
        tx,
      });

      const res = {
        ...account,
        subAccounts: account?.subAccounts?.map((subAccount) => ({
          ...subAccount,
          balance:
            balances.find((b) => b.subAccountId === subAccount.id)?.balance ||
            BigInt(0),
        })),
      };

      return {
        account: res,
      };
    });
  }

  async getClientAccounts(clientId: number) {
    const accounts = await this.prisma.$transaction(async (tx) => {
      const accounts = await tx.account.findMany({
        where: { ownerId: clientId },
        include: {
          walletNumber: true,
          subAccounts: true,
        },
      });

      if (!accounts.length) {
        return [];
      }

      const balances = await this.getAllSubAccountsBalances({
        ownerId: clientId,
        tx,
      });

      return accounts.map((account) => ({
        ...account,
        subAccounts: account?.subAccounts?.map((subAccount) => ({
          ...subAccount,
          balance:
            balances.find((b) => b.subAccountId === subAccount.id)?.balance ||
            BigInt(0),
        })),
      }));
    });

    return { accounts };
  }

  async getTransactions(
    meta: UserMetadataParams,
    params: { subAccountId: number },
  ) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        branchId: meta.branchId,
        subAccountId: params.subAccountId,
        subAccount: { account: { ownerId: meta.userId } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { transactions };
  }

  async getRecentTransactions(
    meta: UserMetadataParams,
    {
      skip,
      take,
      accountId,
    }: { skip: number; take: number; accountId?: number | null },
  ) {
    const where: Prisma.TransactionWhereInput = {
      branchId: meta.branchId,
      subAccount: {
        account: { ownerId: meta.userId, id: accountId || undefined },
      },
    };

    const [list, count] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        include: {
          subAccount: {
            select: {
              id: true,
              currencyCode: true,
              account: {
                select: {
                  id: true,
                  accountType: true,
                  walletNumber: {
                    select: {
                      walletId: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const pageIndex = Math.floor(skip / take);

    return {
      list: list,
      count: count,
      take: take,
      skip: skip,
      pageIndex,
    };
  }

  async getClientTransactions(params: {
    clientId: number;
    subAccountId: number;
  }) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        subAccountId: params.subAccountId,
        subAccount: { account: { ownerId: params.clientId } },
      },
      include: {
        subAccount: {
          include: {
            account: {
              include: {
                walletNumber: true,
              },
            },
          },
        },
      },
    });

    return { transactions };
  }

  getStrategyAmounts(
    clientId: number,
    strategyIds: number[],
    transactionIds: number[],
  ): Promise<
    {
      strategyId: number;
      amount: bigint;
      transactionId: number;
    }[]
  > {
    return this.prisma.$queryRaw<
      { strategyId: number; amount: bigint; transactionId: number }[]
    >(Prisma.sql`
      SELECT 
       CAST(trusteeAccount."extra"->>'strategyId' AS INTEGER) AS "strategyId",
        CASE 
          WHEN transaction."operationType" = 'Withdrawal' 
            AND transaction."operationSubType" = 'ServiceInternalTransfer' 
          THEN -transaction."amount"
          ELSE transaction."amount"
      	end,
        transaction.id as "transactionId"
      FROM 
          "Transaction" transaction
      JOIN 
          "SubAccount" trusteeSubAccount ON transaction."subAccountId" = trusteeSubAccount."id"
      JOIN 
          "Account" trusteeAccount ON trusteeSubAccount."accountId" = trusteeAccount."id"
     
      WHERE 
          trusteeAccount."accountType" = 'TM'
          AND (transaction."operationSubType" = 'TransferToStrategy' OR transaction."operationSubType" = 'ServiceInternalTransfer')
          AND (transaction."operationType" = 'Deposit' OR transaction."operationType" = 'Withdrawal')
          AND transaction."operationStatus" = 'Completed'
          AND transaction."isConfirmed" = TRUE
          AND (trusteeAccount."extra"->>'strategyId')::int IN (${Prisma.join(strategyIds)})
          AND transaction."id" IN (${Prisma.join(transactionIds)})
      GROUP BY 
        trusteeAccount."extra"->>'strategyId', transaction.amount, transaction.id
    `);
  }

  getFilesUrls(fileIds: number[]) {
    return firstValueFrom(
      this.filesServiceClient
        .send<
          {
            url: number;
            id: string;
          }[]
        >({ cmd: 'get_files_urls' }, { fileIds })
        .pipe(timeout(5000)),
    );
  }

  async confirmCodeFromEmail(
    email: string,
    userId: number,
    code: string,
    type: string,
  ): Promise<boolean> {
    return firstValueFrom(
      this.alertServiceClient
        .send<boolean>(
          { cmd: 'verify_otp_by_email' },
          { email, code, type, userId },
        )
        .pipe(timeout(5000)),
    );
  }

  async findCredentials(
    userId: number,
  ): Promise<{ email: string; phone: string }> {
    return firstValueFrom(
      this.coreServiceClient
        .send<{
          email: string;
          phone: string;
        }>({ cmd: 'find_credentials' }, { userId })
        .pipe(timeout(5000)),
    );
  }

  async createUserAccountSettings(
    tx: PrismaTransactionalClient,
    userId: number,
  ) {
    const existingSettings = await tx.userAccountSettings.findFirst({
      where: { userId },
    });

    if (existingSettings) {
      return existingSettings;
    }

    return tx.userAccountSettings.create({
      data: { userId, accountOperationsBlocked: false },
    });
  }

  updateUserAccountSettings(userId: number, dto: UpdateUserAccountSettingsDto) {
    return this.prisma.$transaction(async (tx) => {
      let settings = await tx.userAccountSettings.findFirst({
        where: { userId },
      });

      if (!settings) {
        settings = await this.createUserAccountSettings(tx, userId);
      }

      return tx.userAccountSettings.update({
        where: { id: settings.id },
        data: dto,
      });
    });
  }

  getUserAccountSettings(userId: number) {
    return this.prisma.$transaction(async (tx) => {
      const settings = await tx.userAccountSettings.findFirst({
        where: { userId },
      });

      if (!settings) {
        return this.createUserAccountSettings(tx, userId);
      }

      return settings;
    });
  }

  async throwErrorIfAccountBlocked(userId: number) {
    const settings = await this.prisma.userAccountSettings.findFirst({
      where: { userId, accountOperationsBlocked: true },
    });

    if (settings && settings.accountOperationsBlocked) {
      throw new BadRequestException('Account is blocked');
    }

    return {};
  }
}
