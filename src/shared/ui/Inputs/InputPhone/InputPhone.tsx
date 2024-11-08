'use client';
import { MuiTelInput, MuiTelInputInfo } from 'mui-tel-input';
import { forwardRef } from 'react';

import { TextFieldProps } from '@/shared/ui';
import { InputContainer } from '../InputContainer';

export type InputPhoneProps = Omit<TextFieldProps, 'onChange' | 'value'> & {
  onChange: (value: string) => void;
  value: string;
};

export const InputPhone = forwardRef<HTMLInputElement, InputPhoneProps>(
  ({ value, onChange, ...inputProps }, ref) => {
    return (
      <InputContainer
        formHelperText={inputProps.formHelperText}
        error={inputProps.error}
      >
        <MuiTelInput
          label={inputProps.label}
          value={value}
          onChange={(_value: string, telInfo: MuiTelInputInfo) => {
            if (telInfo.numberValue) {
              onChange(telInfo.numberValue);
            }
          }}
          inputRef={ref}
          error={!!inputProps.error}
          sx={{
            '.MuiFormLabel-root': {
              fontSize: '16px',
              position: 'absolute',
              transform: value
                ? 'translate(16px, 3px) scale(0.75)'
                : 'translate(60px, 20px) scale(1)',
            },
            '.MuiOutlinedInput-notchedOutline': { border: 'transparent' },
          }}
          inputProps={{
            name: inputProps.name,
            onBlur: inputProps.onBlur,
          }}
        />
      </InputContainer>
    );
  },
);

InputPhone.displayName = 'InputPhone';
