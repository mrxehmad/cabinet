import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export const initializeFirebase = (): void => {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Enable offline persistence for better mobile experience
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn('Firestore persistence failed: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        // Browser doesn't support persistence
        console.warn('Firestore persistence not supported in this browser');
      }
    });
  }
};

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    throw new Error('Firebase not initialized. Call initializeFirebase first.');
  }
  return app;
};

export const getAuthInstance = (): Auth => {
  if (!auth) {
    throw new Error('Firebase Auth not initialized. Call initializeFirebase first.');
  }
  return auth;
};

export const getFirestoreInstance = (): Firestore => {
  if (!db) {
    throw new Error('Firestore not initialized. Call initializeFirebase first.');
  }
  return db;
};
