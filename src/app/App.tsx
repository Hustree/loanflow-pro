import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/features/auth';
import { ThemeModeProvider } from '@/features/theme';
import { store } from '@/store/store';

import AppRoutes from './AppRoutes';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeModeProvider>
          <CssBaseline />
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </ThemeModeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
