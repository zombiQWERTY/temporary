import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { Select } from '@/shared/ui';

const meta = {
  title: '@shared/ui/Select',
  component: Select,
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
    fullWidth: {
      control: { type: 'boolean' },
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
    options: [
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
    ],
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectStory: Story = {
  args: {
    multiple: false,
  },
};

export const MultipleSelectStory: Story = {
  args: {
    multiple: true,
    value: ['2', '7'],
  },
};
