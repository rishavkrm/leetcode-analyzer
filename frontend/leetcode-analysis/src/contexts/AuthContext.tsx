/* eslint-disable react-refresh/only-export-components */
// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useMemo, useContext, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { auth as firebaseAuth } from '../firebase-config'; // Rename to avoid conflict with 'auth' prop

type CustomUser = User

interface AuthContextType {
  isAuthenticated: boolean;
  user: CustomUser | null;
  isLoading: boolean; // Indicates if auth state is still being determined
  // You might add login/logout functions here later
}

// Create the context with an undefined default, and enforce usage within Provider
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to consume the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      console.log('Auth state changed to :', currentUser);
      setUser(currentUser as CustomUser); // Cast to CustomUser type
      setIsAuthenticated(!!currentUser);
      setIsLoading(false); // Auth state determined
    });

    // Correct cleanup function for useEffect
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const authContextValue = useMemo(() => ({
    isAuthenticated,
    user,
    isLoading,
  }), [isAuthenticated, user, isLoading]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};