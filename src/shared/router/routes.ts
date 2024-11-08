export const apiAuthPrefix = '/api/auth';

// Prefixes
const authPrefix = '/auth';
const profilePrefix = '/profile';
const verificationPrefix = '/verification';
const dashboardPrefix = '/dashboard';
const accountsPrefix = '/accounts';
const productsPrefix = '/products';
const trustManagementPrefix = `${productsPrefix}/trust-management`;

// Route groups
export const AuthRoutes = {
  SignIn: `${authPrefix}/signin`,
  SignUp: `${authPrefix}/signup`,
  ConfirmEmail: `${authPrefix}/confirm-email`,
  PasswordRecovery: `${authPrefix}/password-recovery`,
  ConfirmPasswordRecovery: `${authPrefix}/confirm-password-recovery`,
  NewPassword: `${authPrefix}/new-password`,
} as const;

export const VerificationRoutes = {
  PassportDetails: `${verificationPrefix}/passport-details`,
  ResidenceAddress: `${verificationPrefix}/residence-address`,
  EconomicProfile: `${verificationPrefix}/economic-profile`,
  TaxpayerDetails: `${verificationPrefix}/taxpayer-details`,
  SignContract: `${verificationPrefix}/sign-contract`,
} as const;

export const AccountRoutes = {
  Base: accountsPrefix,
  Deposit: `${accountsPrefix}/operations/deposit`,
  DepositByDetails: `${accountsPrefix}/operations/deposit/by-details`,
  TransferBetweenAccounts: `${accountsPrefix}/operations/transfer-between-accounts`,
  P2PTransfer: `${accountsPrefix}/operations/p2p-transfer`,
  Change: `${accountsPrefix}/operations/exchange`,
  Withdraw: `${accountsPrefix}/operations/withdrawal`,
} as const;

export const TrustManagementRoutes = {
  Base: trustManagementPrefix,
  Investments: `${trustManagementPrefix}/investments`,
} as const;

export const ProfileRoutes = {
  Base: profilePrefix,
  Identity: `${profilePrefix}/passport-details`,
  Location: `${profilePrefix}/residence-address`,
  Economic: `${profilePrefix}/economic-profile`,
  Tax: `${profilePrefix}/taxpayer-details`,
  Documents: `${profilePrefix}/documents`,
} as const;

// Main Routes object
export const Routes = {
  Home: '/',
  Dashboard: dashboardPrefix,
  ...AuthRoutes,
  ...VerificationRoutes,
  ...AccountRoutes,
  ...TrustManagementRoutes,
  ...ProfileRoutes,
} as const;

// Public and Authenticated Routes
export const publicRoutes: readonly string[] = [];

export const authRoutes: readonly string[] = Object.values(AuthRoutes);

// Default Redirects
export const defaultRedirects: Record<string, string> = {
  [Routes.Home]: Routes.Dashboard,
};

// Default Login Redirect
export const DEFAULT_LOGIN_REDIRECT = Routes.Dashboard;
