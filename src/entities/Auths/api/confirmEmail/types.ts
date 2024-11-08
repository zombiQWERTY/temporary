import { z } from 'zod';
import { phoneResolver } from '@/shared/api';
import { passwordValidatorSchema } from '@/shared/auth';

export const ConfirmEmailArgsSchema = z.object({
  email: z.string().email(),
  phone: phoneResolver(),
  password: passwordValidatorSchema,
  code: z.string().min(1),
  referralCode: z.optional(z.string()),
});

export type ConfirmEmailArgsSchema = z.infer<typeof ConfirmEmailArgsSchema>;
