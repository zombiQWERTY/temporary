import { z } from 'zod';

export const ProvideExtraArgsSchema = z.object({
  fileIds: z.array(z.number()).min(1),
});

export type ProvideExtraArgsSchema = z.infer<typeof ProvideExtraArgsSchema>;
