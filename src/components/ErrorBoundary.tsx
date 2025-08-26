import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
    
    // Log to Firebase Analytics or error tracking service
    if (process.env.NODE_ENV === 'production') {
      // firebaseService.logEvent('error_boundary_catch', {
      //   error: error.toString(),
      //   componentStack: errorInfo.componentStack,
      // });
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              textAlign: 'center',
              py: 4,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 2,
                backgroundColor: 'background.paper',
              }}
            >
              <ErrorOutline
                sx={{
                  fontSize: 64,
                  color: 'error.main',
                  mb: 2,
                }}
              />
              
              <Typography variant="h5" gutterBottom color="error">
                Oops! Something went wrong
              </Typography>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </Typography>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: 'grey.100',
                    borderRadius: 1,
                    textAlign: 'left',
                  }}
                >
                  <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              )}
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<Refresh />}
                onClick={this.handleReset}
                sx={{ mt: 3 }}
              >
                Reload Application
              </Button>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;