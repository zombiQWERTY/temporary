import { z } from 'zod';

export const ProvideConfirmVerificationArgsSchema = z.object({
  agreedToApplicationTerms: z.boolean().refine(Boolean, {
    message: 'You must agree to the application terms',
  }),
  agreedToServiceGeneralRules: z.boolean().refine(Boolean, {
    message: 'You must agree to the service general rules',
  }),
  agreedToClaimsRegistrationRules: z.boolean().refine(Boolean, {
    message: 'You must agree to the claims registration rules',
  }),
  agreedToMarginTradesRules: z.boolean().refine(Boolean, {
    message: 'You must agree to the margin trades rules',
  }),
  code: z.string().min(1),
});

export type ProvideConfirmVerificationArgsSchema = z.infer<
  typeof ProvideConfirmVerificationArgsSchema
>;
