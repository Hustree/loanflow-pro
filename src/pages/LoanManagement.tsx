import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { Add as AddIcon, List as ListIcon } from '@mui/icons-material';
import LoanForm from '../components/LoanForm';
import ViewLoanList from '../components/ViewLoanList';
import { useAppSelector } from '../store/hooks';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const LoanManagement: React.FC = () => {
  const [value, setValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { loans } = useAppSelector((state) => state.loan);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleLoanSuccess = (referenceNumber: string) => {
    setSuccessMessage(`Loan application submitted successfully! Reference: ${referenceNumber}`);
    // Auto switch to list view to see the new loan
    setTimeout(() => {
      setValue(1);
    }, 2000);
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  return (
    <Container component="main" maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Loan Management System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage loan applications using Redux Toolkit state management
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Paper elevation={3} sx={{ mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="loan management tabs">
              <Tab 
                icon={<AddIcon />} 
                label={`New Application`} 
                {...a11yProps(0)} 
              />
              <Tab 
                icon={<ListIcon />} 
                label={`View Applications (${loans.length})`} 
                {...a11yProps(1)} 
              />
            </Tabs>
          </Box>
          
          <TabPanel value={value} index={0}>
            <Typography variant="h6" gutterBottom>
              Submit New Loan Application
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Fill out the form below to submit a new loan application. All data will be stored in Redux state.
            </Typography>
            <LoanForm onSuccess={handleLoanSuccess} />
          </TabPanel>
          
          <TabPanel value={value} index={1}>
            <ViewLoanList />
          </TabPanel>
        </Paper>

        {/* <Box sx={{ mt: 3 }}>
          <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Redux Toolkit Implementation Details
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>🏗️ Architecture:</strong> This application uses Redux Toolkit with TypeScript for state management, 
              with Zod schemas for validation.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>📁 File Structure:</strong>
            </Typography>
            <Typography variant="body2" component="div" sx={{ ml: 2 }}>
              • <code>src/store/store.ts</code> - Redux store configuration<br/>
              • <code>src/store/loanSlice.ts</code> - Loan slice with actions and reducers<br/>
              • <code>src/store/hooks.ts</code> - Typed Redux hooks<br/>
              • <code>src/schema/loan.ts</code> - Zod schemas and TypeScript types<br/>
              • <code>src/components/LoanForm.tsx</code> - Form component with Redux integration<br/>
              • <code>src/components/ViewLoanList.tsx</code> - List component using Redux state
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              <strong>🚀 Features:</strong> Form validation with Zod, automatic reference number generation, 
              MUI table display, error handling, and ready for API integration with createAsyncThunk.
            </Typography>
          </Paper>
        </Box> */}
      </Box>
    </Container>
  );
};

export default LoanManagement;