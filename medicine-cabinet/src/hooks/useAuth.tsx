import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { subscribeToAuthState, type User } from '../services/authService';
import { initializeFirebase } from '../firebase/init';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Firebase
    try {
      initializeFirebase();
    } catch (err) {
      console.error('Failed to initialize Firebase:', err);
      setError('Failed to initialize application');
      setLoading(false);
      return;
    }

    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthState((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
