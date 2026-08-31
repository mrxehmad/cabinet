import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getAuthInstance } from '../firebase/init';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Register a new user with email and password
 */
export const registerUser = async (email: string, password: string): Promise<User> => {
  const auth = getAuthInstance();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Login existing user with email and password
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  const auth = getAuthInstance();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Logout current user
 */
export const logoutUser = async (): Promise<void> => {
  const auth = getAuthInstance();
  await signOut(auth);
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  const auth = getAuthInstance();
  await sendPasswordResetEmail(auth, email);
};

/**
 * Subscribe to auth state changes
 * Returns an unsubscribe function
 */
export const subscribeToAuthState = (callback: (user: User | null) => void): (() => void) => {
  const auth = getAuthInstance();
  return onAuthStateChanged(auth, callback);
};
