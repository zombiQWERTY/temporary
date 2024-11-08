import { z } from 'zod';
import { LocationDtoSchema } from '@/shared/commonProjectParts';

export const ProvideLocationArgsSchema = LocationDtoSchema.extend({
  fileIds: z.array(z.number()),
}).partial();

export type ProvideLocationArgsSchema = z.infer<
  typeof ProvideLocationArgsSchema
>;
