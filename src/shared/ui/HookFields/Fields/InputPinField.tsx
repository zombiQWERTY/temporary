'use client';

import {
  FormHelperText,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import { FieldValues, useController } from 'react-hook-form';
import { InputPin, InputPinProps } from '@/shared/ui/Inputs';
import { HookFieldProps } from '../types';

export interface InputPinFieldProps
  extends HookFieldProps<FieldValues, string>,
    Omit<InputPinProps, 'defaultValue' | 'name' | 'ref' | 'children'> {}

export const InputPinField = ({ name, ...props }: InputPinFieldProps) => {
  const {
    field: { ref: _, ...field },
    formState: { errors },
  } = useController({ name });

  const sx = {
    backgroundColor: 'grey.50',
    width: '64px',
    height: '72px',
    '.MuiOutlinedInput-input': {
      fontSize: '40px',
      color: errors[name]?.message ? 'error.main' : 'common.black',
    },
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: errors[name]?.message ? 'error.main' : 'mono.100',
    },
  };

  return (
    <Stack sx={{ position: 'relative' }}>
      <InputPin {...field} {...props} otp>
        <OutlinedInput sx={sx} />
        <OutlinedInput sx={sx} />
        <OutlinedInput sx={sx} />
        <OutlinedInput sx={sx} />
        <OutlinedInput sx={sx} />
        <OutlinedInput sx={sx} />
      </InputPin>
      {errors[name] && (
        <FormHelperText
          error={!!errors[name]?.message}
          sx={{
            mt: '6px',
            display: 'flex',
            gap: '5px',
            alignItems: 'center',
            fontSize: '11px',
          }}
        >
          <Typography component="span" color={'error.main'} fontSize={11}>
            {errors[name]?.message as string}
          </Typography>
        </FormHelperText>
      )}
    </Stack>
  );
};
