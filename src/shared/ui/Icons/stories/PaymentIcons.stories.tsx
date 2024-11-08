import { Stack, Typography, type SvgIconProps, Divider } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import * as Icons from '@/shared/ui/Icons/PaymentIcons';

const sizes: SvgIconProps['fontSize'][] = ['small', 'medium', 'large'];

const meta = {
  title: '@shared/ui/Icons',
  parameters: {
    layout: 'centered',
  },
  args: {},
} satisfies Meta<typeof Icons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PaymentIconsStory: Story = {
  render: () => (
    <Stack gap={4}>
      {sizes.map((size) => (
        <Stack gap={2} key={size}>
          {Object.entries(Icons).map(([name, Icon]) => (
            <Stack key={name} direction="row" gap={2} alignItems="center">
              <Icon fontSize={size} />
              <Typography variant="BodyMSemiBold">
                &lt;{name} fontSize=&quot;{size}&quot;/&gt;
              </Typography>
            </Stack>
          ))}
          <Divider />
        </Stack>
      ))}
    </Stack>
  ),
};
