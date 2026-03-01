'use client';

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';

interface Booking {
  id: string;
  customer_id: string;
  worker_id: string;
  service_type: string;
  description: string | null;
  scheduled_date: Date;
  scheduled_time: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  price_quoted: number | null;
  price_agreed: number | null;
  customer_confirmed: boolean;
  created_at: Date;
  updated_at: Date;
  customer?: any;
  worker?: any;
  messages?: any[];
  review?: any;
}

export function useBookings() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bookings', {
        headers: {
          'x-user-id': user.id,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      setBookings(data.bookings);
      return data.bookings;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchBookingById = useCallback(async (id: string) => {
    if (!user?.id) return null;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        headers: {
          'x-user-id': user.id,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch booking');
      }

      setCurrentBooking(data.booking);
      return data.booking;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch booking';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createBooking = useCallback(async (bookingData: Partial<Booking>) => {
    if (!user?.id) return null;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setBookings((prev) => [data.booking, ...prev]);
      return data.booking;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create booking';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const updateBooking = useCallback(async (id: string, updates: Partial<Booking>) => {
    if (!user?.id) return null;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking');
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...data.booking } : b))
      );
      if (currentBooking?.id === id) {
        setCurrentBooking(data.booking);
      }
      return data.booking;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update booking';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentBooking?.id]);

  return {
    bookings,
    currentBooking,
    isLoading,
    error,
    fetchBookings,
    fetchBookingById,
    createBooking,
    updateBooking,
  };
}
