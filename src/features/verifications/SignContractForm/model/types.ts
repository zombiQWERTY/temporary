import { z } from 'zod';
import { ConfirmVerificationApi } from '@/entities/Verifications';

export const SignContractFormSchema =
  ConfirmVerificationApi.ProvideConfirmVerificationArgsSchema.omit({
    code: true,
  });

export type SignContractFormSchema = z.infer<typeof SignContractFormSchema>;
