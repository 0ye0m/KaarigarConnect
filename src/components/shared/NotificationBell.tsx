'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Check, Clock, MessageSquare, Star, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  booking_id: string | null;
  created_at: Date | string;
  booking?: {
    service_type: string;
    status: string;
  } | null;
}

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id?: string) => Promise<void>;
}

const notificationIcons: Record<string, typeof Bell> = {
  booking_request: AlertCircle,
  booking_accepted: Check,
  booking_rejected: X,
  new_message: MessageSquare,
  review_received: Star,
};

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAllRead = async () => {
    await onMarkAsRead();
  };

  const getIcon = (type: string) => {
    const Icon = notificationIcons[type] || Bell;
    return Icon;
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'booking_accepted':
        return 'text-green-500 bg-green-50';
      case 'booking_rejected':
        return 'text-red-500 bg-red-50';
      case 'new_message':
        return 'text-blue-500 bg-blue-50';
      case 'review_received':
        return 'text-yellow-500 bg-yellow-50';
      default:
        return 'text-orange-500 bg-orange-50';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Notifications</SheetTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </SheetHeader>
        <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="h-12 w-12 mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <Link
                    key={notification.id}
                    href={notification.booking_id ? `/booking/${notification.booking_id}` : '#'}
                    onClick={() => {
                      if (!notification.is_read) {
                        onMarkAsRead(notification.id);
                      }
                      setIsOpen(false);
                    }}
                  >
                    <div
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg transition-colors',
                        notification.is_read
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-blue-50 hover:bg-blue-100'
                      )}
                    >
                      <div className={cn('p-2 rounded-full', getIconColor(notification.type))}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
