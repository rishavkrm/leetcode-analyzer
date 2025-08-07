/* eslint-disable react-refresh/only-export-components */
// src/contexts/CookieContext.tsx
import React, { createContext, useState, useEffect, useCallback, useContext, type ReactNode } from 'react';
import { useNotifications } from './NotificationContext';

interface CookieContextType {
  leetCodeCookie: string | null;
  storeLeetCodeCookie: (cookie: string | null) => void;
  leetCodeUsername: string | null;
  storeLeetCodeUsername: (cookie: string | null) => void;
}

export const CookieContext = createContext<CookieContextType | undefined>(undefined);

export const useCookie = () => {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookie must be used within a CookieProvider');
  }
  return context;
};

interface CookieProviderProps {
  children: ReactNode;
}

export const CookieProvider: React.FC<CookieProviderProps> = ({ children }) => {
  const [leetCodeCookie, setLeetCodeCookieState] = useState<string | null>(null);
  const [leetCodeUsername, setLeetCodeUsername] = useState<string | null>(null);

  const { showNotification } = useNotifications();

  // Initial load from localStorage
  useEffect(() => {
    try {
      const cookie = localStorage.getItem('leetcode_cookie');
      if (cookie) {
        setLeetCodeCookieState(cookie);
      }
      const username = localStorage.getItem('leetcode_username');
      if (cookie) {
        setLeetCodeUsername(username);
      }
    } catch (error) {
      console.error('Error retrieving cookie from local storage:', error);
      showNotification('Error', 'Failed to retrieve cookie from local storage.', 'red');
    }
  }, [showNotification]); // Depend on showNotification (it's memoized)

  const storeLeetCodeCookie = useCallback((cookie: string | null) => {
    setLeetCodeCookieState(cookie);
    if (cookie) {
      localStorage.setItem('leetcode_cookie', cookie);
    } else {
      localStorage.removeItem('leetcode_cookie');
    }
  }, []);

  const storeLeetCodeUsername = useCallback((username: string | null) => {
    setLeetCodeCookieState(username);
    if (username) {
      localStorage.setItem('leetcode_username', username);
    } else {
      localStorage.removeItem('leetcode_username');
    }
  }, []);

  const contextValue = React.useMemo(() => ({
    leetCodeCookie,
    storeLeetCodeCookie,
    leetCodeUsername,
    storeLeetCodeUsername
  }), [leetCodeCookie, leetCodeUsername, storeLeetCodeCookie, storeLeetCodeUsername]);

  return (
    <CookieContext.Provider value={contextValue}>
      {children}
    </CookieContext.Provider>
  );
};