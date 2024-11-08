import { Single } from '@/pages/accounts/single';
import { GetAccountByIdApi } from '@/entities/Accounts';
import { GetRecentTransactionsApi } from '@/entities/Transactions';
import { auth } from '@/shared/auth';

export default async function Page({ params }: { params: { id: string } }) {
  const id = isNaN(Number(params.id)) ? params.id : Number(params.id);

  const session = await auth();

  const initialAccountData = session
    ? await GetAccountByIdApi.request(id)
    : null;

  const initialRecentTransactionsData =
    session && initialAccountData
      ? await GetRecentTransactionsApi.request(initialAccountData.account.id)
      : null;

  return (
    <Single
      initialRecentTransactionsData={
        initialRecentTransactionsData &&
        'error' in initialRecentTransactionsData
          ? null
          : initialRecentTransactionsData
      }
      initialAccountData={
        initialAccountData && 'error' in initialAccountData
          ? null
          : initialAccountData
      }
      accountId={id}
    />
  );
}
