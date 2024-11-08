import { Radio as MuiRadio, RadioProps as MuiRadiosProps } from '@mui/material';

import { mono } from '@/shared/theme';
import { RadioCheckedIcon, RadioIcon } from '@/shared/ui';

export interface RadioProps extends MuiRadiosProps {}

export const Radio = (props: RadioProps) => (
  <MuiRadio
    {...props}
    icon={<RadioIcon fontSize="large" backgroundColor={mono[50]} />}
    checkedIcon={<RadioCheckedIcon fontSize="large" />}
  />
);
