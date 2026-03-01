'use client';

import { useState, useEffect, use } from 'react';
import { useAuthStore } from '@/store/authStore';
import { RatingStars } from '@/components/shared/RatingStars';
import { SkillIcon } from '@/components/shared/SkillIcon';
import { VerifiedBadgePremium, VerifiedBadge } from '@/components/shared/VerifiedBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  IndianRupee,
  Check,
  Briefcase,
  Calendar,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { SKILL_CATEGORIES } from '@/types';
import { useBookings } from '@/hooks/useBookings';
import { cn } from '@/lib/utils';

export default function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuthStore();
  const { createBooking } = useBookings();
  const [worker, setWorker] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWorker();
  }, [resolvedParams.id]);

  const fetchWorker = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/workers/${resolvedParams.id}`);
      const data = await response.json();
      if (response.ok) {
        setWorker(data.worker);
      }
    } catch (error) {
      console.error('Error fetching worker:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = async () => {
    if (!user || !worker) return;

    if (!bookingForm.description || !bookingForm.scheduled_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBooking({
        worker_id: worker.id,
        service_type: worker.skill_category,
        description: bookingForm.description,
        scheduled_date: new Date(bookingForm.scheduled_date),
        scheduled_time: bookingForm.scheduled_time,
        address: bookingForm.address || user.address,
        latitude: user.latitude,
        longitude: user.longitude,
      });

      if (result) {
        toast.success('Booking request sent!');
        setShowBookingForm(false);
        setBookingForm({
          description: '',
          scheduled_date: '',
          scheduled_time: '',
          address: '',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'W';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || !worker) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const skillInfo = SKILL_CATEGORIES.find((s) => s.value === worker.skill_category);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">Worker Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Profile Header Card */}
        <Card className="border-border/40 shadow-sm overflow-hidden">
          {/* Cover gradient */}
          <div className="h-24 bg-gradient-to-r from-neutral-800 to-neutral-600" />
          
          <CardContent className="p-0">
            <div className="px-6 pb-6">
              {/* Avatar - overlapping cover */}
              <div className="relative -mt-12 mb-4">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={worker.user?.avatar_url || ''} />
                  <AvatarFallback className="bg-neutral-100 text-neutral-800 font-semibold text-2xl">
                    {getInitials(worker.user?.full_name || null)}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                {worker.is_available && (
                  <span className="absolute bottom-1 right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-black border-2 border-background" />
                  </span>
                )}
              </div>

              {/* Name and Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-foreground">
                      {worker.user?.full_name || 'Worker'}
                    </h2>
                    {worker.is_verified && <VerifiedBadgePremium size="md" />}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                    <Badge variant="outline" className="text-sm py-1 px-3 border-border/50 font-medium">
                      <SkillIcon iconName={skillInfo?.icon ?? 'Wrench'} className="h-4 w-4 mr-1.5" />
                      {skillInfo?.label}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm">
                      <Briefcase className="h-4 w-4" />
                      {worker.experience_years} years exp
                    </span>
                    {worker.user?.city && (
                      <span className="flex items-center gap-1 text-sm">
                        <MapPin className="h-4 w-4" />
                        {worker.user.city}
                      </span>
                    )}
                  </div>
                </div>

                {user?.role === 'customer' && (
                  <Button
                    className="bg-black hover:bg-black/90 text-white"
                    onClick={() => setShowBookingForm(true)}
                    disabled={!worker.is_available}
                  >
                    {worker.is_available ? 'Book Now' : 'Unavailable'}
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-muted/30 rounded-xl border border-border/40 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-5 w-5 text-black fill-black" />
                    <span className="text-2xl font-bold text-foreground">{worker.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{worker.rating_count} reviews</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl border border-border/40 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <IndianRupee className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold text-foreground">{worker.hourly_rate}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">per hour</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl border border-border/40 text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {worker.total_jobs}
                  </div>
                  <p className="text-sm text-muted-foreground">jobs done</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        {worker.bio && (
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{worker.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Reviews ({worker.reviews?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {worker.reviews?.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {worker.reviews?.map((review: any) => (
                  <div key={review.id} className="border-b border-border/40 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarFallback className="bg-neutral-100 text-neutral-800 text-sm font-medium">
                          {getInitials(review.customer?.full_name || null)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-foreground">
                            {review.customer?.full_name || 'Anonymous'}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <RatingStars rating={review.rating} size="sm" showValue={false} />
                        {review.review_text && (
                          <p className="text-muted-foreground text-sm mt-2">{review.review_text}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-lg border-border/50 max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Book {worker.user?.full_name || 'Worker'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/40">
                <div className="p-2.5 rounded-lg bg-neutral-100">
                  <SkillIcon iconName={skillInfo?.icon ?? 'Wrench'} className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{skillInfo?.label}</p>
                  <p className="text-sm text-muted-foreground">₹{worker.hourly_rate}/hour</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Service Description *</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[100px] rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                  placeholder="Describe the work you need done..."
                  value={bookingForm.description}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <input
                    id="date"
                    type="date"
                    className="w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground"
                    value={bookingForm.scheduled_date}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, scheduled_date: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time</Label>
                  <input
                    id="time"
                    type="time"
                    className="w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground"
                    value={bookingForm.scheduled_time}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, scheduled_time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Service Address</Label>
                <input
                  id="address"
                  type="text"
                  className="w-full rounded-lg border border-input bg-background p-2.5 text-sm text-foreground"
                  placeholder="Enter your address"
                  value={bookingForm.address}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, address: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => setShowBookingForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-10 bg-black hover:bg-black/90 text-white"
                  onClick={handleBook}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Send Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {children}
    </label>
  );
}
