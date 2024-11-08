import { Typography, Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import { red, blue, green, mono } from './colors';

const meta = {
  title: '@shared/ui/Colors',
  parameters: {
    layout: 'centered',
  },
  args: {},
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

const ColorBoxes = ({
  color,
  title,
}: {
  color: { [key: number]: string };
  title: string;
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1em',
    }}
  >
    {Object.keys(color).map((weight) => (
      <Box
        key={weight}
        sx={{
          p: 1,
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
        }}
      >
        <Box
          width="4em"
          height="4em"
          style={{
            background: color[Number(weight)],
          }}
        ></Box>
        <Typography variant="caption">
          {title} {weight}
        </Typography>
      </Box>
    ))}
  </Box>
);

export const ColorsStory: Story = {
  render: () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '1em',
        m: 2,
      }}
    >
      <ColorBoxes color={blue} title="blue" />
      <ColorBoxes color={red} title="red" />
      <ColorBoxes color={green} title="green" />
      <ColorBoxes color={mono} title="mono" />
    </Box>
  ),
};
