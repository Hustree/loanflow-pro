import { Send } from '@mui/icons-material';
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
import type { SelectChangeEvent } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ZodError } from 'zod';

import FileUpload from '@/components/FileUpload';
import SelectInput from '@/components/SelectInput';
import TextInput from '@/components/TextInput';
import { useCreateLoanMutation } from '@/store/api';
import { LOAN_TYPES, LOAN_TERMS, DISBURSEMENT_MODES } from '@/utils/constants';

import type { CreateLoanPayloadSchema } from '../loan.schema';
import { loanApplicationInputSchema } from '../loan.schema';

interface LoanFormProps {
  onSuccess?: (referenceNumber: string) => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [createLoan, { isLoading, error: mutationError }] = useCreateLoanMutation();
  const error =
    mutationError && 'message' in mutationError
      ? (mutationError as { message?: string }).message
      : mutationError
        ? t('apply.failure')
        : null;

  const [formData, setFormData] = useState<Partial<CreateLoanPayloadSchema>>({
    name: '',
    pnpBfpId: '',
    amount: 0,
    monthlyIncome: 0,
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
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    const processedValue = name === 'term' ? Number(value) : value;

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, disbursementMode: e.target.value as any }));
    if (validationErrors.disbursementMode) {
      setValidationErrors((prev) => ({ ...prev, disbursementMode: '' }));
    }
  };

  const handleFileSelect = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      uploadedFileName: file?.name || undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate using Zod schema (local form shape)
      const validatedData = loanApplicationInputSchema.parse(formData);

      // Map local form fields to API contract shape and submit through RTK Query / MSW
      const created = await createLoan({
        applicantName: validatedData.name,
        loanType: validatedData.type,
        amount: validatedData.amount,
        termMonths: validatedData.term,
        purpose: `${validatedData.type} loan via ${validatedData.disbursementMode}`,
      }).unwrap();

      setSubmitSuccess(true);
      setValidationErrors({});

      // Reset form
      setFormData({
        name: '',
        pnpBfpId: '',
        amount: 0,
        monthlyIncome: 0,
      });

      if (onSuccess) {
        onSuccess(created.referenceNumber);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          fieldErrors[field] = issue.message;
        });
        setValidationErrors(fieldErrors);
      } else {
        console.error('Form submission error:', err);
      }
    }
  };

  const handleCloseSuccess = () => {
    setSubmitSuccess(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={handleCloseSuccess}>
          {t('apply.success')}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextInput
        label={t('apply.fields.fullName')}
        name="name"
        value={formData.name || ''}
        onChange={handleTextChange}
        error={!!validationErrors.name}
        helperText={validationErrors.name}
        required
        disabled={isLoading}
      />

      <TextInput
        label={t('apply.fields.pnpBfpId')}
        name="pnpBfpId"
        value={formData.pnpBfpId || ''}
        onChange={handleTextChange}
        error={!!validationErrors.pnpBfpId}
        helperText={validationErrors.pnpBfpId || t('apply.fields.pnpBfpIdHint')}
        required
        disabled={isLoading}
      />

      <TextInput
        label={t('apply.fields.monthlyIncome')}
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
        label={t('apply.fields.loanType')}
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
        label={t('apply.fields.amount')}
        name="amount"
        type="number"
        value={formData.amount || ''}
        onChange={handleTextChange}
        error={!!validationErrors.amount}
        helperText={validationErrors.amount || t('apply.fields.amountHint')}
        required
        disabled={isLoading}
      />

      <SelectInput
        label={t('apply.fields.term')}
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
        <FormLabel component="legend">{t('apply.fields.disbursementMode')}</FormLabel>
        <RadioGroup value={formData.disbursementMode || ''} onChange={handleRadioChange}>
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
        selectedFile={
          formData.uploadedFileName ? ({ name: formData.uploadedFileName } as File) : undefined
        }
        accept=".pdf,.jpg,.jpeg,.png"
        helperText={t('apply.fields.uploadHint')}
      />

      <Box sx={{ mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          startIcon={<Send />}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? t('apply.submitting') : t('apply.submit')}
        </Button>
      </Box>
    </Box>
  );
};

export default LoanForm;
