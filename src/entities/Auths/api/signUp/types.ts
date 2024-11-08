import { z } from 'zod';
import { phoneResolver } from '@/shared/api';

export const SignUpDtoSchema = z.object({
  code: z.string(),
  ttl: z.number(),
});

export type SignUpDtoSchema = z.infer<typeof SignUpDtoSchema>;

export const SignUpArgsSchema = z.object({
  email: z.string().email(),
  phone: phoneResolver(),
});

export type SignUpArgsSchema = z.infer<typeof SignUpArgsSchema>;
