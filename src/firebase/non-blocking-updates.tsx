'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  increment,
  CollectionReference,
  DocumentReference,
  SetOptions,
  Firestore,
  getDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', 
        requestResourceData: data,
      })
    )
  })
}

/**
 * Validates wallet balance and daily limits, then deducts coins.
 * Handles auto-migration for legacy users.
 */
export async function validateAndDeductCoins(db: Firestore, userId: string, cost: number): Promise<{ success: boolean; error?: string; code?: 'LIMIT_REACHED' | 'NO_COINS' }> {
  const profileRef = doc(db, 'users', userId, 'profile', 'stats');
  const profileSnap = await getDoc(profileRef);
  
  if (!profileSnap.exists()) return { success: false, error: "Profile not found." };
  
  const data = profileSnap.data();
  const now = new Date();
  
  // Migration Check: If coinBalance is missing, grant 50 coins (Welcome Kit)
  let currentBalance = typeof data.coinBalance === 'number' ? data.coinBalance : 50;
  let dailyUsed = data.dailyCoinsUsed || 0;
  let lastResetStr = data.lastDailyReset;
  let lastAllowanceStr = data.lastMonthlyAllowance;

  // 1. Daily Reset Check
  const isNewDay = !lastResetStr || (now.toDateString() !== new Date(lastResetStr).toDateString());
  if (isNewDay) {
    dailyUsed = 0;
    lastResetStr = now.toISOString();
  }

  // 2. Monthly Allowance Check (30 days)
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const lastAllowance = lastAllowanceStr ? new Date(lastAllowanceStr) : now;
  const isNewMonth = (now.getTime() - lastAllowance.getTime()) > thirtyDaysInMs;
  
  if (isNewMonth) {
    currentBalance += 30;
    lastAllowanceStr = now.toISOString();
  }

  // 3. Limit Checks
  if (dailyUsed + cost > 5) {
    return { 
      success: false, 
      error: "Daily limit reached!",
      code: 'LIMIT_REACHED'
    };
  }
  
  if (currentBalance < cost) {
    return { 
      success: false, 
      error: "Insufficient coins!",
      code: 'NO_COINS'
    };
  }

  // 4. Update Database
  try {
    await updateDoc(profileRef, {
      coinBalance: currentBalance - cost,
      dailyCoinsUsed: dailyUsed + cost,
      lastDailyReset: lastResetStr || now.toISOString(),
      lastMonthlyAllowance: lastAllowanceStr || now.toISOString(),
      updatedAt: now.toISOString()
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: "Sync error. Please try again." };
  }
}

/**
 * Increments coin balance after an ad AND decrements daily used count 
 * to allow one more free task immediately.
 */
export async function grantAdReward(db: Firestore, userId: string) {
  const profileRef = doc(db, 'users', userId, 'profile', 'stats');
  try {
    await updateDoc(profileRef, {
      coinBalance: increment(1),
      dailyCoinsUsed: increment(-1),
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (e) {
    console.error("Ad reward sync failed:", e);
    return { success: false };
  }
}

/**
 * Increments assessment counts in Firestore.
 */
export function incrementUserStats(db: Firestore, userId: string, isAssessment: boolean = true) {
  const profileRef = doc(db, 'users', userId, 'profile', 'stats'); 
  
  setDoc(profileRef, {
    id: userId,
    assessmentsDone: isAssessment ? increment(1) : increment(0),
    updatedAt: new Date().toISOString()
  }, { merge: true }).catch(error => {
    console.warn("Progress update failed silently:", error);
  });
}

export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      )
    });
  return promise;
}

export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}

export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}