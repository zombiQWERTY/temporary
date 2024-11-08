'use client';
import { MRT_ColumnDef } from 'material-react-table';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';

import { formatMoney } from '@/entities/Accounts';
import { GetInvestmentsApi } from '@/entities/TrustManagements';
import { ListApiFnArgs } from '@/shared/api';
import { percentageFormat } from '@/shared/lib';
import { TrustManagementRoutes } from '@/shared/router';
import { DataTable } from '@/shared/ui';
import { InvestmentsTableActions } from './InvestmentsTableActions';

const NotAvailable = 'N/A' as const;

const nameColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetInvestmentsApi.InvestmentSchema> => ({
  accessorFn: (row) => row.strategyTitles[0]?.title || NotAvailable,
  header: t('name'),
});

const numberOfSharesColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetInvestmentsApi.InvestmentSchema> => ({
  accessorFn: (row) => String(row.totalShares),
  header: t('number_of_shares'),
});

const shareCostColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetInvestmentsApi.InvestmentSchema> => ({
  accessorFn: (row) =>
    row.shareCost
      ? formatMoney(row.shareCost, row.strategyCurrency)
      : NotAvailable,
  header: t('cost_of_share'),
});

const investmentAmountColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetInvestmentsApi.InvestmentSchema> => ({
  accessorFn: (row) =>
    row.totalInvestedAmount
      ? formatMoney(row.totalInvestedAmount, row.strategyCurrency)
      : NotAvailable,
  header: t('amount_of_investment'),
});

const estimatedSharesCostColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetInvestmentsApi.InvestmentSchema> => ({
  accessorFn: (row) =>
    formatMoney(row.estimatedShareValue, row.strategyCurrency),
  header: t('estimated_shares_cost'),
});

const profitabilityColumn = (
  t: ReturnType<typeof useTranslations>,
  locale: string,
): MRT_ColumnDef<GetInvestmentsApi.InvestmentSchema> => ({
  accessorFn: (row) =>
    row.profitability
      ? percentageFormat(row.profitability, locale)
      : NotAvailable,
  accessorKey: 'profitability',
  header: t('profitability'),
});

const profitColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetInvestmentsApi.InvestmentSchema> => ({
  accessorFn: (row) =>
    row.totalProfit
      ? formatMoney(row.totalProfit, row.strategyCurrency)
      : NotAvailable,
  accessorKey: 'totalProfit',
  header: t('profit'),
});

const actionsColumn =
  (): MRT_ColumnDef<GetInvestmentsApi.InvestmentSchema> => ({
    accessorKey: 'id',
    header: '',
    Cell: ({ row }) => <InvestmentsTableActions investment={row.original} />,
  });

interface InvestmentsTableProps {
  initialInvestmentsData: GetInvestmentsApi.GetInvestmentsDtoSchema | null;
}

export const InvestmentsTable = (props: InvestmentsTableProps) => {
  const t = useTranslations('Features.Investments.Table');
  const locale = useLocale();

  const getColumns =
    (): MRT_ColumnDef<GetInvestmentsApi.InvestmentSchema>[] => [
      nameColumn(t),
      numberOfSharesColumn(t),
      shareCostColumn(t),
      investmentAmountColumn(t),
      estimatedSharesCostColumn(t),
      profitabilityColumn(t, locale),
      profitColumn(t),
      actionsColumn(),
    ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(() => getColumns(), [t, locale]);

  const listApiFn = useCallback(
    async (args: ListApiFnArgs) => {
      const response = await GetInvestmentsApi.request(args);

      const list =
        response?.list?.map((s) => ({
          ...s,
          profiles: [s.strategyTitles.find((p) => p.language === locale)!],
        })) || [];

      return { ...response, list };
    },
    [locale],
  );

  return (
    <DataTable
      columns={columns}
      queryKey="investments-list"
      editUrl={(row) => `${TrustManagementRoutes.Base}/${row.strategyId}`}
      listApiFn={listApiFn}
      defaultTake={20}
      initialData={props.initialInvestmentsData}
      useQueryParams={false}
    />
  );
};
