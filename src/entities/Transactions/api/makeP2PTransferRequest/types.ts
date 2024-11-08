import { z } from 'zod';

export const MakeP2PTransferRequestArgsSchema = z.object({
  amount: z.preprocess(
    (x) => (x ? x : undefined),
    z.coerce.number().int().min(1),
  ),
  fromAccountId: z.number().min(1),
  targetAccountId: z.string().regex(/^M(?!.*_).{7}$/, {
    message:
      'targetAccountId must start with "M" followed by exactly 7 characters.',
  }),
  currency: z.string().min(1),
  code: z.string().min(1),
});

export type MakeP2PTransferRequestArgsSchema = z.infer<
  typeof MakeP2PTransferRequestArgsSchema
>;
