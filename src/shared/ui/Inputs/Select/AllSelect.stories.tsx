import { Grid } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import { Select, SelectProps, BaseOption } from '@/shared/ui';

const states = ['', 'value', 'disabled', 'error'];

const options: BaseOption[] = [
  {
    id: '11',
    label: 'label 1',
  },
  { id: '2', label: 'label 2' },
  { id: '3', label: 'label 3' },
  { id: '4', label: 'label 4' },
  { id: '555', label: 'label 5' },
  { id: '6', label: 'label 6' },
  { id: '7', label: 'label 7' },
];

const variants: SelectProps['variant'][] = ['standard', 'filled'];

const meta = {
  title: '@shared/ui/Select',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllSelectStory: Story = {
  render: () => (
    <Grid container columnSpacing={2} rowGap={4}>
      {states.map((state) =>
        variants.map((variant) => (
          <Grid
            item
            xs={6}
            key={`${variant}-${state}`}
            direction="column"
            gap={4}
            pt={variant === 'standard' ? 0 : 5}
          >
            <Select
              variant={variant}
              name={state}
              label={`label ${state}`}
              placeholder="placeholder"
              disabled={state === 'disabled'}
              error={state === 'error'}
              formHelperText={`description ${state}`}
              onChange={console.log}
              options={options}
              value={options[1].id}
              fullWidth
            />
          </Grid>
        )),
      )}
    </Grid>
  ),
};

export const AllMultiSelectStory: Story = {
  render: () => (
    <Grid container columnSpacing={2} rowGap={4}>
      {states.map((state) =>
        variants.map((variant) => (
          <Grid
            item
            xs={6}
            key={`${variant}-${state}`}
            direction="column"
            gap={4}
            pt={variant === 'standard' ? 0 : 5}
          >
            <Select
              variant={variant}
              name={state}
              label={`label - ${state}`}
              placeholder="placeholder"
              disabled={state === 'disabled'}
              error={state === 'error'}
              formHelperText={`description ${state}`}
              onChange={console.log}
              options={options}
              multiple
              value={[options[1].id, options[2].id, options[4].id]}
              fullWidth
            />
          </Grid>
        )),
      )}
    </Grid>
  ),
};
