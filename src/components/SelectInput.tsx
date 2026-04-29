import type { SelectChangeEvent } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: SelectChangeEvent<string | number>) => void;
  options: SelectOption[];
  error?: boolean | undefined;
  helperText?: string | undefined;
  required?: boolean | undefined;
  fullWidth?: boolean | undefined;
  disabled?: boolean | undefined;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  error = false,
  helperText = '',
  required = false,
  fullWidth = true,
  disabled = false,
}) => {
  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      required={required}
      margin="normal"
      disabled={disabled}
    >
      <InputLabel>{label}</InputLabel>
      <Select<string | number> name={name} value={value} onChange={onChange} label={label}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default SelectInput;
