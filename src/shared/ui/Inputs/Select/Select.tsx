import {
  MenuItem,
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  Stack,
  Typography,
} from '@mui/material';
import { forwardRef, ReactNode } from 'react';

import { CheckIcon, CaretDownIcon, SingleCheckbox } from '@/shared/ui';
import { InputContainer, InputContainerProps } from '../InputContainer';

type MakeOption<T extends number | string> =
  | {
      id: T;
      label: string | number;
      children?: never;
    }
  | {
      id: T;
      label?: never;
      children: ReactNode;
    };

export type BaseOption = MakeOption<number | string>;

export type SelectProps = {
  options?: BaseOption[];
} & InputContainerProps &
  MuiSelectProps<BaseOption['id'] | BaseOption['id'][]>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { options, formHelperText, label, error, variant, ...props }: SelectProps,
    ref,
  ) => (
    <InputContainer
      label={label}
      formHelperText={formHelperText}
      error={error}
      required={props.required}
      fullWidth={props.fullWidth}
      variant={variant}
    >
      <MuiSelect
        ref={ref}
        variant={variant}
        IconComponent={(props) => <CaretDownIcon {...props} fontSize="small" />}
        displayEmpty={true}
        renderValue={(selected) => {
          if (Array.isArray(selected)) {
            if (selected?.length === 0) {
              return (
                <Typography variant="BodySRegular" color="grey.300">
                  {props.placeholder}
                </Typography>
              );
            }

            return (
              <>
                {options
                  ?.filter((item) => selected.includes(item.id))
                  .map((item) => item.label)
                  ?.join(', ')}
              </>
            );
          }

          if (!selected) {
            return (
              <Typography variant="BodyMRegular" color="grey.300">
                {props.placeholder}
              </Typography>
            );
          }
          return (
            <>
              {options?.find((option) => option.id === selected)?.label ?? ''}
            </>
          );
        }}
        {...props}
      >
        {options?.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {Array.isArray(props.value) ? (
              <Stack direction="row" gap={3}>
                <SingleCheckbox
                  checked={props.value?.includes(option.id)}
                  size="small"
                />

                {option.children ? option.children : option.label}
              </Stack>
            ) : (
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                {option.children ? option.children : option.label}

                {option.id === props.value && (
                  <CheckIcon color="primary" fontSize="large" />
                )}
              </Stack>
            )}
          </MenuItem>
        ))}
      </MuiSelect>
    </InputContainer>
  ),
);

Select.displayName = 'Select';
