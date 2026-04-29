import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'loanflow-pro.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'loanflow-pro',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'loanflow-pro.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:123456789:web:abcdef123456',
};

let appInstance: FirebaseApp | null = null;

const ensureApp = (): FirebaseApp => {
  if (!appInstance) {
    appInstance = initializeApp(config);
  }
  return appInstance;
};

/**
 * Strict Firebase opt-in. Throws unless `VITE_BACKEND=firebase`, so the default
 * MSW mode never reaches a real Firebase project. Real backend code paths
 * (Firestore queries, real auth) should funnel through this gate.
 */
export function getFirebaseApp(): FirebaseApp {
  if (import.meta.env.VITE_BACKEND !== 'firebase') {
    throw new Error('Firebase not enabled. Set VITE_BACKEND=firebase to use it.');
  }
  return ensureApp();
}

// Legacy lazy exports — these initialise a Firebase app with placeholder config
// in MSW mode so existing call sites (AuthContext / DashboardPage) keep working
// without contacting Google. Real Firebase calls are still gated by the
// VITE_BACKEND === 'firebase' check inside `getFirebaseApp` above.
export const auth = getAuth(ensureApp());
export const db = getFirestore(ensureApp());
export const storage = getStorage(ensureApp());

export default { getFirebaseApp };
