'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase with extreme safety for build environments.
 * Prevents crashes during static generation if API keys are not present.
 */
export function initializeFirebase() {
  // Guard against server-side execution during build or initial render.
  if (typeof window === 'undefined') {
     return { firebaseApp: null as any, auth: null as any, firestore: null as any };
  }

  const hasConfig = !!firebaseConfig.apiKey && 
                    firebaseConfig.apiKey !== 'undefined' && 
                    firebaseConfig.apiKey.length > 10;

  if (!getApps().length) {
    if (!hasConfig) {
      console.warn('Firebase configuration is missing. Initialization skipped for build safety.');
      return { firebaseApp: null as any, auth: null as any, firestore: null as any };
    }

    try {
      const firebaseApp = initializeApp(firebaseConfig);
      return getSdks(firebaseApp);
    } catch (e) {
      console.warn('Firebase initialization failed:', e);
      return { firebaseApp: null as any, auth: null as any, firestore: null as any };
    }
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  if (!firebaseApp) {
    return {
      firebaseApp: null as any,
      auth: null as any,
      firestore: null as any
    };
  }
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
