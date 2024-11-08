import {
  InputLabel,
  FormHelperText,
  FormControl,
  FormControlOwnProps,
} from '@mui/material';
import { ReactNode } from 'react';

export interface InputContainerProps extends FormControlOwnProps {
  label?: ReactNode;
  formHelperText?: string;
}

export const InputContainer = ({
  label,
  children,
  formHelperText,
  ...props
}: InputContainerProps) => (
  <FormControl {...props}>
    {label && (
      <InputLabel
        shrink={props.variant === 'standard' ? true : undefined}
        variant={props.variant}
      >
        {label}
      </InputLabel>
    )}

    <>{children}</>

    {formHelperText && <FormHelperText>{formHelperText}</FormHelperText>}
  </FormControl>
);
