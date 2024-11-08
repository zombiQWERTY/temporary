import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { SingleCheckbox } from '@/shared/ui';

const meta = {
  title: '@shared/ui/Checkbox',
  component: SingleCheckbox,
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
} satisfies Meta<typeof SingleCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    checked: true,
  },
};
