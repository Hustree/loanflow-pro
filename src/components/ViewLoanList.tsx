import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import { Edit, ExpandMore, ExpandLess, Notes } from '@mui/icons-material';
import { useAppSelector } from '../store/hooks';
import { Loan } from '../schema/loan';
import StatusUpdateModal from './StatusUpdateModal';

const ViewLoanList: React.FC = () => {
  const { loans, isLoading, error } = useAppSelector((state) => state.loan);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleStatusUpdate = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLoan(null);
  };

  const toggleRowExpansion = (loanId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(loanId)) {
      newExpandedRows.delete(loanId);
    } else {
      newExpandedRows.add(loanId);
    }
    setExpandedRows(newExpandedRows);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading loans: {error}
      </Alert>
    );
  }

  if (loans.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No loan applications found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Submit your first loan application to see it here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Loan Applications ({loans.length})
      </Typography>
      
      <TableContainer component={Paper} elevation={2}>
        <Table sx={{ minWidth: 650 }} aria-label="loan applications table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell padding="checkbox"></TableCell>
              <TableCell><strong>Reference</strong></TableCell>
              <TableCell><strong>Applicant</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell align="right"><strong>Amount</strong></TableCell>
              <TableCell align="center"><strong>Term</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Submitted</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans.map((loan: Loan) => {
              const isExpanded = expandedRows.has(loan.id!);
              return (
                <React.Fragment key={loan.id || loan.ref}>
                  <TableRow
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'grey.50' }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(loan.id!)}
                        sx={{ p: 0.5 }}
                      >
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="primary">
                        {loan.ref}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {loan.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {loan.pnpBfpId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {loan.type}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(loan.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {loan.term} months
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        color={getStatusColor(loan.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(loan.submissionDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Update Status">
                        <IconButton
                          size="small"
                          onClick={() => handleStatusUpdate(loan)}
                          sx={{ p: 0.5 }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded row for notes */}
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Notes sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="subtitle2" fontWeight="medium">
                              Notes & Updates
                            </Typography>
                          </Box>
                          {loan.notes ? (
                            <Typography variant="body2" color="text.secondary">
                              {loan.notes}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                              No notes available for this loan application.
                            </Typography>
                          )}
                          {loan.updatedAt && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Last updated: {formatDate(loan.updatedAt)}
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Total Applications:</strong> {loans.length} | 
          <strong> Total Amount Requested:</strong> {formatCurrency(loans.reduce((sum, loan) => sum + loan.amount, 0))}
        </Typography>
      </Box>

      {/* Status Update Modal */}
      <StatusUpdateModal
        open={isModalOpen}
        onClose={handleCloseModal}
        loan={selectedLoan}
      />
    </Box>
  );
};

export default ViewLoanList;