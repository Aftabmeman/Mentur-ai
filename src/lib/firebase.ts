import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

/**
 * Single source of truth for Firebase services.
 * Ensures only one instance of the Firebase app is initialized.
 */
const firebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

export { auth, firestore, firebaseApp };