import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCh3VbmPBBTnd-dMZkxmzRu6yDj3y7Yjxc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "c1elec.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "c1elec",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "c1elec.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1010978833106",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1010978833106:web:e4e78e636e72f4b21ee30b"
};

// Check if valid Firebase configuration is supplied
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY'
);

let app = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export { app, auth };
export default app;
