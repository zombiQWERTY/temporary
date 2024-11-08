'use client';
import { IconButton } from '@mui/material';
import { useState, forwardRef } from 'react';

import { TextField, TextFieldProps, ShowIcon, HideIcon } from '@/shared/ui';

export interface InputPasswordProps extends Omit<TextFieldProps, 'type'> {}

export const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(
  ({ ...props }, ref) => {
    const [isShowPassword, setShowPassword] = useState(false);

    const handleClickIcon = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <TextField
        type={isShowPassword ? 'text' : 'password'}
        {...props}
        ref={ref}
        endAdornment={
          <IconButton
            onClick={handleClickIcon}
            size="extraSmall"
            color="primary"
          >
            {isShowPassword ? <ShowIcon /> : <HideIcon />}
          </IconButton>
        }
      />
    );
  },
);

InputPassword.displayName = 'InputPassword';
