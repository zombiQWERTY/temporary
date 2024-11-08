'use client';

import { useTranslations } from 'next-intl';
import { FieldValues, useController } from 'react-hook-form';

import { TextField, TextFieldProps } from '@/shared/ui/Inputs';
import { HookFieldProps } from '../types';

export interface InputTextFieldProps
  extends HookFieldProps<FieldValues, string>,
    Omit<TextFieldProps, 'defaultValue' | 'name' | 'ref'> {}

export const InputTextField = ({
  name,
  formHelperText,
  type = 'text',
  ...props
}: InputTextFieldProps) => {
  const t = useTranslations('Shared.Fields');

  const {
    field: { ref, ...field },
    fieldState: { error },
  } = useController({ name });

  return (
    <TextField
      {...field}
      {...props}
      inputRef={ref}
      type={type}
      name={name}
      error={!!error}
      placeholder={props.placeholder || t('enter_value')}
      formHelperText={error?.message ?? formHelperText}
    />
  );
};
