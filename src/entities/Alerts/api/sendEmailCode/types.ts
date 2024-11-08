import { z } from 'zod';
import { OtpTypeEnum } from '../../model/types';

export const SendCodeArgsSchema = z.object({
  email: z.string(),
  type: z.nativeEnum(OtpTypeEnum),
});

export type SendCodeArgsSchema = z.infer<typeof SendCodeArgsSchema>;

export const SendCodeDtoSchema = z.object({
  ttl: z.number(),
});

export type SendCodeDtoSchema = z.infer<typeof SendCodeDtoSchema>;
