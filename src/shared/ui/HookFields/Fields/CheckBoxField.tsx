'use client';
import { FieldValues, useController } from 'react-hook-form';

import { Checkbox, CheckboxProps } from '@/shared/ui/Inputs';
import { HookFieldProps } from '../types';

export interface CheckBoxFieldProps
  extends HookFieldProps<FieldValues, string>,
    Omit<CheckboxProps, 'defaultValue' | 'name' | 'ref'> {}

export const CheckBoxField = ({
  name,
  formHelperText,
  ...props
}: CheckBoxFieldProps) => {
  const {
    field: { ref, ...field },
    fieldState: { error },
  } = useController({ name });

  return (
    <Checkbox
      {...field}
      {...props}
      inputRef={ref}
      name={name}
      checked={!!field.value}
      error={!!error}
      formHelperText={error?.message ?? formHelperText}
    />
  );
};
