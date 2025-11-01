'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getUnreadNotificationCount, markNotificationAsRead as markNotificationAsReadAPI } from '@/api/notifications';
import { useAuth } from '@/contexts/AuthContext';

type NotificationContextValue = {
  unreadCount: number;
  isLoading: boolean;
  refreshUnreadCount: () => Promise<void>;
  markNotificationAsRead: (notificationID: string) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const POLLING_INTERVAL_MS = 30_000;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated, isInitializing } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const clearPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  const markNotificationAsRead = useCallback(
    async (notificationID: string) => {
      if (!notificationID) return;

      try {
        await markNotificationAsReadAPI(notificationID);
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        throw error;
      }
    },
    [],
  );

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (!isAuthenticated || !token) {
      setUnreadCount(0);
      clearPolling();
      return;
    }

    fetchUnreadCount();

    clearPolling();
    pollingRef.current = setInterval(() => {
      fetchUnreadCount();
    }, POLLING_INTERVAL_MS);

    return () => {
      clearPolling();
    };
  }, [fetchUnreadCount, isAuthenticated, isInitializing, token]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      unreadCount,
      isLoading,
      refreshUnreadCount: fetchUnreadCount,
      markNotificationAsRead,
    }),
    [fetchUnreadCount, isLoading, markNotificationAsRead, unreadCount],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
