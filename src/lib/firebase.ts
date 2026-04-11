import { initializeFirebase } from "@/firebase";

/**
 * Single source of truth for Firebase services.
 * This ensures we don't have multiple 'DEFAULT' app instances.
 */
const { auth, firestore, firebaseApp } = initializeFirebase();

export { auth, firestore, firebaseApp };
