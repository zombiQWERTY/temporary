'use client';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { forwardRef } from 'react';

import { CalendarIcon } from '@/shared/ui/Icons';
import { InputContainer, InputContainerProps } from '../InputContainer';

export interface InputDateProps
  extends InputContainerProps,
    DatePickerProps<Date, never> {
  placeholder?: string;
}

export const InputDate = forwardRef<HTMLInputElement, InputDateProps>(
  (
    {
      variant = 'standard',
      formHelperText,
      label,
      margin,
      sx,
      placeholder,
      ...props
    },
    ref,
  ) => {
    return (
      <InputContainer
        label={label}
        formHelperText={formHelperText}
        error={props.error}
        margin={margin}
        required={props.required}
        fullWidth={props.fullWidth}
        variant={variant}
        sx={sx}
      >
        <DatePicker
          ref={ref}
          {...props}
          slots={{
            openPickerIcon: CalendarIcon,
          }}
          format="dd.MM.yyyy"
          slotProps={{
            openPickerIcon: {
              fontSize: 'large',
            },
            openPickerButton: {
              color: 'secondary',
              sx: {
                marginInlineEnd: 2,
              },
            },
            textField: {
              variant,
              placeholder,
              error: props.error,
            },
          }}
        />
      </InputContainer>
    );
  },
);

InputDate.displayName = 'InputDate';
