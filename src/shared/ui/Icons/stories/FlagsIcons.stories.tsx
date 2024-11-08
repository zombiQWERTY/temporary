import { Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import * as Icons from '@/shared/ui/Icons/FlagIcons';

const meta = {
  title: '@shared/ui/Icons',
  parameters: {
    layout: 'centered',
  },
  args: {},
} satisfies Meta<typeof Icons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FlagsIcons: Story = {
  render: () => (
    <Stack gap={2}>
      {Object.entries(Icons).map(([name, Icon]) => (
        <Stack key={name} direction="row" gap={2} alignItems="center">
          <Icon />
          <Typography variant="BodyMSemiBold">&lt;{name} /&gt;</Typography>
        </Stack>
      ))}
    </Stack>
  ),
};
