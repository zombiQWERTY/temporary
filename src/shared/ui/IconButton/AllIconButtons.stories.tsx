import { IconButton, Box, IconButtonProps } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import { CaretLeftIcon } from '@/shared/ui';

const variants: IconButtonProps['variant'][] = [
  'standard',
  'outlineSquare',
  'outlineRound',
  'filledSquare',
  'filledRound',
];

const sizes: IconButtonProps['size'][] = [
  'extraLarge',
  'large',
  'medium',
  'small',
  'extraSmall',
];

const meta = {
  title: '@shared/ui/IconButton',
  parameters: {
    layout: 'centered',
  },
  args: {},
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IconButtonsStory: Story = {
  render: () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        alignItems: 'start',
      }}
    >
      {variants.map((variant) => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '1rem',
            alignItems: 'start',
          }}
          key={variant}
        >
          {sizes.map((size) => (
            <IconButton key={size} variant={variant} size={size}>
              <CaretLeftIcon />
            </IconButton>
          ))}
        </Box>
      ))}
    </Box>
  ),
};
