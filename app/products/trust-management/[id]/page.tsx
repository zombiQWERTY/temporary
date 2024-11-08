import { Single } from '@/pages/products/trustManagement';
import { GetStrategyByIdApi } from '@/entities/TrustManagements';
import { auth } from '@/shared/auth';

export default async function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  const session = await auth();
  const initialStrategyData = session
    ? await GetStrategyByIdApi.request(id)
    : null;

  return <Single initialStrategyData={initialStrategyData} strategyId={id} />;
}
