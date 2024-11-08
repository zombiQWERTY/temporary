import { LocalizationProvider as MuiLocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { enGB } from 'date-fns/locale';
import { InputDate } from '@/shared/ui';

const meta = {
  title: '@shared/ui/InputDate',
  component: InputDate,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['standard', 'filled'],
    },
  },
  args: {
    label: 'label',
    formHelperText: 'Some important text',
    placeholder: 'placeholder',
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <MuiLocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={enGB}
      >
        <Story />
      </MuiLocalizationProvider>
    ),
  ],
} satisfies Meta<typeof InputDate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InputDateStory: Story = {
  args: {},
};
