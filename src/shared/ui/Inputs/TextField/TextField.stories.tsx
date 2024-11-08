import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { TextField } from '@/shared/ui';

const meta = {
  title: '@shared/ui/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['standard', 'filled'],
      value: 'standard',
    },
  },
  args: {
    label: 'label',
    formHelperText: 'Some important text',
    placeholder: 'placeholder',
    onFocus: fn(),
    onBlur: fn(),
    onChange: fn(),
    onInput: fn(),
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextFieldStory: Story = {
  args: {},
};
