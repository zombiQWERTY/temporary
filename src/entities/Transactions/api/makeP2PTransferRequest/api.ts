import { apiClient, SuccessDtoSchema } from '@/shared/api';
import { MakeP2PTransferRequestArgsSchema } from './types';

const url = '/accounts/p2p-transfer' as const;

export const request = async (args: MakeP2PTransferRequestArgsSchema) => {
  return apiClient.post<
    typeof MakeP2PTransferRequestArgsSchema,
    typeof SuccessDtoSchema
  >(url, {
    dto: args,
    schema: MakeP2PTransferRequestArgsSchema,
    responseSchema: SuccessDtoSchema,
  });
};
