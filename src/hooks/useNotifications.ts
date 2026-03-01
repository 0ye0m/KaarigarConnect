'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  booking_id: string | null;
  created_at: Date | string;
  booking?: any;
}

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'x-user-id': user.id,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId?: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          notification_id: notificationId,
          mark_all_read: !notificationId,
        }),
      });

      if (response.ok) {
        if (!notificationId) {
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, is_read: true }))
          );
          setUnreadCount(0);
        } else {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, is_read: true } : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
  };
}
