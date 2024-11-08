import { apiClient, ListApiFnArgs } from '@/shared/api';
import { GetStrategiesDtoSchema } from './types';

const url = '/products-tm' as const;

export const request = async (args?: ListApiFnArgs) => {
  return apiClient.get<typeof GetStrategiesDtoSchema>(
    url,
    {
      responseSchema: GetStrategiesDtoSchema,
    },
    {
      params: args,
    },
  );
};
