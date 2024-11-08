'use client';
import { useTranslations } from 'next-intl';
import { FieldValues, useController } from 'react-hook-form';

import { Select, SelectProps } from '@/shared/ui/Inputs';
import { HookFieldProps } from '../types';

export interface SelectFieldProps
  extends HookFieldProps<FieldValues, string>,
    Omit<SelectProps, 'defaultValue' | 'name' | 'ref'> {}

export const SelectField = ({
  name,
  formHelperText,
  ...props
}: SelectFieldProps) => {
  const {
    field: { ref, ...field },
    fieldState: { error },
  } = useController({ name });
  const t = useTranslations('Shared.Fields.Select');

  return (
    <Select
      {...field}
      {...props}
      inputRef={ref}
      name={name}
      error={!!error}
      formHelperText={error?.message ?? formHelperText}
      placeholder={props.placeholder || t('select_option')}
    />
  );
};
