import { z } from 'zod';

export const ResetPasswordArgsSchema = z.object({
  email: z.string().email(),
});

export type ResetPasswordArgsSchema = z.infer<typeof ResetPasswordArgsSchema>;

export const ResetPasswordDtoSchema = z.object({
  ttl: z.number(),
});

export type ResetPasswordDtoSchema = z.infer<typeof ResetPasswordDtoSchema>;
