import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';
import { useState } from 'react';

import FileUpload from './FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'Components/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof FileUpload>;

const ControlledFileUpload = (args: ComponentProps<typeof FileUpload>) => {
  const [file, setFile] = useState<File | null>(args.selectedFile ?? null);
  return <FileUpload {...args} selectedFile={file} onFileSelect={setFile} />;
};

const sampleFile = new File(['demo content'], 'payslip.pdf', { type: 'application/pdf' });

export const Default: Story = {
  render: (args) => <ControlledFileUpload {...args} />,
  args: { accept: '*' },
};

export const PdfOnly: Story = {
  render: (args) => <ControlledFileUpload {...args} />,
  args: { accept: 'application/pdf', helperText: 'PDF files only' },
};

export const WithSelectedFile: Story = {
  render: (args) => <ControlledFileUpload {...args} />,
  args: { selectedFile: sampleFile },
};

export const WithError: Story = {
  render: (args) => <ControlledFileUpload {...args} />,
  args: { error: true, helperText: 'A supporting document is required' },
};
