'use client';
import { Edit } from '@mui/icons-material';
import { ListItemIcon, MenuItem } from '@mui/material';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  ColumnFiltersState,
  GlobalFilterTableState,
  SortingState,
} from '@tanstack/table-core';
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_DensityState,
  MRT_TableOptions,
  MRT_Updater,
  useMaterialReactTable,
} from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import { MRT_Localization_RU } from 'material-react-table/locales/ru';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { identity } from 'ramda';
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useProgress } from 'react-transition-progress';

import { ListApiFnArgs, PaginatedResponse, ServerError } from '@/shared/api';
import { useToast } from '@/shared/lib';
import { DeleteAction } from './DeleteAction';
import { BaseRow, DataTableDTO } from './types';

interface DataTableProps<T extends BaseRow> extends DataTableDTO<T> {
  columns: MRT_ColumnDef<T>[];
  queryKey: string;
  listApiFn: (args: ListApiFnArgs) => Promise<PaginatedResponse<T>>;
  deleteApiFn?: (id: number) => Promise<any>;
  editUrl?: (o: T) => string;
  useQueryParams?: boolean;
  enableInternalActionsRow?: boolean;
  enableColumnActions?: boolean;
  enableColumnFilters?: boolean;
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableBottomToolbar?: boolean;
  enableTopToolbar?: boolean;
}

const cleanParams = (params: URLSearchParams, keysToKeep: string[] = []) => {
  Array.from(params.keys()).forEach((key) => {
    if (!keysToKeep.includes(key)) {
      params.delete(key);
    }
  });
};

// @TODO: divide into hooks and move into widgets
export const DataTable = <T extends BaseRow>({
  initialData,
  initialPage,
  initialSearch,
  initialFilterParams,
  initialSortOrder,
  defaultTake,
  listApiFn,
  deleteApiFn,
  columns,
  editUrl,
  queryKey,
  enableInternalActionsRow = false,
  useQueryParams = true,
  enableColumnActions = false,
  enableColumnFilters = false,
  enablePagination = false,
  enableSorting = false,
  enableBottomToolbar = false,
  enableTopToolbar = false,
}: DataTableProps<T>) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace, push } = useRouter();
  const toast = useToast();
  const t = useTranslations('Shared.DataTable');
  const locale = useLocale();
  const startProgress = useProgress();

  const updateURLParams = (params: URLSearchParams) => {
    replace(`${pathname}?${params.toString()}`);
  };

  const fallbackData = useMemo<PaginatedResponse<T>>(() => {
    const pageIndex = initialPage ? parseInt(initialPage, 10) - 1 : 0;

    const skip = pageIndex * defaultTake;

    return (
      initialData || {
        count: 0,
        take: defaultTake,
        skip,
        list: [] as T[],
        pageIndex,
      }
    );
  }, [defaultTake, initialData, initialPage]);

  const [pagination, setPagination] = useState({
    pageIndex: fallbackData.pageIndex,
    pageSize: fallbackData.take,
  });

  const [globalFilter, setGlobalFilter] = useState(initialSearch || '');

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialFilterParams || [],
  );

  const [sorting, setSorting] = useState<SortingState>(initialSortOrder || []);
  const [density, setDensity] = useState<MRT_DensityState>('comfortable');

  useEffect(() => {
    if (!useQueryParams || !searchParams) {
      return;
    }

    const params = new URLSearchParams(searchParams);
    if (pagination.pageIndex) {
      params.set('page', String(pagination.pageIndex + 1));
      params.set('take', String(pagination.pageSize));
    } else {
      params.delete('page');
      params.delete('take');
    }

    updateURLParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, searchParams, useQueryParams]);

  useEffect(() => {
    if (!useQueryParams || !searchParams) {
      return;
    }

    const params = new URLSearchParams(searchParams);
    cleanParams(params, ['page', 'take', 'search', 'sortBy', 'sortOrder']);

    if (columnFilters && columnFilters.length) {
      columnFilters.forEach((f) => {
        params.set(f.id, String(f.value));
      });
    }

    updateURLParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters, searchParams, useQueryParams]);

  useEffect(() => {
    if (!useQueryParams || !searchParams) {
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.delete('sortBy');
    params.delete('sortOrder');

    if (sorting && sorting.length) {
      const sortBy = sorting.map((option) => option.id).join(',');
      const sortOrder = sorting
        .map((option) => (option.desc ? 'desc' : 'asc'))
        .join(',');

      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
    }

    updateURLParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting, searchParams, useQueryParams]);

  const queryResult: UseQueryResult<PaginatedResponse<T>, Error> = useQuery({
    queryKey: [
      queryKey,
      pagination.pageSize,
      pagination.pageSize * pagination.pageIndex,
      globalFilter || '',
      columnFilters,
      sorting,
    ],
    queryFn: () =>
      listApiFn({
        take: pagination.pageSize,
        skip: pagination.pageSize * pagination.pageIndex,
        search: globalFilter || '',
        columnFilters,
        sorting,
      })
        .then(identity)
        .catch((e: unknown) => {
          const { error } = e as ServerError;
          toast.error(error);
          toast.error(t('loading_errored'));
          return [];
        }),
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 3,
    initialData: fallbackData,
  });

  const { data, isLoading, refetch } = queryResult;

  const table = useMaterialReactTable({
    enableColumnActions,
    enableColumnFilters,
    enablePagination,
    enableSorting,
    enableBottomToolbar,
    enableTopToolbar,

    columns,
    data: data.list,
    rowCount: data.count,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    // @ts-expect-error hack to remove warning
    getSortedRowModel: null,
    state: {
      showProgressBars: isLoading,
      pagination,
      globalFilter,
      columnFilters,
      sorting,
      density,
    },
    onDensityChange: setDensity,
    onSortingChange: (updater: MRT_Updater<SortingState>) => {
      setSorting(
        (prevFilter: any) =>
          (updater instanceof Function ? updater(prevFilter) : updater) as any,
      );

      table.resetPageIndex();
    },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onGlobalFilterChange: (updater: MRT_Updater<GlobalFilterTableState>) => {
      setGlobalFilter(
        (prevFilter: any) =>
          (updater instanceof Function ? updater(prevFilter) : updater) as any,
      );

      table.resetPageIndex();
    },
    enableRowActions: Boolean(
      (enableInternalActionsRow && editUrl) || deleteApiFn,
    ),
    positionActionsColumn: 'last',
    localization: locale === 'en' ? MRT_Localization_EN : MRT_Localization_RU,
    muiSearchTextFieldProps: {
      variant: 'outlined',
      className: 'MRTSearchTextField',
    },
    muiTableHeadProps: {
      className: 'MRTHeadFilterFields',
    },
    muiPaginationProps: {
      SelectProps: {
        className: 'MRTPaginationSelectField',
      },
    },
    muiFilterTextFieldProps: {
      SelectProps: {
        className: 'MRTHeadFilterFieldsMultipleSelect',
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        if (editUrl) {
          startTransition(() => {
            startProgress();
          });

          push(editUrl(row.original));
        }
      },
      sx: {
        cursor: 'pointer',
      },
    }),
    mrtTheme: (theme) => ({
      baseBackgroundColor: theme.palette.background.paper,
    }),
    muiTablePaperProps: {
      elevation: 0,
    },
    muiTableHeadCellProps: {
      sx: (theme) => ({
        borderBottom: `1px solid ${theme.palette.grey[100]}`,
        color: theme.palette.grey[300],
      }),
    },
    muiTableBodyCellProps: {
      sx: (theme) => ({
        'tr:not(:last-child) &': {
          borderBottom: `1px solid ${theme.palette.grey[100]}`,
        },
      }),
    },
    renderRowActionMenuItems: useCallback<
      Required<MRT_TableOptions<T>>['renderRowActionMenuItems']
    >(
      ({ closeMenu, row }) =>
        [
          editUrl ? (
            <MenuItem
              key={0}
              onClick={() => {
                startTransition(() => {
                  startProgress();
                });
                push(`${editUrl}/${row.original.id}`);
                closeMenu();
              }}
              sx={{ m: 0 }}
            >
              <ListItemIcon>
                <Edit />
              </ListItemIcon>
              {t('edit')}
            </MenuItem>
          ) : null,
          deleteApiFn ? (
            <DeleteAction
              key={1}
              row={row.original}
              closeMenu={closeMenu}
              deleteApiFn={deleteApiFn}
              refetchList={refetch}
            />
          ) : null,
        ].filter(Boolean),
      [editUrl, t, deleteApiFn, refetch, push, startProgress],
    ),
  });

  return <MaterialReactTable table={table} />;
};
