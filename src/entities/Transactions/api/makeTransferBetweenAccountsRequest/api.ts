import { apiClient, SuccessDtoSchema } from '@/shared/api';
import { MakeTransferBetweenAccountsRequestArgsSchema } from './types';

const url = '/accounts/internal-transfer' as const;

export const request = async (
  args: MakeTransferBetweenAccountsRequestArgsSchema,
) => {
  return apiClient.post<
    typeof MakeTransferBetweenAccountsRequestArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: args,
    schema: MakeTransferBetweenAccountsRequestArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
