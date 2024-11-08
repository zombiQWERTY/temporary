import { z } from 'zod';
import {
  CONTAIN_NUMBER_OR_SYMBOL_REGEXP,
  MIN_PASSWORD_LENGTH,
} from '@/shared/auth/schemas/constants';

// @TODO: Connect i18n?. These rules are not shown in the user interface if used with MultilinePasswordValidator component

export const passwordValidatorSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, {
    message: `At least ${MIN_PASSWORD_LENGTH} characters`,
  })
  .regex(CONTAIN_NUMBER_OR_SYMBOL_REGEXP, {
    message: 'Contains a number or(and) symbol',
  })
  .regex(/[A-Z]/, { message: 'One or more capitalized letter' })
  .refine(
    (val) => {
      return !z.string().email().safeParse(val).success;
    },
    {
      message: 'Can’t contain e-mail address',
    },
  );
