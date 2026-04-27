
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
 * Does NOT await the write operation internally.
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
 * Returns true if deduction was successful, false otherwise.
 */
export async function validateAndDeductCoins(db: Firestore, userId: string, cost: number): Promise<{ success: boolean; error?: string }> {
  const profileRef = doc(db, 'users', userId, 'profile', 'stats');
  const profileSnap = await getDoc(profileRef);
  
  if (!profileSnap.exists()) return { success: false, error: "Profile not found." };
  
  const data = profileSnap.data();
  const now = new Date();
  
  let currentBalance = data.coinBalance || 0;
  let dailyUsed = data.dailyCoinsUsed || 0;
  let lastReset = new Date(data.lastDailyReset || now);
  let lastAllowance = new Date(data.lastMonthlyAllowance || now);

  // 1. Daily Reset Check
  const isNewDay = now.toDateString() !== lastReset.toDateString();
  if (isNewDay) {
    dailyUsed = 0;
    lastReset = now;
  }

  // 2. Monthly Allowance Check (30 days)
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const isNewMonth = (now.getTime() - lastAllowance.getTime()) > thirtyDaysInMs;
  if (isNewMonth) {
    currentBalance += 30;
    lastAllowance = now;
  }

  // 3. Limit Checks
  if (dailyUsed + cost > 5) {
    return { success: false, error: "Daily limit reached! You can only use 5 coins per day. Upgrade to Premium for unlimited access." };
  }
  
  if (currentBalance < cost) {
    return { success: false, error: "Insufficient coins! Please wait for your monthly allowance or upgrade." };
  }

  // 4. Update Database
  try {
    await updateDoc(profileRef, {
      coinBalance: currentBalance - cost,
      dailyCoinsUsed: dailyUsed + cost,
      lastDailyReset: lastReset.toISOString(),
      lastMonthlyAllowance: lastAllowance.toISOString(),
      updatedAt: now.toISOString()
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: "Sync error. Please try again." };
  }
}

/**
 * Increments user coins and assessment counts in Firestore.
 * Legacy function kept for compatibility, but now typically coins are deducted not added via UI.
 */
export function incrementUserStats(db: Firestore, userId: string, coins: number, isAssessment: boolean = true) {
  const profileRef = doc(db, 'users', userId, 'profile', 'stats'); 
  
  setDoc(profileRef, {
    id: userId,
    coinBalance: increment(coins), // Rewards also go to coinBalance
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
