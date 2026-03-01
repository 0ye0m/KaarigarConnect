'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Navbar } from '@/components/shared/Navbar';
import { useNotifications } from '@/hooks/useNotifications';
import { AuthPage } from '@/components/auth/AuthPage';
import { CustomerHome } from '@/components/customer/CustomerHome';
import { WorkerDashboard } from '@/components/worker/WorkerDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotifications();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('auth-storage');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.state?.user) {
            setUser(parsed.state.user);
          } else {
            setLoading(false);
          }
        } catch {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [setUser, setLoading]);

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications();
    }
  }, [isAuthenticated, user?.id, fetchNotifications]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (user.role) {
      case 'customer':
        return <CustomerHome />;
      case 'worker':
        return <WorkerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <CustomerHome />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        unreadCount={unreadCount}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onRefreshNotifications={fetchNotifications}
      />
      <main className="flex-1">
        {renderContent()}
      </main>
      <footer className="border-t border-border/50 bg-card py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              
              <span className="font-medium text-foreground text-sm"><b>KaarigarConnect</b></span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 <b>KaarigarConnect</b>. Connecting skilled workers with customers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
