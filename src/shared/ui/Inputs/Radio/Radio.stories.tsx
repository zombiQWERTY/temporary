import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { Radio } from '@/shared/ui';

const meta = {
  title: '@shared/ui/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: {
        type: 'boolean',
      },
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    checked: true,
  },
};
