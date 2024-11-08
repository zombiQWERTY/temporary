'use client';
import { Stack, Typography, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/system';
import { MRT_ColumnDef } from 'material-react-table';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import {
  GetMyAccountsApi,
  useAccountType,
  useSortBalances,
} from '@/entities/Accounts';
import { AccountRoutes } from '@/shared/router';
import { DataTable, InfoIcon } from '@/shared/ui';
import { BalanceItem } from '../BalanceItem';
import { AccountsTableActions } from './AccountsTableActions';

const NotAvailable = 'N/A' as const;

const nameColumn = (
  t: ReturnType<typeof useTranslations>,
  accountTypes: Record<string, string | undefined>,
): MRT_ColumnDef<GetMyAccountsApi.AccountSchema> => ({
  id: 'name',
  accessorFn: (row) => row,
  header: t('name'),
  Cell: ({ cell }) => {
    const account = cell.getValue<GetMyAccountsApi.AccountSchema>();
    if (!account) {
      return null;
    }

    return (
      <Typography variant="BodyMRegular" color="text.primary">
        {account.accountType
          ? accountTypes?.[account.accountType] || NotAvailable
          : NotAvailable}
        &nbsp;
        {account.walletNumber?.walletId ?? ''}
      </Typography>
    );
  },
});

const balanceColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetMyAccountsApi.AccountSchema> => ({
  accessorFn: (row) => row?.subAccounts,
  id: 'balance',
  header: t('account_balance'),
  Cell: ({ cell }) => {
    const balancesMap = useSortBalances({
      balances: cell.getValue<GetMyAccountsApi.SubAccountSchema[]>(),
    });

    return (
      <Stack direction="row" gap={5}>
        {balancesMap.map((item) => (
          <BalanceItem
            key={item.currencyCode}
            balance={item.balance}
            currencyCode={item.currencyCode}
            variant="BodyMRegular"
            color="text.primary"
          />
        ))}
      </Stack>
    );
  },
});

const overallAssessmentColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetMyAccountsApi.AccountSchema> => ({
  accessorKey: 'overall',
  header: '',
  Header: (
    <Stack direction="row" gap={3} alignItems="center" color="text.secondary">
      {t('overall_assessment')}
      <Tooltip title={t('overall_assessment_hint')} arrow>
        <Stack>
          <InfoIcon fontSize="large" />
        </Stack>
      </Tooltip>
    </Stack>
  ),
  Cell: () => NotAvailable,
});

const actionsColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetMyAccountsApi.AccountSchema> => ({
  id: 'actionsForAccount',
  header: t('actions'),
  Cell: ({ cell }) => <AccountsTableActions id={cell.getValue<number>()} />,
});

interface AccountsTableProps {
  initialAccountsData: GetMyAccountsApi.GetMyAccountsDtoSchema | null;
}

export const AccountsTable = (props: AccountsTableProps) => {
  const t = useTranslations('Features.Accounts.Table');
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('xxl'));
  const accountTypes = useAccountType();

  const getColumns = (): MRT_ColumnDef<GetMyAccountsApi.AccountSchema>[] => {
    return [
      nameColumn(t, accountTypes),
      balanceColumn(t),
      overallAssessmentColumn(t),
      ...(matches ? [actionsColumn(t)] : []),
    ];
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(() => getColumns(), [accountTypes, matches, t]);

  return (
    <DataTable
      columns={columns}
      queryKey="accounts-list"
      editUrl={(row) => `${AccountRoutes.Base}/${row.walletNumber?.walletId}`}
      listApiFn={GetMyAccountsApi.request}
      defaultTake={20}
      initialData={props.initialAccountsData}
      useQueryParams={false}
    />
  );
};
