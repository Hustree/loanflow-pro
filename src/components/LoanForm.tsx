import React, { useState } from 'react';
import {
  Box,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material';
import TextInput from './inputs/TextInput';
import SelectInput from './inputs/SelectInput';
import FileUpload from './inputs/FileUpload';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addLoan, clearError } from '../store/loanSlice';
import { CreateLoanPayloadSchema, loanApplicationInputSchema } from '../schema/loan';
import { LOAN_TYPES, LOAN_TERMS, DISBURSEMENT_MODES } from '../utils/constants';
import { generateReferenceNumber } from '../utils/refNumber';
import { ZodError } from 'zod';

interface LoanFormProps {
  onSuccess?: (referenceNumber: string) => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.loan);

  const [formData, setFormData] = useState<Partial<CreateLoanPayloadSchema>>({
    name: '',
    pnpBfpId: '',
    type: undefined,
    amount: 0,
    term: undefined,
    monthlyIncome: 0,
    disbursementMode: undefined,
    uploadedFileName: undefined,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processedValue = ['amount', 'monthlyIncome'].includes(name) ? Number(value) : value;
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Clear Redux error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    const processedValue = name === 'term' ? Number(value) : value;
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) {
      dispatch(clearError());
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, disbursementMode: e.target.value as any }));
    if (validationErrors.disbursementMode) {
      setValidationErrors((prev) => ({ ...prev, disbursementMode: '' }));
    }
    if (error) {
      dispatch(clearError());
    }
  };

  const handleFileSelect = (file: File | null) => {
    setFormData((prev) => ({ 
      ...prev, 
      uploadedFileName: file?.name || undefined 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate using Zod schema
      const validatedData = loanApplicationInputSchema.parse(formData);
      
      // Dispatch the action to add loan
      dispatch(addLoan(validatedData));
      
      // Since addLoan generates the reference number internally, we need to generate one here for the callback
      const generatedRef = generateReferenceNumber();
      
      setSubmitSuccess(true);
      setValidationErrors({});
      
      // Reset form
      setFormData({
        name: '',
        pnpBfpId: '',
        type: undefined,
        amount: 0,
        term: undefined,
        monthlyIncome: 0,
        disbursementMode: undefined,
        uploadedFileName: undefined,
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(generatedRef);
      }
      
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle Zod validation errors
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as string;
          fieldErrors[field] = err.message;
        });
        setValidationErrors(fieldErrors);
      } else {
        console.error('Form submission error:', error);
      }
    }
  };

  const handleCloseSuccess = () => {
    setSubmitSuccess(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
      {submitSuccess && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          onClose={handleCloseSuccess}
        >
          Loan application submitted successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextInput
        label="Full Name"
        name="name"
        value={formData.name || ''}
        onChange={handleTextChange}
        error={!!validationErrors.name}
        helperText={validationErrors.name}
        required
        disabled={isLoading}
      />
      
      <TextInput
        label="PNP/BFP ID Number"
        name="pnpBfpId"
        value={formData.pnpBfpId || ''}
        onChange={handleTextChange}
        error={!!validationErrors.pnpBfpId}
        helperText={validationErrors.pnpBfpId || 'Enter your 6-12 character ID'}
        required
        disabled={isLoading}
      />
      
      <TextInput
        label="Monthly Income"
        name="monthlyIncome"
        type="number"
        value={formData.monthlyIncome || ''}
        onChange={handleTextChange}
        error={!!validationErrors.monthlyIncome}
        helperText={validationErrors.monthlyIncome}
        required
        disabled={isLoading}
      />

      <SelectInput
        label="Loan Type"
        name="type"
        value={formData.type || ''}
        onChange={handleSelectChange}
        options={LOAN_TYPES}
        error={!!validationErrors.type}
        helperText={validationErrors.type}
        required
        disabled={isLoading}
      />
      
      <TextInput
        label="Loan Amount"
        name="amount"
        type="number"
        value={formData.amount || ''}
        onChange={handleTextChange}
        error={!!validationErrors.amount}
        helperText={validationErrors.amount || 'Maximum: ₱500,000'}
        required
        disabled={isLoading}
      />
      
      <SelectInput
        label="Term"
        name="term"
        value={formData.term || ''}
        onChange={handleSelectChange}
        options={LOAN_TERMS}
        error={!!validationErrors.term}
        helperText={validationErrors.term}
        required
        disabled={isLoading}
      />
      
      <FormControl
        component="fieldset"
        error={!!validationErrors.disbursementMode}
        required
        sx={{ mt: 2 }}
      >
        <FormLabel component="legend">Disbursement Mode</FormLabel>
        <RadioGroup
          value={formData.disbursementMode || ''}
          onChange={handleRadioChange}
        >
          {DISBURSEMENT_MODES.map((mode) => (
            <FormControlLabel
              key={mode.value}
              value={mode.value}
              control={<Radio />}
              label={mode.label}
            />
          ))}
        </RadioGroup>
        {validationErrors.disbursementMode && (
          <FormHelperText>{validationErrors.disbursementMode}</FormHelperText>
        )}
      </FormControl>
      
      <FileUpload
        onFileSelect={handleFileSelect}
        selectedFile={formData.uploadedFileName ? { name: formData.uploadedFileName } as File : undefined}
        accept=".pdf,.jpg,.jpeg,.png"
        helperText="Upload supporting documents (PDF, JPG, PNG)"
      />

      <Box sx={{ mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          startIcon={<Send />}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? 'Submitting...' : 'Submit Loan Application'}
        </Button>
      </Box>
    </Box>
  );
};

export default LoanForm;