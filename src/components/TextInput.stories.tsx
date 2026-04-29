import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';
import { useState } from 'react';

import TextInput from './TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof TextInput>;

const ControlledTextInput = (args: ComponentProps<typeof TextInput>) => {
  const [value, setValue] = useState<string | number>(args.value ?? '');
  return <TextInput {...args} value={value} onChange={(e) => setValue(e.target.value)} />;
};

export const Default: Story = {
  render: (args) => <ControlledTextInput {...args} />,
  args: { name: 'fullName', label: 'Full name', value: '' },
};

export const Required: Story = {
  render: (args) => <ControlledTextInput {...args} />,
  args: { name: 'fullName', label: 'Full name', value: '', required: true },
};

export const Disabled: Story = {
  render: (args) => <ControlledTextInput {...args} />,
  args: { name: 'fullName', label: 'Full name', value: 'Alex Demo', disabled: true },
};

export const WithError: Story = {
  render: (args) => <ControlledTextInput {...args} />,
  args: {
    name: 'fullName',
    label: 'Full name',
    value: '',
    error: true,
    helperText: 'Full name is required',
  },
};

export const Numeric: Story = {
  render: (args) => <ControlledTextInput {...args} />,
  args: { name: 'amount', label: 'Loan amount', value: 50000, type: 'number' },
};
