import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, inMemoryPersistence } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Secondary app for creating users without signing out the admin
const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
export const secondaryAuth = getAuth(secondaryApp);

// Ensure it doesn't affect the primary auth state
setPersistence(secondaryAuth, inMemoryPersistence);
