import { Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import { TextField, TextFieldProps } from '@/shared/ui';

const states = ['', 'value', 'disabled', 'error'];

const variants: TextFieldProps['variant'][] = ['standard', 'filled'];

const meta = {
  title: '@shared/ui/TextField',
  parameters: {
    layout: 'centered',
  },
  args: {},
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTextFieldStory: Story = {
  render: () => (
    <Stack direction="row" gap={4}>
      {variants.map((variant) => (
        <Stack
          key={variant}
          direction="column"
          gap={variant === 'standard' ? 4 : 9}
          sx={{
            mt: variant === 'standard' ? 0 : 5,
          }}
        >
          {states.map((state) => (
            <TextField
              type="text"
              placeholder="placeholder"
              variant={variant}
              key={state}
              label={`label ${state}`}
              formHelperText={`formHelperText ${state}`}
              value={state}
              disabled={state === 'disabled'}
              error={state === 'error'}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  ),
};
