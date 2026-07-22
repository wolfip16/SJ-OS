/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './firebase';
import { doc, setDoc, getDoc, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { UserProfile } from '../components/AuthLockScreen';
import { Contact, TimelineEvent, CalendarItem, DailyReview } from '../types';

export interface SecurityAccessLog {
  id: string;
  timestamp: string;
  pinEntered: string;
  result: 'Success' | 'Denied';
  resolvedUser?: string;
  resolvedRole?: string;
}

// Log Security Access Attempt to Firestore & LocalStorage
export async function logSecurityAccessToFirebase(pin: string, result: 'Success' | 'Denied', user?: UserProfile) {
  const maskedPin = pin.replace(/./g, '•');
  const logData: SecurityAccessLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    pinEntered: maskedPin,
    result,
    resolvedUser: user ? user.name : 'Unknown Terminal Session',
    resolvedRole: user ? user.role : 'Unauthorized Handshake',
  };

  // LocalStorage sync
  try {
    const saved = localStorage.getItem('sj_os_security_logs');
    const logs: SecurityAccessLog[] = saved ? JSON.parse(saved) : [];
    const updated = [logData, ...logs].slice(0, 50);
    localStorage.setItem('sj_os_security_logs', JSON.stringify(updated));
  } catch (e) {
    // fallback
  }

  // Firestore sync
  try {
    await addDoc(collection(db, 'security_logs'), logData);
  } catch (err) {
    console.warn('Firebase security log sync skipped (working offline):', err);
  }
}

// Save User Profile to Firestore
export async function saveUserProfileToFirestore(user: UserProfile) {
  try {
    await setDoc(doc(db, 'users', user.id), {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firebase user sync skipped:', err);
  }
}

// Save User Workspace Data to Firestore
export async function syncUserDataToFirestore(
  userId: string,
  data: {
    contacts?: Contact[];
    timelineEvents?: TimelineEvent[];
    calendarItems?: CalendarItem[];
    dailyReviews?: DailyReview[];
    masterNotes?: string;
  }
) {
  try {
    const userDocRef = doc(db, 'workspace_data', userId);
    await setDoc(userDocRef, {
      ...data,
      lastSyncedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firebase workspace sync skipped:', err);
  }
}

// Load User Workspace Data from Firestore with fallback
export async function loadUserDataFromFirestore(userId: string) {
  try {
    const userDocRef = doc(db, 'workspace_data', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn('Firebase workspace read skipped:', err);
  }
  return null;
}
