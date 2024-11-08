import { z } from 'zod';
import { passwordValidatorSchema } from '@/shared/auth';

export const NewPasswordArgsSchema = z.object({
  email: z.string().email(),
  password: passwordValidatorSchema,
  code: z.string().min(1),
});

export type NewPasswordArgsSchema = z.infer<typeof NewPasswordArgsSchema>;
