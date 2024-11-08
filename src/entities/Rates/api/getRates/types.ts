import { parseISO } from 'date-fns';
import { z } from 'zod';
import { CurrencyCodesEnum } from '@/shared/commonProjectParts';

const CurrencySchema = z.object({
  baseCurrencyCode: z.nativeEnum(CurrencyCodesEnum),
  date: z.string().transform((arg) => parseISO(arg)),
  targetCurrencyCode: z.nativeEnum(CurrencyCodesEnum),
  value: z.string().refine((val) => !isNaN(Number(val)), {
    message: 'Value must be a string representation of a number',
  }),
});

export const GetRatesDtoSchema = z.record(CurrencySchema);

export type GetRatesDtoSchema = z.infer<typeof GetRatesDtoSchema>;
