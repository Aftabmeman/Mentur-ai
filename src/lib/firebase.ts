import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Firebase configuration object.
 * Values are read from environment variables with the NEXT_PUBLIC_ prefix
 * to ensure they are available in the browser during production (e.g., Vercel).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Debugging check: If the API key is missing at runtime, log a warning to the console.
// This helps identify if environment variables were not correctly injected during build.
if (typeof window !== 'undefined' && !firebaseConfig.apiKey) {
  console.warn(
    "Mentur AI: Firebase API Key is missing. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in your environment variables."
  );
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
