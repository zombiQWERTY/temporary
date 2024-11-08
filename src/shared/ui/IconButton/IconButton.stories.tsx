import { IconButton } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { CaretLeftIcon } from '../Icons';

const meta = {
  title: '@shared/ui/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['extraLarge', 'large', 'medium', 'small', 'extraSmall'],
    },
    variant: {
      control: { type: 'select' },
      options: [
        'standard',
        'outlineSquare',
        'outlineRound',
        'filledSquare',
        'filledRound',
      ],
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  render: (args) => (
    <IconButton {...args}>
      <CaretLeftIcon />
    </IconButton>
  ),
};
