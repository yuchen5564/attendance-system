// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "attendance-system-e5f5b.firebaseapp.com",
  projectId: "attendance-system-e5f5b",
  storageBucket: "attendance-system-e5f5b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;

// VITE_FIREBASE_AUTH_DOMAIN="attendance-system-e5f5b.firebaseapp.com"
// VITE_FIREBASE_PROJECT_ID="attendance-system-e5f5b"
// VITE_FIREBASE_STORAGE_BUCKET="attendance-system-e5f5b.firebasestorage.app"