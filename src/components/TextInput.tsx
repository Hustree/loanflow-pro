import { TextField } from '@mui/material';
import React from 'react';

export interface TextInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean | undefined;
  helperText?: string | undefined;
  type?: string | undefined;
  required?: boolean | undefined;
  fullWidth?: boolean | undefined;
  disabled?: boolean | undefined;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  name,
  value,
  onChange,
  error = false,
  helperText = '',
  type = 'text',
  required = false,
  fullWidth = true,
  disabled = false,
}) => {
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      type={type}
      required={required}
      fullWidth={fullWidth}
      disabled={disabled}
      variant="outlined"
      size="medium"
      margin="normal"
    />
  );
};

export default TextInput;
