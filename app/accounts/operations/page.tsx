import { redirect } from 'next/navigation';
import { AccountRoutes } from '@/shared/router';

export default function Page() {
  redirect(AccountRoutes.Base);
}
