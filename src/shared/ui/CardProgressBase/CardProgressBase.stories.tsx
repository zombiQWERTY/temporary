import type { Meta, StoryObj } from '@storybook/react';

import { CardProgressBase } from '@/shared/ui';

const meta = {
  title: '@shared/ui/CardProgressBase',
  component: CardProgressBase,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    title: 'Сomplete verification',
    subTitle: 'SubTitle',
    progress: 80,
    progressTitle: 'Step 5 of 8',
  },
} satisfies Meta<typeof CardProgressBase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CardProgressBaseStory: Story = {
  args: { href: '#' },
};
