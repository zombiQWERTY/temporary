'use client';

import { toDate } from 'date-fns';
import { useTranslations } from 'next-intl';
import { FieldValues, useController } from 'react-hook-form';
import { InputDate, InputDateProps } from '@/shared/ui/Inputs';
import { HookFieldProps } from '../types';

export interface InputDateFieldProps
  extends HookFieldProps<FieldValues, string>,
    Omit<InputDateProps, 'defaultValue' | 'name' | 'ref'> {}

export const InputDateField = ({
  name,
  formHelperText,
  ...props
}: InputDateFieldProps) => {
  const t = useTranslations('Shared.Fields');

  const {
    field: { ref, ...field },
    fieldState: { error },
  } = useController({ name });

  return (
    <InputDate
      {...field}
      {...props}
      inputRef={ref}
      name={name}
      value={toDate(field.value)}
      error={!!error}
      placeholder={props.placeholder || t('select_date')}
      formHelperText={error?.message ?? formHelperText}
      defaultValue={field.value}
    />
  );
};
