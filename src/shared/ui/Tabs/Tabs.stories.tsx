import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import { SyntheticEvent } from 'react';

import { Tabs } from '@/shared/ui';

const meta = {
  title: '@shared/ui/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    value: 1,

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
    //onChange: fn(),
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TabsStory: Story = {
  args: {},
  render: (args) => {
    const [, setArgs] = useArgs();

    const handleChange = (_event: SyntheticEvent, value: number) => {
      setArgs({ value });
    };

    return <Tabs {...args} onChange={handleChange} />;
  },
};
