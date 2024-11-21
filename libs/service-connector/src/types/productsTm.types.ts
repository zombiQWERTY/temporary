export interface CreateTMTransaction {
  clientId: number;
  strategyId: number;
  operationType: string;
  operationStatus: string;
  sharesProcessed?: number;
  branchId: number;
  clientSubAccountId: number;
  strategySubAccountId: number;
  originalTransactionIds: [number, number];
}

export interface GetInvestmentById {
  id: number;
}
