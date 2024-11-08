import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { InputPassword } from '@/shared/ui';

const meta = {
  title: '@shared/ui/InputPassword',
  component: InputPassword,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['standard', 'filled'],
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
} satisfies Meta<typeof InputPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InputPasswordStory: Story = {
  args: {},
};
