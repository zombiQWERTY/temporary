import { z } from 'zod';

export const SuccessDtoSchema = z.object({
  ok: z.boolean(),
});

export interface PaginatedResponse<T extends object> {
  count: number;
  take: number;
  skip: number;
  list: T[];
  pageIndex: number;
}

export interface ListApiFnArgs {
  take?: number;
  skip?: number;
  search?: string;
  columnFilters?: Array<{
    id: string;
    value: unknown;
  }>;
  sorting?: Array<{
    desc: boolean;
    id: string;
  }>;
}
