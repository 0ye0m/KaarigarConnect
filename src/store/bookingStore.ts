import { create } from 'zustand';

export interface Booking {
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
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  price_quoted: number | null;
  price_agreed: number | null;
  customer_confirmed: boolean;
  created_at: Date;
  updated_at: Date;
  customer?: {
    id: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
  };
  worker?: {
    id: string;
    user_id: string;
    skill_category: string;
    hourly_rate: number;
    user?: {
      full_name: string | null;
      phone: string | null;
      avatar_url: string | null;
    };
  };
}

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, data: Partial<Booking>) => void;
  setCurrentBooking: (booking: Booking | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  currentBooking: null,
  isLoading: false,
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBooking: (id, data) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...data } : b
      ),
      currentBooking:
        state.currentBooking?.id === id
          ? { ...state.currentBooking, ...data }
          : state.currentBooking,
    })),
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  setLoading: (isLoading) => set({ isLoading }),
}));
