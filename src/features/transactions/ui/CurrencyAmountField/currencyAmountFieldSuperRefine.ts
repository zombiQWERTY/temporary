import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { GetMyAccountsApi } from '@/entities/Accounts';
import { amountTransformer } from '@/shared/lib';

interface CurrencyAmountFieldSuperRefineProps {
  accounts: GetMyAccountsApi.GetMyAccountsDtoSchema | undefined;
  t: ReturnType<typeof useTranslations>;
  context: z.RefinementCtx;
  values: {
    amount: number;
    fromAccountId: number;
    currency: string;
  };
}

export const currencyAmountFieldSuperRefine = ({
  accounts,
  t,
  context,
  values,
}: CurrencyAmountFieldSuperRefineProps) => {
  const { amount, currency, fromAccountId } = values;

  if (!amount || !currency || !fromAccountId || !accounts?.list?.length) {
    return z.NEVER;
  }

  const account = accounts.list.find((a) => a.id === fromAccountId);

  if (!account) {
    return z.NEVER;
  }

  const subAccount = account.subAccounts.find(
    (subAcc) => subAcc.currencyCode === currency,
  );

  if (!subAccount) {
    return z.NEVER;
  }

  const subAccountBalance = amountTransformer.fromCents(
    subAccount.balance || BigInt(0),
  );

  if (amount > subAccountBalance) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('less_or_equal'),
      path: ['amount'],
    });
  }
};
