import { parsePhoneNumber } from 'libphonenumber-js';
import { z } from 'zod';

const isPhoneNumber = (value: string) => {
  try {
    const phoneNumber = parsePhoneNumber(value);

    if (!phoneNumber.isPossible()) {
      return false;
    }

    return phoneNumber.isValid();
  } catch {
    return false;
  }
};

export const phoneNumberSchema = z
  .string()
  .min(1, { message: 'Phone is required' })
  .refine(isPhoneNumber, () => {
    return {
      message: 'Incorrect phone number',
    };
  });
const regex = /^[a-zA-Z0-9 !@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/;

export const onlyEnLettersTextSchema = z
  .string()
  .regex(regex, 'Only English letters should be used');

export const phoneResolver = () => phoneNumberSchema;
