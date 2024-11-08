import { InputBase, Stack } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

const states = ['', 'value', 'disabled', 'error'];

const meta = {
  title: '@shared/ui/InputBase',
  parameters: {
    layout: 'centered',
  },
  args: {},
} satisfies Meta<typeof InputBase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllInputBaseStory: Story = {
  render: () => (
    <Stack direction="column" gap={4}>
      {states.map((state) => (
        <InputBase
          type="text"
          key={state}
          placeholder="placeholder"
          value={state}
          disabled={state === 'disabled'}
          error={state === 'error'}
        />
      ))}
    </Stack>
  ),
};

AllInputBaseStory.parameters = {
  pseudo: {
    hover: '#hover',
    focus: '#focus',
  },
};
