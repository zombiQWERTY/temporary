import { redirect } from 'next/navigation';
import { TrustManagementRoutes } from '@/shared/router';

export default function Page() {
  redirect(TrustManagementRoutes.Base);
}
