import Box, { BoxProps } from '@mui/material/Box';
import React from 'react';
import { usePinInput, UsePinInputOptions } from '../use-pin-input';

export type InputPinProps = {
  children: Array<React.ReactElement>;
} & Omit<BoxProps, 'children'> &
  Omit<UsePinInputOptions, 'pinLength'>;

export const InputPin = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<InputPinProps>
>(function InputPin(props, ref) {
  const { children, onChange: _, onBlur: __, otp, ...other } = props;
  const { pins } = usePinInput({ ...props, pinLength: children.length, otp });

  return (
    <Box
      ref={ref}
      {...other}
      sx={{
        display: 'flex',
        gap: '0.5rem',
        '& input': {
          textAlign: 'center',
          caretColor: 'transparent',
        },
      }}
    >
      {pins.map((getInputProps, index) => {
        const inputElement = children[index];
        return (
          <React.Fragment key={index}>
            {React.cloneElement(inputElement, {
              inputProps: getInputProps({
                ...inputElement.props.inputProps,
              }),
            })}
          </React.Fragment>
        );
      })}
    </Box>
  );
});
