import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useState } from 'react';

import { InputPhone } from '@/shared/ui';

const meta = {
  title: '@shared/ui/InputPhone',
  component: InputPhone,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: { type: 'boolean' },
    },
    variant: {
      control: { type: 'select' },
      options: ['standard', 'filled'],
      value: 'standard',
    },
  },
  args: {
    label: 'label phone',
    formHelperText: 'Some important text',
    placeholder: 'placeholder',
    value: '',
    onFocus: fn(),
    onBlur: fn(),
    onChange: fn(),
    onPaste: fn(),
  },
} satisfies Meta<typeof InputPhone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InputPhoneStory: Story = {
  args: {},
};

export const InputPhonePlayStory: Story = {
  args: {},
  render: (args) => {
    const [value, setValue] = useState('');

    const setVal = (value: string) => setValue(value);

    return <InputPhone {...args} value={value} onChange={setVal} />;
  },
};
