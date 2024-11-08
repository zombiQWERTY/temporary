'use client';

import { FieldValues, useController } from 'react-hook-form';
import { InputPhone, InputPhoneProps } from '@/shared/ui/Inputs';
import { HookFieldProps } from '../types';

export interface InputPhoneFieldProps
  extends HookFieldProps<FieldValues, string>,
    Omit<
      InputPhoneProps,
      'defaultValue' | 'name' | 'ref' | 'value' | 'onChange'
    > {}

export const InputPhoneField = ({
  name,
  formHelperText,
  ...props
}: InputPhoneFieldProps) => {
  const {
    field: { ref, ...field },
    fieldState: { error },
  } = useController({ name });

  return (
    <InputPhone
      {...field}
      {...props}
      ref={ref}
      name={name}
      error={!!error}
      formHelperText={error?.message ?? formHelperText}
    />
  );
};
