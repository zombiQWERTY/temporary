import { z } from 'zod';

export enum RoleEnum {
  Client = 'client',
  ClientRepresentative = 'clientRepresentative',
}

export const RoleSchema = z.object({
  id: z.number(),
  slug: z.nativeEnum(RoleEnum),
  weight: z.number(),
});

export type Role = z.infer<typeof RoleSchema>;

export const RoleWrappedSchema = z.object({
  authId: z.number(),
  role: RoleSchema,
  roleId: z.number(),
});

export type RoleWrappedSchema = z.infer<typeof RoleWrappedSchema>;
