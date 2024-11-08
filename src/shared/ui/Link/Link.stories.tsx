import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { Link } from '@/shared/ui';

const meta = {
  title: '@shared/ui/Link',
  component: Link,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    href: '#',
    onClick: fn(),
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LinkStory: Story = {
  args: {
    children: 'Link',
  },
};

export const LinkDisabledStory: Story = {
  args: {
    children: 'Link',
    disabled: true,
  },
};
