import { Investments } from '@/pages/products/trustManagement';
import { GetInvestmentsApi } from '@/entities/TrustManagements';
import { auth } from '@/shared/auth';

export default async function Page() {
  const session = await auth();
  const initialInvestmentsData = session
    ? await GetInvestmentsApi.request()
    : null;

  return <Investments initialInvestmentsData={initialInvestmentsData} />;
}
