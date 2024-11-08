import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { IconLink } from '@/shared/ui';
import { CircleWarningIcon, ChevronDownIcon } from '@/shared/ui';

const meta = {
  title: '@shared/ui/Link',
  component: IconLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    href: '#',
    onClick: fn(),
  },
} satisfies Meta<typeof IconLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IconLinkStory: Story = {
  args: {
    children: 'IconLink',
    startAdornment: <CircleWarningIcon fontSize="small" />,
    endAdornment: <ChevronDownIcon fontSize="small" />,
  },
};
