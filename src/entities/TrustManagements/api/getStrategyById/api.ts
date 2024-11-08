import { apiClient } from '@/shared/api';
import { GetStrategyByIdDtoSchema } from './types';

const url = '/products-tm' as const;

export const request = (strategyId: number) => {
  return apiClient.get<typeof GetStrategyByIdDtoSchema>(
    `${url}/${strategyId}`,
    { responseSchema: GetStrategyByIdDtoSchema },
  );
};
