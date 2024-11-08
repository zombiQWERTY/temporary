'use client';

import { FieldValues, useController } from 'react-hook-form';
import { withHookFormMask } from 'use-mask-input';
import { TextField, TextFieldProps } from '@/shared/ui';
import { HookFieldProps } from '../types';

type Mask =
  | 'datetime'
  | 'email'
  | 'numeric'
  | 'currency'
  | 'decimal'
  | 'integer'
  | 'percentage'
  | 'url'
  | 'ip'
  | 'mac'
  | 'ssn'
  | 'brl-currency'
  | 'cpf'
  | 'cnpj'
  | (string & object)
  | (string[] & object)
  | null;

export interface InputMaskFieldProps
  extends HookFieldProps<FieldValues, string>,
    Omit<TextFieldProps, 'defaultValue' | 'name' | 'ref'> {
  mask: Mask;
}

export const InputMaskField = ({
  name,
  formHelperText,
  mask,
  ...props
}: InputMaskFieldProps) => {
  const {
    field: { ref, ...field },
    fieldState: { error },
  } = useController({ name });

  const { ref: newRef, ...data } = withHookFormMask(
    { ...field, ref } as any,
    mask,
  );

  return (
    <TextField
      {...data}
      {...props}
      inputRef={newRef}
      name={name}
      error={!!error}
      formHelperText={error?.message ?? formHelperText}
    />
  );
};
