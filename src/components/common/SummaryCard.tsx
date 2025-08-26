import React from 'react';
import { Card, CardContent, Typography, Box, Divider, Chip } from '@mui/material';
import { LoanApplication } from '../../types/loan';

interface SummaryCardProps {
  loanData: LoanApplication;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ loanData }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom color="primary" align="center">
          Loan Application Summary
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Chip 
            label={`Reference #: ${loanData.referenceNumber}`} 
            color="primary" 
            sx={{ mb: 2, width: '100%' }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Full Name:</Typography>
            <Typography variant="body1" fontWeight="medium">{loanData.fullName}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">PNP/BFP ID:</Typography>
            <Typography variant="body1" fontWeight="medium">{loanData.pnpBfpId}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Loan Type:</Typography>
            <Typography variant="body1" fontWeight="medium">{loanData.loanType}</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Loan Amount:</Typography>
            <Typography variant="body1" fontWeight="bold" color="primary">
              {formatCurrency(loanData.loanAmount)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Term:</Typography>
            <Typography variant="body1" fontWeight="medium">{loanData.term} months</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Monthly Income:</Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatCurrency(loanData.monthlyIncome)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Disbursement Mode:</Typography>
            <Typography variant="body1" fontWeight="medium">{loanData.disbursementMode}</Typography>
          </Box>

          {loanData.uploadedFile && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Uploaded File:</Typography>
              <Typography variant="body1" fontWeight="medium">{loanData.uploadedFile.name}</Typography>
            </Box>
          )}

          {loanData.submissionDate && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">Submitted on:</Typography>
              <Typography variant="body1" fontWeight="medium">
                {new Date(loanData.submissionDate).toLocaleString('en-PH')}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;