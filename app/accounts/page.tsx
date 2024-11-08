import { List } from '@/pages/accounts/list';
import { GetMyAccountsApi } from '@/entities/Accounts';
import { GetRecentTransactionsApi } from '@/entities/Transactions';
import { auth } from '@/shared/auth';

export default async function Page() {
  const session = await auth();
  const initialAccountsData = session
    ? await GetMyAccountsApi.request().catch(() => null)
    : null;

  const initialRecentTransactionsData = session
    ? await GetRecentTransactionsApi.request().catch(() => null)
    : null;

  return (
    <List
      initialAccountsData={initialAccountsData}
      initialRecentTransactionsData={initialRecentTransactionsData}
    />
  );
}
