import { z } from 'zod';

export const GetVerificationMetaDtoSchema = z.object({
  applicationFormForNaturalPersons: z.string().min(1),
});

export type GetVerificationMetaDtoSchema = z.infer<
  typeof GetVerificationMetaDtoSchema
>;
