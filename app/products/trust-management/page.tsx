import { List } from '@/pages/products/trustManagement';
import { GetStrategiesApi } from '@/entities/TrustManagements';
import { auth } from '@/shared/auth';

export default async function Page() {
  const session = await auth();
  const initialStrategiesData = session
    ? await GetStrategiesApi.request()
    : null;

  return <List initialStrategiesData={initialStrategiesData} />;
}
