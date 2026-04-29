import { Close, Save } from '@mui/icons-material';
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
import React, { useState } from 'react';

import type { Loan, LoanStatus } from '@/lib/api/types';
import { useUpdateLoanStatusMutation } from '@/store/api';

interface StatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
  loan: Loan | null;
}

const STATUS_OPTIONS: { value: LoanStatus; label: string; description: string }[] = [
  { value: 'pending', label: 'Pending', description: 'Application is under review' },
  { value: 'in-review', label: 'In Review', description: 'Application is being reviewed' },
  { value: 'approved', label: 'Approved', description: 'Application has been approved' },
  { value: 'rejected', label: 'Rejected', description: 'Application has been rejected' },
];

const getStatusColor = (
  status: string,
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'in-review':
      return 'info';
    default:
      return 'default';
  }
};

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ open, onClose, loan }) => {
  const [updateLoanStatus, { isLoading: isSubmitting }] = useUpdateLoanStatusMutation();
  const [status, setStatus] = useState<LoanStatus>('pending');
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleStatusChange = (event: { target: { value: unknown } }) => {
    setStatus(event.target.value as LoanStatus);
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNote(event.target.value);
    if (validationError) setValidationError('');
  };

  const resetState = () => {
    setStatus('pending');
    setNote('');
    setValidationError('');
    setSubmitError('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!loan) return;
    if (!note.trim()) {
      setValidationError('Notes are required for status updates');
      return;
    }
    try {
      await updateLoanStatus({ loanId: loan.id, status, note }).unwrap();
      handleClose();
    } catch {
      setSubmitError('Failed to update status. Please try again.');
    }
  };

  if (!loan) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
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
            aria-label="close"
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
              {loan.applicantName}
            </Typography>
            <Chip label={loan.referenceNumber} size="small" color="primary" variant="outlined" />
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

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        {/* Status Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="status-select-label">New Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={status}
            label="New Status"
            onChange={handleStatusChange}
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
        </FormControl>

        {/* Notes Field */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Notes (Required)"
          placeholder="Provide details about this status update..."
          value={note}
          onChange={handleNotesChange}
          error={!!validationError}
          helperText={validationError || `${note.length}/500 characters`}
          inputProps={{ maxLength: 500 }}
          sx={{ mb: 2 }}
        />

        {/* Warning for status changes */}
        {status !== loan.status && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              You are about to change the status from <strong>{loan.status}</strong> to{' '}
              <strong>{status}</strong>. This action will be recorded with your notes.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Save />}
          disabled={isSubmitting || !note.trim()}
          sx={{ minWidth: 120 }}
        >
          {isSubmitting ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusUpdateModal;
