import { Typography, Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import { typographyCustomTheme } from '@/shared/theme/components';

const meta = {
  title: '@shared/ui/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: Object.keys(typographyCustomTheme),
    },
  },
  args: {},
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypographyStory: Story = {
  args: {
    variant: 'Heading01',
    children: 'Typography',
  },
};

export const AllVariantsTypographiesStory: Story = {
  render: () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1em',
      }}
    >
      {Object.keys(typographyCustomTheme).map((variant) => (
        <Typography key={variant} variant={variant}>
          {variant}
        </Typography>
      ))}
    </Box>
  ),
};
