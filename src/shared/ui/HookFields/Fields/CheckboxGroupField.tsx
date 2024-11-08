'use client';

import { FieldValues, useController } from 'react-hook-form';

import { CheckboxGroup, CheckboxGroupProps } from '@/shared/ui/Inputs';
import { HookFieldProps } from '../types';

export interface CheckboxGroupFieldProps
  extends HookFieldProps<FieldValues, string>,
    Omit<CheckboxGroupProps, 'defaultValue' | 'name' | 'ref'> {}

export const CheckboxGroupField = ({
  name,
  formHelperText,
  ...props
}: CheckboxGroupFieldProps) => {
  const {
    field: { ref, ...field },
    fieldState: { error },
  } = useController({ name });

  return (
    <CheckboxGroup
      {...field}
      {...props}
      ref={ref}
      error={!!error}
      formHelperText={error?.message ?? formHelperText}
    />
  );
};
