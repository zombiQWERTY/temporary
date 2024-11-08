import { redirect } from 'next/navigation';
import { VerificationRoutes } from '@/shared/router';

export default function Page() {
  redirect(VerificationRoutes.PassportDetails);
}
