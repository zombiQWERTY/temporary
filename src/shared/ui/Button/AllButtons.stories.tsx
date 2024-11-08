import { Button, Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import {
  buttonSizes,
  buttonVariants,
} from '../../theme/components/buttonCustomTheme';

const meta = {
  title: '@shared/ui/Button',
  parameters: {
    layout: 'centered',
  },
  args: {},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const states = ['', 'hover', 'disabled'];

export const ButtonsStory: Story = {
  render: () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        alignItems: 'start',
      }}
    >
      {buttonSizes.map((size) => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '1rem',
            alignItems: 'start',
          }}
          key={size}
        >
          {buttonVariants.map((variant) => (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3rem',
              }}
              key={variant}
            >
              {states.map((state) => (
                <Button
                  key={state}
                  variant={variant}
                  size={size}
                  disabled={state === 'disabled'}
                  id={state === 'hover' ? 'hover' : ''}
                >
                  {size} {variant} {state}
                </Button>
              ))}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  ),
};

ButtonsStory.parameters = {
  pseudo: {
    hover: '#hover',
  },
};
