import { PaginatedResponse } from '@/shared/api/types';

export interface DataTableDTO<T extends object> {
  initialData?: PaginatedResponse<T> | null;
  initialPage?: string;
  initialSearch?: string;
  initialFilterParams?: Array<{ id: string; value: string | string[] }>;
  initialSortOrder?: Array<{ id: string; desc: boolean }>;
  defaultTake: number;
}

export interface BaseRow {
  id: number | string;
  [k: string]: any;
}
