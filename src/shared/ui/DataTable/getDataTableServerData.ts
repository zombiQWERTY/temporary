'use server';

import { ListApiFnArgs, PaginatedResponse } from '@/shared/api';
import { DataTableDTO } from './types';

interface GetDataTableServerDataParams<T extends object> {
  apiRoute: string;
  apiFn: (params: ListApiFnArgs) => Promise<PaginatedResponse<T>>;
  defaultTake: number;
  searchParams: {
    page?: string;
    search?: string;
    take?: string;
    targets?: string;
    [key: string]: string | undefined;
  };
}

export async function getDataTableServerData<T extends object>({
  apiFn,
  searchParams,
  defaultTake,
}: GetDataTableServerDataParams<T>): Promise<DataTableDTO<T>> {
  const take = parseInt(searchParams.take || '', 10) || defaultTake;

  const skip = searchParams.page
    ? (parseInt(searchParams.page, 10) - 1) * take
    : 0;

  const sortByParams = searchParams.sortBy
    ? searchParams.sortBy.split(',')
    : [];

  const sortOrderParams = searchParams.sortOrder
    ? searchParams.sortOrder.split(',')
    : [];

  const sortOrder = sortByParams.map((field, index) => ({
    id: field,
    desc: sortOrderParams[index] === 'desc',
  }));

  const baseFilterParams = Object.entries(searchParams)
    .filter(
      ([key]) =>
        !['page', 'take', 'search', 'sortBy', 'sortOrder'].includes(key),
    )
    .map(([key, value]) => ({ id: key, value: value || '' }));

  const filterParams = [...baseFilterParams];

  try {
    const res = await apiFn({
      take,
      skip,
      search: searchParams.search || '',
      columnFilters: filterParams,
      sorting: sortOrder,
    });

    if (!res) {
      throw new Error('Failed to fetch data');
    }

    return {
      initialData: res,
      defaultTake: take,
      initialPage: searchParams.page,
      initialSearch: searchParams.search,
      initialFilterParams: filterParams,
      initialSortOrder: sortOrder,
    };
  } catch (e: any) {
    return {
      initialData: {
        count: 0,
        take,
        skip,
        list: [],
        pageIndex: 0,
      },
      defaultTake: take,
      initialPage: searchParams.page,
      initialSearch: searchParams.search,
      initialFilterParams: filterParams,
      initialSortOrder: sortOrder,
    };
  }
}
