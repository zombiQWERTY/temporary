import { InputBase, InputBaseProps } from '@mui/material';
import { forwardRef } from 'react';

import { InputContainer, InputContainerProps } from '../InputContainer';

export interface TextFieldProps
  extends InputContainerProps,
    Omit<InputBaseProps, 'margin' | 'classes'> {}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { variant = 'standard', formHelperText, label, margin, sx, ...props },
    ref,
  ) => (
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
      <InputBase {...props} ref={ref} />
    </InputContainer>
  ),
);

TextField.displayName = 'TextField';
