import React from 'react';
import ReactDOM from 'react-dom/client';

import '@/lib/i18n';

import App from './app/App';
import { reportWebVitals } from './lib/reportWebVitals';

async function enableMocking() {
  if (import.meta.env.VITE_BACKEND === 'firebase') return;
  const { worker } = await import('./lib/msw/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});

reportWebVitals();
