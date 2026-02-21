import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { notificationsApi } from '../services/api/notifications';

interface NotificationBadgeContextValue {
  unreadCount: number;
  fetchUnread: () => Promise<void>;
}

const NotificationBadgeContext = createContext<NotificationBadgeContextValue>({
  unreadCount: 0,
  fetchUnread: async () => {},
});

export function NotificationBadgeProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await notificationsApi.unreadCount();
      setUnreadCount(data.count ?? 0);
    } catch {
      // ignore (e.g. 401 before auth)
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchUnread();
    });
    const interval = setInterval(fetchUnread, 60_000);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [fetchUnread]);

  return (
    <NotificationBadgeContext.Provider value={{ unreadCount, fetchUnread }}>
      {children}
    </NotificationBadgeContext.Provider>
  );
}

export function useNotificationBadge() {
  return useContext(NotificationBadgeContext);
}
