import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { store } from './store/store';
import { mobileFirstTheme } from './theme/mobileFirst';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider theme={mobileFirstTheme}>
          <CssBaseline />
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
