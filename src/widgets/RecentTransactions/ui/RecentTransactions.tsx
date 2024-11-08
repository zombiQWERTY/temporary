'use client';
import { Link, Paper, Stack, Typography } from '@mui/material';
import { format, isToday, isYesterday, parse } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import {
  GetRecentTransactionsApi,
  useMyTransactions,
} from '@/entities/Transactions';
import { AccountRoutes } from '@/shared/router';
import { ChevronRightIcon } from '@/shared/ui';
import { EmptyTransactions } from './EmptyTransactions';
import { TransactionItem } from './TransactionItem';

interface RecentTransactionsProps {
  initialRecentTransactionsData: GetRecentTransactionsApi.GetRecentTransactionsDtoSchema | null;
  accountId?: number;
}

export const RecentTransactions = ({
  initialRecentTransactionsData,
  accountId,
}: RecentTransactionsProps) => {
  const { response: transactions, isLoading } = useMyTransactions({
    accountId,
    initialData: initialRecentTransactionsData,
    // take: 5
  });

  const t = useTranslations('Widgets.RecentTransactions');

  const groupedTransactions = useMemo(() => {
    const res = (transactions || {})?.list?.reduce(
      (acc, transaction) => {
        const utcDate = new Date(transaction.createdAt);
        const localDate = toZonedTime(
          utcDate,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        );

        const formattedDate = format(localDate, 'dd.MM.yyyy');

        return {
          ...acc,
          [formattedDate]: [...(acc[formattedDate] || []), transaction],
        };
      },
      {} as Record<string, GetRecentTransactionsApi.TransactionSchema[]>,
    );

    if (!res) {
      return [];
    }

    const allTransactions = Object.entries(res).flatMap(
      ([date, transactions]) =>
        transactions.map((transaction) => ({ date, transaction })),
    );

    const regrouped = allTransactions.reduce(
      (acc, { date, transaction }) => {
        return {
          ...acc,
          [date]: [...(acc[date] || []), transaction],
        };
      },
      {} as Record<string, GetRecentTransactionsApi.TransactionSchema[]>,
    );

    return Object.entries(regrouped)
      .map(([date, transactions]) => {
        const parsedDate = parse(date, 'dd.MM.yyyy', new Date());

        const displayDate = isToday(parsedDate)
          ? t('today')
          : isYesterday(parsedDate)
            ? t('yesterday')
            : date;

        return {
          date: displayDate,
          sortDate: parsedDate,
          transactions: transactions.sort((a, b) => b.id - a.id),
        };
      })
      .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
  }, [t, transactions]);

  return (
    <Paper
      sx={{
        paddingBlock: 8,
        paddingInline: 6,
      }}
    >
      <Stack gap={8}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="Heading07">
            {t('recent_transactions')}
          </Typography>

          {Boolean(
            !isLoading && transactions.list && transactions.list.length,
          ) && (
            <Link href={AccountRoutes.Base} sx={{ textDecoration: 'none' }}>
              <Typography variant="BodyMSemiBold">
                <Stack direction="row" gap={3} alignItems="center">
                  {t('see_all')}
                  <ChevronRightIcon />
                </Stack>
              </Typography>
            </Link>
          )}
        </Stack>

        {!groupedTransactions?.length ? (
          <EmptyTransactions />
        ) : (
          groupedTransactions.map(({ date, transactions }) => (
            <Stack key={date} gap={8}>
              <Typography variant="BodySMedium" color="text.secondary">
                {date}
              </Typography>
              {transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  );
};
