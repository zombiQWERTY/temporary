import { z } from 'zod';

export const ConfirmPinArgsSchema = z.object({
  code: z.string().min(6),
});

export type ConfirmPinArgs = z.infer<typeof ConfirmPinArgsSchema>;

export type ConfirmOperationState =
  | {
      email: null;
    }
  | {
      email: string;
      ttl: number;
      sentAt: Date;
    };
