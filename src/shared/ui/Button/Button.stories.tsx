import { Button } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import {
  buttonSizes,
  buttonVariants,
} from '@/shared/theme/components/buttonCustomTheme';

const meta = {
  title: '@shared/ui/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: {
        type: 'select',
      },
      options: buttonSizes,
    },
    variant: {
      control: {
        type: 'select',
      },
      options: buttonVariants,
    },
  },
  args: {
    onClick: fn(),
    children: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    children: 'Button',
    variant: 'main',
    size: 'medium',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Button',
    variant: 'secondary',
    size: 'medium',
  },
};

export const Linear: Story = {
  args: {
    children: 'Button',
    variant: 'linear',
    size: 'medium',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Button',
    variant: 'ghost',
    size: 'medium',
  },
};
