// Role => weight (used for proxy authorization)
export enum RoleEnum {
  Admin = 'admin', // 100
  Client = 'client', // 20
  ClientRepresentative = 'clientRepresentative', // 10
  ComplianceManager = 'complianceManager', // 50
  SalesManager = 'salesManager', // 40
  SeniorSalesManager = 'seniorSalesManager', // 60
  HeadOfSales = 'headOfSales', // 70
  FinancialAnalyst = 'financialAnalyst', // 30
  Accountant = 'accountant', // 30
  Trustee = 'trustee', // 25
  BranchManager = 'branchManager', // 55
  HeadOfBranch = 'headOfBranch', // 65
  Marketer = 'marketer', // 25
  PartnerManager = 'partnerManager', // 45
  Partner = 'partner', // 20
  PartnerRepresentative = 'partnerRepresentative', // 10
}
