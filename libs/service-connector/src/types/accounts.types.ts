export interface CreateServiceTransaction {
  branchId: number;
  clientId: number;
  strategyId: number;
  operationStatus: string;
  operationType: string;
  amount: bigint;
  clientSubAccountId: number;
  strategySubAccountId: number;
  originalTransactionIds: [number, number];
}
