import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

/**
 * Robust singleton for Firebase services.
 * Prevents initialization errors during Next.js build/SSR by checking for environment and config.
 */
let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

const hasConfig = typeof window !== 'undefined' && 
                  !!firebaseConfig.apiKey && 
                  firebaseConfig.apiKey !== 'undefined';

if (typeof window !== 'undefined' && hasConfig) {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
}

export { auth, firestore, firebaseApp };
