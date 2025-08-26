import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import { Send, ExitToApp } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material';
import TextInput from '../components/inputs/TextInput';
import SelectInput from '../components/inputs/SelectInput';
import FileUpload from '../components/inputs/FileUpload';
import SummaryCard from '../components/common/SummaryCard';
import { LoanApplication } from '../types/loan';
import { validateLoanForm } from '../utils/validators';
import { generateReferenceNumber } from '../utils/refNumber';
import { LOAN_TYPES, LOAN_TERMS, DISBURSEMENT_MODES } from '../utils/constants';
import { useAppDispatch } from '../store/hooks';
import { addLoan } from '../store/loanSlice';
import { CreateLoanPayloadSchema } from '../schema/loan';
import axios from 'axios';

const LoanApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [formData, setFormData] = useState<Partial<LoanApplication>>({
    fullName: '',
    pnpBfpId: '',
    loanType: undefined,
    loanAmount: 0,
    term: undefined,
    monthlyIncome: 0,
    disbursementMode: undefined,
    uploadedFile: undefined,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = ['Personal Info', 'Loan Details', 'Review & Submit'];

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processedValue = ['loanAmount', 'monthlyIncome'].includes(name) ? Number(value) : value;
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    const processedValue = name === 'term' ? Number(value) : value;
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, disbursementMode: e.target.value as any }));
    if (errors.disbursementMode) {
      setErrors((prev) => ({ ...prev, disbursementMode: '' }));
    }
  };

  const handleFileSelect = (file: File | null) => {
    setFormData((prev) => ({ ...prev, uploadedFile: file || undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateLoanForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const submissionData: LoanApplication = {
        ...formData as LoanApplication,
        referenceNumber: generateReferenceNumber(),
        submissionDate: new Date(),
      };

      // Convert to Redux-compatible format
      const reduxPayload: CreateLoanPayloadSchema = {
        name: submissionData.fullName,
        pnpBfpId: submissionData.pnpBfpId,
        amount: submissionData.loanAmount,
        type: submissionData.loanType,
        term: submissionData.term,
        monthlyIncome: submissionData.monthlyIncome,
        disbursementMode: submissionData.disbursementMode,
        uploadedFileName: submissionData.uploadedFile?.name,
      };

      // Dispatch to Redux store
      dispatch(addLoan(reduxPayload));

      // Log to console
      console.log('Loan Application Submitted:', submissionData);

      // Submit to httpbin for demo
      const response = await axios.post('https://httpbin.org/post', submissionData);
      console.log('API Response:', response.data);

      setFormData((prev) => ({
        ...prev,
        referenceNumber: submissionData.referenceNumber,
        submissionDate: submissionData.submissionDate,
      }));
      
      setSubmitSuccess(true);
      setShowSummary(true);
      setActiveStep(2);
    } catch (error) {
      setSubmitError('Failed to submit loan application. Please try again.');
      console.error('Submission error:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('username');
    navigate('/login');
  };

  const handleNext = () => {
    // Validate current step
    let stepErrors: Record<string, string> = {};
    
    if (activeStep === 0) {
      // Validate personal info
      if (!formData.fullName?.trim()) stepErrors.fullName = 'Full name is required';
      if (!formData.pnpBfpId?.trim()) stepErrors.pnpBfpId = 'PNP/BFP ID is required';
      if (!formData.monthlyIncome || formData.monthlyIncome <= 0) stepErrors.monthlyIncome = 'Monthly income is required';
    } else if (activeStep === 1) {
      // Validate loan details
      if (!formData.loanType) stepErrors.loanType = 'Loan type is required';
      if (!formData.loanAmount || formData.loanAmount <= 0) stepErrors.loanAmount = 'Loan amount is required';
      if (!formData.term) stepErrors.term = 'Term is required';
      if (!formData.disbursementMode) stepErrors.disbursementMode = 'Disbursement mode is required';
    }
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <TextInput
              label="Full Name"
              name="fullName"
              value={formData.fullName || ''}
              onChange={handleTextChange}
              error={!!errors.fullName}
              helperText={errors.fullName}
              required
            />
            
            <TextInput
              label="PNP/BFP ID Number"
              name="pnpBfpId"
              value={formData.pnpBfpId || ''}
              onChange={handleTextChange}
              error={!!errors.pnpBfpId}
              helperText={errors.pnpBfpId || 'Enter your 6-12 character ID'}
              required
            />
            
            <TextInput
              label="Monthly Income"
              name="monthlyIncome"
              type="number"
              value={formData.monthlyIncome || ''}
              onChange={handleTextChange}
              error={!!errors.monthlyIncome}
              helperText={errors.monthlyIncome}
              required
            />
          </>
        );
        
      case 1:
        return (
          <>
            <SelectInput
              label="Loan Type"
              name="loanType"
              value={formData.loanType || ''}
              onChange={handleSelectChange}
              options={LOAN_TYPES}
              error={!!errors.loanType}
              helperText={errors.loanType}
              required
            />
            
            <TextInput
              label="Loan Amount"
              name="loanAmount"
              type="number"
              value={formData.loanAmount || ''}
              onChange={handleTextChange}
              error={!!errors.loanAmount}
              helperText={errors.loanAmount || 'Maximum: ₱500,000'}
              required
            />
            
            <SelectInput
              label="Term"
              name="term"
              value={formData.term || ''}
              onChange={handleSelectChange}
              options={LOAN_TERMS}
              error={!!errors.term}
              helperText={errors.term}
              required
            />
            
            <FormControl
              component="fieldset"
              error={!!errors.disbursementMode}
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
              {errors.disbursementMode && (
                <FormHelperText>{errors.disbursementMode}</FormHelperText>
              )}
            </FormControl>
            
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={formData.uploadedFile}
              accept=".pdf,.jpg,.jpeg,.png"
              helperText="Upload supporting documents (PDF, JPG, PNG)"
            />
          </>
        );
        
      case 2:
        return (
          <>
            {!showSummary ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Review Your Application
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Please review all information before submitting
                </Typography>
                
                <Box sx={{ mt: 3, textAlign: 'left' }}>
                  <Typography variant="subtitle2" gutterBottom>Personal Information:</Typography>
                  <Typography variant="body2">Name: {formData.fullName}</Typography>
                  <Typography variant="body2">ID: {formData.pnpBfpId}</Typography>
                  <Typography variant="body2" gutterBottom>Monthly Income: ₱{formData.monthlyIncome?.toLocaleString()}</Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Loan Details:</Typography>
                  <Typography variant="body2">Type: {formData.loanType}</Typography>
                  <Typography variant="body2">Amount: ₱{formData.loanAmount?.toLocaleString()}</Typography>
                  <Typography variant="body2">Term: {formData.term} months</Typography>
                  <Typography variant="body2">Disbursement: {formData.disbursementMode}</Typography>
                  {formData.uploadedFile && (
                    <Typography variant="body2">File: {formData.uploadedFile.name}</Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Box>
                {submitSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Loan application submitted successfully!
                  </Alert>
                )}
                <SummaryCard loanData={formData as LoanApplication} />
              </Box>
            )}
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography component="h1" variant="h4">
            PSSLAI Loan Application
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleLogout}
            startIcon={<ExitToApp />}
          >
            Logout
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {renderStepContent()}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0 || showSummary}
                onClick={handleBack}
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                !showSummary ? (
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Send />}
                  >
                    Submit Application
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => window.location.reload()}
                  >
                    New Application
                  </Button>
                )
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoanApplicationPage;