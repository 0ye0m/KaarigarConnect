'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useBookings } from '@/hooks/useBookings';
import { BookingCard } from '@/components/shared/BookingCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function BookingsPage() {
  const { user } = useAuthStore();
  const { bookings, isLoading, fetchBookings } = useBookings();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id, fetchBookings]);

  const filterBookings = (status?: string) => {
    if (!status || status === 'all') return bookings;
    
    if (status === 'active') {
      return bookings.filter(
        (b) => b.status === 'pending' || b.status === 'accepted' || b.status === 'in_progress'
      );
    }
    
    return bookings.filter((b) => b.status === status);
  };

  const filteredBookings = filterBookings(activeTab);

  const getTabCount = (status?: string) => {
    return filterBookings(status).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {user?.role === 'customer' ? 'My Bookings' : 'My Jobs'}
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all" className="text-xs md:text-sm">
              All ({getTabCount('all')})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs md:text-sm">
              <Clock className="h-4 w-4 mr-1 hidden md:block" />
              Active ({getTabCount('active')})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs md:text-sm">
              <CheckCircle className="h-4 w-4 mr-1 hidden md:block" />
              Done ({getTabCount('completed')})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs md:text-sm">
              Pending ({getTabCount('pending')})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="text-xs md:text-sm">
              <XCircle className="h-4 w-4 mr-1 hidden md:block" />
              Cancelled ({getTabCount('cancelled')})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No bookings found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {activeTab === 'all'
                      ? "You don't have any bookings yet"
                      : `No ${activeTab} bookings`}
                  </p>
                  {user?.role === 'customer' && (
                    <Button onClick={() => window.history.back()}>
                      Find Workers
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    userRole={user?.role as 'customer' | 'worker'}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
