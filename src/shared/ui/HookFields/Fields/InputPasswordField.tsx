'use client';

import { FieldValues, useController } from 'react-hook-form';
import { InputPassword, InputPasswordProps } from '@/shared/ui/Inputs';
import { HookFieldProps } from '../types';

export interface InputPasswordFieldProps
  extends HookFieldProps<FieldValues, string>,
    Omit<InputPasswordProps, 'name' | 'defaultValue' | 'ref'> {
  withHelperText?: boolean;
}

export const InputPasswordField = ({
  name,
  formHelperText,
  withHelperText = true,
  ...props
}: InputPasswordFieldProps) => {
  const {
    field: { ref, ...field },
    fieldState: { error },
  } = useController({ name });

  const internalFormHelperText = withHelperText
    ? (error?.message ?? formHelperText)
    : undefined;

  return (
    <InputPassword
      {...field}
      {...props}
      inputRef={ref}
      name={name}
      error={!!error}
      formHelperText={internalFormHelperText}
    />
  );
};
