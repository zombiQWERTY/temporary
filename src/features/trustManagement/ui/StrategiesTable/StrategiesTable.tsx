'use client';
import { MRT_ColumnDef } from 'material-react-table';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';

import { formatMoney } from '@/entities/Accounts';
import { GetStrategiesApi } from '@/entities/TrustManagements';
import { ListApiFnArgs } from '@/shared/api';
import { percentageFormat } from '@/shared/lib';
import { TrustManagementRoutes } from '@/shared/router';
import { DataTable } from '@/shared/ui';
import { formatDateDifference } from '../../lib/formatDateDifference';
import { StrategiesTableActions } from './StrategiesTableActions';

const NotAvailable = 'N/A' as const;

const nameColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetStrategiesApi.StrategySchema> => ({
  accessorFn: (row) => row?.profiles?.[0]?.strategyName || NotAvailable,
  header: t('name'),
});

const profitabilityColumn = (
  t: ReturnType<typeof useTranslations>,
  locale: string,
): MRT_ColumnDef<GetStrategiesApi.StrategySchema> => ({
  accessorFn: (row) => percentageFormat(row.averageReturn, locale),
  accessorKey: 'averageReturn',
  header: t('profitability'),
});

const investorsColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetStrategiesApi.StrategySchema> => ({
  accessorKey: 'advertisedInvestorCount',
  header: t('investors'),
});

const amountUnderManagementColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetStrategiesApi.StrategySchema> => ({
  accessorFn: (row) =>
    formatMoney(row.advertisedManagedAmount, row.baseCurrency),
  header: t('amount_under_management'),
});

const ageColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetStrategiesApi.StrategySchema> => ({
  accessorFn: (row) => formatDateDifference(row.strategyStartDate, t),
  header: t('age'),
});

const currencyColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetStrategiesApi.StrategySchema> => ({
  accessorKey: 'baseCurrency',
  header: t('currency'),
});

const minAmountColumn = (
  t: ReturnType<typeof useTranslations>,
): MRT_ColumnDef<GetStrategiesApi.StrategySchema> => ({
  accessorFn: (row) => formatMoney(row.minInvestmentAmount, row.baseCurrency),
  header: t('min_amount'),
});

const actionsColumn = (): MRT_ColumnDef<GetStrategiesApi.StrategySchema> => ({
  accessorKey: 'id',
  header: '',
  Cell: ({ cell, row }) => (
    <StrategiesTableActions
      id={cell.getValue<number>()}
      strategyCurrency={row.original.baseCurrency}
    />
  ),
});

interface TrustManagementTableProps {
  initialStrategiesData: GetStrategiesApi.GetStrategiesDtoSchema | null;
}

export const StrategiesTable = (props: TrustManagementTableProps) => {
  const t = useTranslations('Features.Strategies.Table');
  const locale = useLocale();

  const getColumns = (): MRT_ColumnDef<GetStrategiesApi.StrategySchema>[] => [
    nameColumn(t),
    profitabilityColumn(t, locale),
    investorsColumn(t),
    amountUnderManagementColumn(t),
    ageColumn(t),
    currencyColumn(t),
    minAmountColumn(t),
    actionsColumn(),
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(() => getColumns(), [t, locale]);

  const listApiFn = useCallback(
    async (args: ListApiFnArgs) => {
      const response = await GetStrategiesApi.request(args);

      const list =
        response?.list?.map((s) => ({
          ...s,
          profiles: [s.profiles.find((p) => p.language === locale)!],
        })) || [];

      return { ...response, list };
    },
    [locale],
  );

  return (
    <DataTable
      columns={columns}
      queryKey="strategies-list"
      editUrl={(row) => `${TrustManagementRoutes.Base}/${row.id}`}
      listApiFn={listApiFn}
      defaultTake={20}
      initialData={props.initialStrategiesData}
      useQueryParams={false}
    />
  );
};
