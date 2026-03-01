'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useBookings } from '@/hooks/useBookings';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  IndianRupee,
  Loader2,
  Star,
  Briefcase,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface WorkerStats {
  totalJobs: number;
  totalEarnings: number;
  avgRating: number;
  pendingRequests: number;
}

export function WorkerDashboard() {
  const { user } = useAuthStore();
  const { bookings, isLoading, fetchBookings, updateBooking } = useBookings();
  const [stats, setStats] = useState<WorkerStats>({
    totalJobs: 0,
    totalEarnings: 0,
    avgRating: 0,
    pendingRequests: 0,
  });
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);
  const [quotedPrice, setQuotedPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workerProfile, setWorkerProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
      fetchWorkerProfile();
    }
  }, [user?.id, fetchBookings]);

  const fetchWorkerProfile = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch('/api/profile', {
        headers: { 'x-user-id': user.id },
      });
      const data = await response.json();
      if (data.profile?.worker_profile) {
        setWorkerProfile(data.profile.worker_profile);
      }
    } catch (error) {
      console.error('Error fetching worker profile:', error);
    }
  };

  useEffect(() => {
    const completed = bookings.filter((b) => b.status === 'completed');
    const pending = bookings.filter((b) => b.status === 'pending');
    const totalEarnings = completed.reduce(
      (sum, b) => sum + (b.price_agreed || b.price_quoted || 0),
      0
    );

    setStats({
      totalJobs: completed.length,
      totalEarnings,
      avgRating: workerProfile?.rating || 0,
      pendingRequests: pending.length,
    });
  }, [bookings, workerProfile]);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const activeBookings = bookings.filter(
    (b) => b.status === 'accepted' || b.status === 'in_progress'
  );
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  const handleAction = async () => {
    if (!selectedBooking || !actionType) return;

    if (actionType === 'accept' && !quotedPrice) {
      toast.error('Please enter a quoted price');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateBooking(selectedBooking.id, {
        status: actionType === 'accept' ? 'accepted' : 'rejected',
        price_quoted: actionType === 'accept' ? parseFloat(quotedPrice) : null,
      });

      if (result) {
        toast.success(
          actionType === 'accept'
            ? 'Booking accepted!'
            : 'Booking rejected'
        );
        setSelectedBooking(null);
        setActionType(null);
        setQuotedPrice('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteJob = async (bookingId: string) => {
    setIsSubmitting(true);
    try {
      const result = await updateBooking(bookingId, {
        status: 'completed',
      });

      if (result) {
        toast.success('Job marked as completed!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your bookings and services</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50 shadow-subtle">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-muted">
                  <Briefcase className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalJobs}</p>
                  <p className="text-xs text-muted-foreground">Total Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-subtle">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-muted">
                  <IndianRupee className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{stats.totalEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-subtle">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-muted">
                  <Star className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.avgRating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-subtle">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-muted">
                  <AlertCircle className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingRequests}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <Card className="mb-6 border-border/50 shadow-subtle">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                New Requests
              </CardTitle>
              {stats.pendingRequests > 0 && (
                <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                  {stats.pendingRequests}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y divide-border/50">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingBookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No pending requests</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {pendingBookings.map((booking) => (
                  <div key={booking.id} className="p-5 hover:bg-muted/30 transition-all duration-200 ease-out">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground truncate">
                            {booking.customer?.full_name || 'Customer'}
                          </h3>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {booking.description}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(booking.scheduled_date), 'MMM d')}
                          </span>
                          {booking.scheduled_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {booking.scheduled_time}
                            </span>
                          )}
                          {booking.address && (
                            <span className="flex items-center gap-1 truncate max-w-[180px]">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{booking.address}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setActionType('reject');
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="h-9 bg-black hover:bg-black/80 text-white"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setActionType('accept');
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card className="mb-6 border-border/50 shadow-subtle">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base font-semibold">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activeBookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No active jobs</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {activeBookings.map((booking) => (
                  <div key={booking.id} className="p-5 hover:bg-muted/30 transition-all duration-200 ease-out">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground">
                            {booking.customer?.full_name || 'Customer'}
                          </h3>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {booking.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-semibold text-foreground">
                            ₹{booking.price_quoted || 'Not set'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {booking.status === 'accepted' && booking.customer_confirmed && (
                          <Button
                            size="sm"
                            className="h-9 bg-neutral-700 hover:bg-neutral-800 text-white"
                            onClick={() => updateBooking(booking.id, { status: 'in_progress' })}
                          >
                            Start Job
                          </Button>
                        )}
                        {booking.status === 'in_progress' && (
                          <Button
                            size="sm"
                            className="h-9 bg-black hover:bg-black/80 text-white"
                            onClick={() => handleCompleteJob(booking.id)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Completed */}
        <Card className="border-border/50 shadow-subtle">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base font-semibold">Recent Completed</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {completedBookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No completed jobs yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {completedBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="p-5 hover:bg-muted/30 transition-all duration-200 ease-out">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground truncate">
                            {booking.customer?.full_name || 'Customer'}
                          </h3>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">{booking.service_type}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-foreground">
                          ₹{booking.price_agreed || booking.price_quoted}
                        </p>
                        {booking.review && (
                          <div className="flex items-center gap-1 text-xs text-neutral-600 mt-0.5">
                            <Star className="h-3 w-3 fill-current" />
                            {booking.review.rating}
                          </div>
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

      {/* Accept/Reject Dialog */}
      <Dialog
        open={!!selectedBooking && !!actionType}
        onOpenChange={() => {
          setSelectedBooking(null);
          setActionType(null);
          setQuotedPrice('');
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' ? 'Accept Booking' : 'Reject Booking'}
            </DialogTitle>
          </DialogHeader>

          {actionType === 'accept' && (
            <div className="space-y-3 py-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Quote Your Price (₹)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter your quoted price"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                The customer will confirm the booking after seeing your price quote.
              </p>
            </div>
          )}

          {actionType === 'reject' && (
            <p className="text-sm text-muted-foreground py-2">
              Are you sure you want to reject this booking request?
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedBooking(null);
                setActionType(null);
                setQuotedPrice('');
              }}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              className={`h-10 ${
                actionType === 'accept'
                  ? 'bg-black hover:bg-black/80'
                  : 'bg-neutral-500 hover:bg-neutral-600'
              } text-white`}
              onClick={handleAction}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionType === 'accept' ? 'Accept' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
