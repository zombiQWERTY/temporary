import { FormGroup, FormControlLabel, Grid } from '@mui/material';
import { ChangeEvent, forwardRef } from 'react';

import { SingleCheckbox, BaseOption } from '@/shared/ui';
import { InputContainer, InputContainerProps } from '../InputContainer';

export type CheckboxGroupProps = {
  options?: BaseOption[];
} & InputContainerProps & {
    value?: BaseOption['id'][];
    onChange?: (value?: BaseOption['id'][]) => void;
  };

export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ options = [], value = [], onChange, ...props }, ref) => {
    const handleChange =
      (id: BaseOption['id']) =>
      (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        if (checked) {
          onChange?.([...value, id]);
          return;
        }

        onChange?.(value.filter((item) => item !== id));
      };

    return (
      <InputContainer {...props}>
        <FormGroup>
          <Grid container xs={8} rowGap={10}>
            {options.map((option) => (
              <Grid item key={option.id} xs={6}>
                <FormControlLabel
                  ref={ref}
                  control={
                    <SingleCheckbox
                      checked={value.includes(option.id)}
                      onChange={handleChange(option.id)}
                    />
                  }
                  label={option.children || option.label}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </InputContainer>
    );
  },
);

CheckboxGroup.displayName = 'CheckboxGroup';
