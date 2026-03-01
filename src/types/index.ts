export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'worker' | 'admin';
  avatar_url: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: Date;
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  skill_category: string;
  experience_years: number;
  bio: string | null;
  hourly_rate: number;
  is_available: boolean;
  is_verified: boolean;
  total_jobs: number;
  rating: number;
  rating_count: number;
  latitude: number | null;
  longitude: number | null;
  radius_km: number;
  created_at: Date;
  user?: Profile;
}

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
  customer?: Profile;
  worker?: WorkerProfile;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: Date;
  sender?: Profile;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  worker_id: string;
  rating: number;
  review_text: string | null;
  created_at: Date;
  customer?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_rejected' | 'new_message' | 'review_received';
  is_read: boolean;
  booking_id: string | null;
  created_at: Date;
  booking?: Booking;
}

// Skill categories with Lucide icon names
export const SKILL_CATEGORIES = [
  { value: 'plumber', label: 'Plumber', icon: 'Wrench' },
  { value: 'electrician', label: 'Electrician', icon: 'Zap' },
  { value: 'carpenter', label: 'Carpenter', icon: 'Hammer' },
  { value: 'painter', label: 'Painter', icon: 'Paintbrush' },
  { value: 'mechanic', label: 'Mechanic', icon: 'Cog' },
  { value: 'cleaner', label: 'Cleaner', icon: 'Sparkles' },
  { value: 'mason', label: 'Mason', icon: 'BrickWall' },
  { value: 'welder', label: 'Welder', icon: 'Flame' },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-neutral-400',
  accepted: 'bg-neutral-700',
  rejected: 'bg-neutral-500',
  in_progress: 'bg-neutral-600',
  completed: 'bg-black',
  cancelled: 'bg-neutral-300',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
