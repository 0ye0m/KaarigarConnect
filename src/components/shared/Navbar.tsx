'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Home,
  Calendar,
  BarChart3,
  Users,
  Wrench,
  Check,
  Clock,
  MessageSquare,
  Star,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  booking_id: string | null;
  created_at: Date | string;
}

interface NavbarProps {
  unreadCount: number;
  notifications: Notification[];
  onMarkAsRead: (id?: string) => Promise<void>;
  onRefreshNotifications: () => Promise<void>;
}

const notificationIcons: Record<string, typeof Bell> = {
  booking_request: AlertCircle,
  booking_accepted: Check,
  booking_rejected: X,
  new_message: MessageSquare,
  review_received: Star,
};

export function Navbar({ unreadCount, notifications, onMarkAsRead, onRefreshNotifications }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'customer':
        return [
          { href: '/', label: 'Find Workers', icon: Home },
          { href: '/bookings', label: 'Bookings', icon: Calendar },
        ];
      case 'worker':
        return [
          { href: '/', label: 'Dashboard', icon: Home },
          { href: '/bookings', label: 'Bookings', icon: Calendar },
          { href: '/earnings', label: 'Earnings', icon: BarChart3 },
          { href: '/profile', label: 'Profile', icon: User },
        ];
      case 'admin':
        return [
          { href: '/', label: 'Dashboard', icon: Home },
          { href: '/workers', label: 'Workers', icon: Wrench },
          { href: '/users', label: 'Users', icon: Users },
          { href: '/bookings', label: 'Bookings', icon: Calendar },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getIcon = (type: string) => {
    return notificationIcons[type] || Bell;
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'booking_accepted':
        return 'bg-neutral-800 text-white';
      case 'booking_rejected':
        return 'bg-neutral-400 text-white';
      case 'new_message':
        return 'bg-neutral-200 text-neutral-800';
      case 'review_received':
        return 'bg-neutral-100 text-neutral-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await onMarkAsRead(notification.id);
    }
    setIsNotificationOpen(false);
    if (notification.booking_id) {
      router.push(`/booking/${notification.booking_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    await onMarkAsRead();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              K
            </div>
            <span className="hidden font-semibold text-lg text-foreground sm:inline-block">
              KaarigarConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications Sheet */}
            <Sheet open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-lg"
                  onClick={() => onRefreshNotifications()}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-5 w-5 flex items-center justify-center text-[10px] font-bold bg-black text-white rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md border-l border-border/50">
                <SheetHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                  <SheetTitle className="text-lg font-semibold">Notifications</SheetTitle>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs h-8">
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Mark all read
                    </Button>
                  )}
                </SheetHeader>
                <ScrollArea className="mt-4 h-[calc(100vh-140px)]">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Bell className="h-10 w-10 mb-3 opacity-40" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((notification) => {
                        const Icon = getIcon(notification.type);
                        return (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={cn(
                              'w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left',
                              notification.is_read
                                ? 'hover:bg-muted/50'
                                : 'bg-muted/30 hover:bg-muted/50'
                            )}
                          >
                            <div className={cn('p-2 rounded-lg shrink-0', getIconBg(notification.type))}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm">
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground/60 mt-1.5 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <div className="h-2 w-2 rounded-full bg-black shrink-0 mt-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-lg p-0.5">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar_url || ''} alt={user?.full_name || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {getInitials(user?.full_name || null)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-3 py-2.5">
                  <p className="font-medium text-foreground">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground capitalize mt-2">
                    {user?.role}
                  </span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-neutral-600 focus:text-neutral-900 focus:bg-neutral-100"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-3">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
