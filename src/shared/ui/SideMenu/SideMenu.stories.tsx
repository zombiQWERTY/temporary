import type { Meta, StoryObj } from '@storybook/react';

import {
  SideMenu,
  CardTransferIcon,
  PlugsConnectedIcon,
  DashboardFilledIcon,
  QuestionCircleIcon,
} from '@/shared/ui';

const meta = {
  title: '@shared/ui/SideMenu',
  component: SideMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    items: [
      {
        name: 'Item 1',
        href: '#',
        icon: <CardTransferIcon />,
      },
      {
        name: 'Item 2',
        href: '#',
        icon: <PlugsConnectedIcon />,
      },
      {
        name: 'long text Item 34 4234sdf sdf',
        href: '#',
        icon: <DashboardFilledIcon />,
      },
      {
        name: 'Item 9',
        href: '#',
        icon: <QuestionCircleIcon />,
      },
    ],
    //onChange: fn(),
  },
} satisfies Meta<typeof SideMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SideMenuStory: Story = {
  args: {},
};
