import { DepositByDetails } from '@/pages/accounts/operations/deposit/byDetails';

export default function DepositByDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <DepositByDetails id={params.id} />;
}
