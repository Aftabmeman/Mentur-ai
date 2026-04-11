import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Firebase configuration for Mentur AI.
 * Using environment variables for security.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "studio-8515730718-27b1e.firebaseapp.com",
  projectId: "studio-8515730718-27b1e",
  storageBucket: "studio-8515730718-27b1e.firebasestorage.app",
  messagingSenderId: "417674426575",
  appId: "1:417674426575:web:9c1cda1c088fd719679fba"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export Auth instance
export const auth = getAuth(app);
