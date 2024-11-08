import type { Meta, StoryObj } from '@storybook/react';

import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: '@shared/ui/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    fullWidthOnMobile: {
      control: { type: 'boolean' },
      description:
        'If true, the logo will be displayed in full width even on mobile devices',
    },
  },
  args: {
    fullWidthOnMobile: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  render: (args) => <Logo {...args} />,
};
