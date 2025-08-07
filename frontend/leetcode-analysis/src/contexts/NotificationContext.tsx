/* eslint-disable react-refresh/only-export-components */
// src/contexts/NotificationContext.tsx
import React, { createContext, useState, useCallback, useContext, type ReactNode, useMemo } from 'react';
import { Alert, Stack, Box } from '@mantine/core';
import { type AppNotification } from '../types/types'; // Assuming AppNotification type is defined

interface NotificationContextType {
  showNotification: (title: string, message: string, color: string) => void;
  removeNotification: (id: number) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const showNotification = useCallback((title: string, message: string, color: string) => {
    const newNotification = { id: Date.now(), title, message, color };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 2000);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []); // Dependencies are stable

  const contextValue = useMemo(() => ({
    showNotification,
    removeNotification,
  }), [showNotification, removeNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Box style={{ position: 'fixed', top: 100, right: 20, zIndex: 2000, width: 320 }}>
        <Stack>
          {notifications.map((n) => (
            <Alert
              key={n.id}
              title={n.title}
              color={n.color}
              withCloseButton
              onClose={() => removeNotification(n.id)}
            >
              {n.message}
            </Alert>
          ))}
        </Stack>
      </Box>
    </NotificationContext.Provider>
  );
};