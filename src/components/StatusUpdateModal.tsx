import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { Close, Save, Warning } from '@mui/icons-material';
import { useAppDispatch } from '../store/hooks';
import { updateLoanStatus } from '../store/loanSlice';
import { Loan, StatusUpdateInputSchema, statusUpdateInputSchema, LoanStatusEnum } from '../schema/loan';
import { ZodError } from 'zod';

interface StatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
  loan: Loan | null;
}

const STATUS_OPTIONS: { value: LoanStatusEnum; label: string; description: string }[] = [
  { value: 'pending', label: 'Pending', description: 'Application is under review' },
  { value: 'processing', label: 'Processing', description: 'Application is being processed' },
  { value: 'approved', label: 'Approved', description: 'Application has been approved' },
  { value: 'rejected', label: 'Rejected', description: 'Application has been rejected' },
  { value: 'disbursed', label: 'Disbursed', description: 'Loan amount has been disbursed' },
  { value: 'completed', label: 'Completed', description: 'Loan has been fully repaid' },
];

const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'processing':
      return 'info';
    case 'disbursed':
      return 'primary';
    case 'completed':
      return 'success';
    default:
      return 'default';
  }
};

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ open, onClose, loan }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<StatusUpdateInputSchema>({
    status: 'pending',
    notes: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = (event: any) => {
    const newStatus = event.target.value as LoanStatusEnum;
    setFormData(prev => ({ ...prev, status: newStatus }));
    if (validationErrors.status) {
      setValidationErrors(prev => ({ ...prev, status: '' }));
    }
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const notes = event.target.value;
    setFormData(prev => ({ ...prev, notes }));
    if (validationErrors.notes) {
      setValidationErrors(prev => ({ ...prev, notes: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!loan) return;

    try {
      // Validate using Zod schema
      const validatedData = statusUpdateInputSchema.parse(formData);
      
      setIsSubmitting(true);
      
      // Dispatch the update action
      dispatch(updateLoanStatus({
        id: loan.id!,
        status: validatedData.status,
        notes: validatedData.notes,
      }));

      // Close modal and reset form
      handleClose();
      
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ status: 'pending', notes: '' });
    setValidationErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!loan) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            Update Loan Status
          </Typography>
          <Button
            onClick={handleClose}
            sx={{ minWidth: 'auto', p: 1 }}
            color="inherit"
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* Loan Information */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Loan Details
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" fontWeight="medium">
              {loan.name}
            </Typography>
            <Chip
              label={loan.ref}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Current Status:
            </Typography>
            <Chip
              label={loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              color={getStatusColor(loan.status)}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Status Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="status-select-label">New Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={formData.status}
            label="New Status"
            onChange={handleStatusChange}
            error={!!validationErrors.status}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {option.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
          {validationErrors.status && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {validationErrors.status}
            </Typography>
          )}
        </FormControl>

        {/* Notes Field */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Notes (Required)"
          placeholder="Provide details about this status update..."
          value={formData.notes}
          onChange={handleNotesChange}
          error={!!validationErrors.notes}
          helperText={validationErrors.notes || `${formData.notes.length}/500 characters`}
          inputProps={{ maxLength: 500 }}
          sx={{ mb: 2 }}
        />

        {/* Warning for status changes */}
        {formData.status !== loan.status && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              You are about to change the status from <strong>{loan.status}</strong> to <strong>{formData.status}</strong>. 
              This action will be recorded with your notes.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Save />}
          disabled={isSubmitting || !formData.notes.trim()}
          sx={{ minWidth: 120 }}
        >
          {isSubmitting ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusUpdateModal; 