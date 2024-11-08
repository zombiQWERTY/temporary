import { Stack, Typography, type SvgIconProps, Divider } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import { mono } from '@/shared/theme';

import * as Icons from '@/shared/ui/Icons/LinearIcons';

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

export const LinearIconsStory: Story = {
  render: () => (
    <Stack gap={4}>
      {sizes.map((size) => (
        <Stack gap={2} key={size}>
          {Object.entries(Icons).map(([name, Icon]) => (
            <Stack
              key={name}
              direction="row"
              gap={2}
              alignItems="center"
              color={mono[400]}
            >
              <Icon fontSize={size} />
              <Typography variant="BodyMSemiBold" color={mono[800]}>
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
