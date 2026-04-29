import type { SelectChangeEvent } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';
import { useState } from 'react';

import SelectInput from './SelectInput';

const loanTypeOptions = [
  { value: 'Emergency', label: 'Emergency' },
  { value: 'Salary', label: 'Salary' },
  { value: 'Others', label: 'Others' },
];

const termOptions = [
  { value: 12, label: '12 months' },
  { value: 24, label: '24 months' },
  { value: 36, label: '36 months' },
  { value: 48, label: '48 months' },
];

const meta: Meta<typeof SelectInput> = {
  title: 'Components/SelectInput',
  component: SelectInput,
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

type Story = StoryObj<typeof SelectInput>;

const ControlledSelectInput = (args: ComponentProps<typeof SelectInput>) => {
  const [value, setValue] = useState<string | number>(args.value ?? '');
  return (
    <SelectInput
      {...args}
      value={value}
      onChange={(e: SelectChangeEvent<string | number>) => setValue(e.target.value)}
    />
  );
};

export const Default: Story = {
  render: (args) => <ControlledSelectInput {...args} />,
  args: { name: 'loanType', label: 'Loan type', value: '', options: loanTypeOptions },
};

export const Required: Story = {
  render: (args) => <ControlledSelectInput {...args} />,
  args: {
    name: 'loanType',
    label: 'Loan type',
    value: '',
    options: loanTypeOptions,
    required: true,
  },
};

export const Disabled: Story = {
  render: (args) => <ControlledSelectInput {...args} />,
  args: {
    name: 'loanType',
    label: 'Loan type',
    value: 'Salary',
    options: loanTypeOptions,
    disabled: true,
  },
};

export const WithError: Story = {
  render: (args) => <ControlledSelectInput {...args} />,
  args: {
    name: 'loanType',
    label: 'Loan type',
    value: '',
    options: loanTypeOptions,
    error: true,
    helperText: 'Please select a loan type',
  },
};

export const NumericOptions: Story = {
  render: (args) => <ControlledSelectInput {...args} />,
  args: { name: 'term', label: 'Term', value: 12, options: termOptions },
};
