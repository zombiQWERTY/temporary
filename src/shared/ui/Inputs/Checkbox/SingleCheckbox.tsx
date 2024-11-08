import {
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
} from '@mui/material';

import { forwardRef } from 'react';
import { CheckboxCheckedIcon, CheckboxIcon } from '@/shared/ui';

export interface SingleCheckboxProps extends MuiCheckboxProps {}

export const SingleCheckbox = forwardRef<
  HTMLButtonElement,
  SingleCheckboxProps
>((props, ref) => (
  <MuiCheckbox
    {...props}
    ref={ref}
    icon={<CheckboxIcon fontSize="large" backgroundColor="grey.50" />}
    checkedIcon={<CheckboxCheckedIcon fontSize="large" />}
  />
));

SingleCheckbox.displayName = 'SingleCheckbox';
