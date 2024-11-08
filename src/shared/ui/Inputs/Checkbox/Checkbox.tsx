import { FormControlLabel } from '@mui/material';
import { ReactNode, forwardRef } from 'react';

import { SingleCheckbox, SingleCheckboxProps } from '@/shared/ui';
import { InputContainer, InputContainerProps } from '../InputContainer';

export interface CheckboxProps
  extends Omit<InputContainerProps, 'label'>,
    Omit<SingleCheckboxProps, 'margin' | 'classes' | 'color' | 'size'> {
  label: ReactNode;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ formHelperText, label, margin, error, ...props }, ref) => (
    <InputContainer
      formHelperText={formHelperText}
      error={error}
      margin={margin}
      required={props.required}
      fullWidth={props.fullWidth}
    >
      <FormControlLabel
        control={<SingleCheckbox {...props} ref={ref} />}
        label={label}
      />
    </InputContainer>
  ),
);

Checkbox.displayName = 'Checkbox';
