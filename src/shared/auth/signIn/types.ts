import { z } from 'zod';
import { RoleSchema } from '@/shared/auth/types';

export const SignInDtoSchema = z.object({
  userId: z.number(),
  accessToken: z.string(),
  refreshToken: z.string(),
  mainBranchId: z.number(),
  mainRole: z.string(),
  branches: z.array(
    z.object({
      branchId: z.number(),
      isHeadOfBranch: z.boolean(),
      userId: z.number(),
      userRole: z.string(),
    }),
  ),
  roles: z.array(RoleSchema),
  profile: z.object({
    email: z.string().email(),
    phone: z.string(),
  }),
});

export type SignInDtoSchema = z.infer<typeof SignInDtoSchema>;

export const SignInArgsSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export type SignInArgsSchema = z.infer<typeof SignInArgsSchema>;
