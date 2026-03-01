'use client';

import { useState, useEffect, use } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useBookings } from '@/hooks/useBookings';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ChatWindow } from '@/components/shared/ChatWindow';
import { RatingStars } from '@/components/shared/RatingStars';
import { SkillIcon } from '@/components/shared/SkillIcon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  MessageSquare,
  Star,
  IndianRupee,
  Check,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { SKILL_CATEGORIES } from '@/types';

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuthStore();
  const { currentBooking, isLoading, fetchBookingById, updateBooking } = useBookings();
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (user?.id && resolvedParams.id) {
      fetchBookingById(resolvedParams.id);
    }
  }, [user?.id, resolvedParams.id, fetchBookingById]);

  const handleSendMessage = async (message: string) => {
    if (!user?.id || !currentBooking) return;
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          booking_id: currentBooking.id,
          message,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Refresh booking to get updated messages
        fetchBookingById(resolvedParams.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMarkMessagesRead = async () => {
    if (!user?.id || !currentBooking) return;
    
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          booking_id: currentBooking.id,
        }),
      });
    } catch (error) {
      console.error('Error marking messages read:', error);
    }
  };

  const handleConfirmPrice = async () => {
    if (!currentBooking) return;
    
    setIsSubmitting(true);
    try {
      const result = await updateBooking(currentBooking.id, {
        customer_confirmed: true,
        price_agreed: currentBooking.price_quoted,
      });

      if (result) {
        toast.success('Booking confirmed! The worker will start soon.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user?.id || !currentBooking) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          booking_id: currentBooking.id,
          rating: reviewRating,
          review_text: reviewText,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Review submitted successfully!');
        setShowReview(false);
        fetchBookingById(resolvedParams.id);
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !currentBooking) {
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

  const isCustomer = user?.role === 'customer';
  const otherParty = isCustomer ? currentBooking.worker?.user : currentBooking.customer;
  const skillInfo = SKILL_CATEGORIES.find((s) => s.value === currentBooking.service_type);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold text-lg text-foreground">
                <div className="flex items-center gap-2">
                  <SkillIcon iconName={skillInfo?.icon ?? 'Wrench'} className="h-5 w-5" />
                  <span>{skillInfo?.label || currentBooking.service_type}</span>
                </div>
              </h1>
              <p className="text-sm text-muted-foreground">
                Booking #{currentBooking.id.slice(0, 8)}
              </p>
            </div>
            <StatusBadge status={currentBooking.status} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Booking Details */}
        <Card className="border-border/50 shadow-subtle">
          <CardHeader>
            <CardTitle className="text-lg">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-neutral-100">
                  <User className="h-5 w-5 text-neutral-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isCustomer ? 'Worker' : 'Customer'}
                  </p>
                  <p className="font-medium text-foreground">{otherParty?.full_name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-neutral-100">
                  <Calendar className="h-5 w-5 text-neutral-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled Date</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(currentBooking.scheduled_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {currentBooking.scheduled_time && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-neutral-200">
                    <Clock className="h-5 w-5 text-neutral-800" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled Time</p>
                    <p className="font-medium text-foreground">{currentBooking.scheduled_time}</p>
                  </div>
                </div>
              )}

              {currentBooking.address && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-neutral-100">
                    <MapPin className="h-5 w-5 text-neutral-700" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service Address</p>
                    <p className="font-medium text-foreground">{currentBooking.address}</p>
                  </div>
                </div>
              )}
            </div>

            {currentBooking.description && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-foreground">{currentBooking.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Section */}
        {currentBooking.price_quoted && (
          <Card className="border-border/50 shadow-subtle">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quoted Price</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{currentBooking.price_agreed || currentBooking.price_quoted}
                  </p>
                </div>
                {isCustomer && currentBooking.status === 'accepted' && !currentBooking.customer_confirmed && (
                  <Button
                    className="bg-black hover:bg-black/80 text-white"
                    onClick={handleConfirmPrice}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Check className="h-4 w-4 mr-2" />
                    Confirm & Accept Price
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Section */}
        {currentBooking.status === 'completed' && isCustomer && (
          <Card className="border-border/50 shadow-subtle">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-black" />
                Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentBooking.review ? (
                <div className="space-y-2">
                  <RatingStars rating={currentBooking.review.rating} showValue />
                  {currentBooking.review.review_text && (
                    <p className="text-muted-foreground">{currentBooking.review.review_text}</p>
                  )}
                </div>
              ) : (
                <Button onClick={() => setShowReview(true)} className="bg-black hover:bg-black/80 text-white">
                  Leave a Review
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chat Section */}
        <Card className="border-border/50 shadow-subtle">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChatWindow
              bookingId={currentBooking.id}
              currentUserId={user?.id || ''}
              messages={currentBooking.messages || []}
              onSendMessage={handleSendMessage}
              onMarkAsRead={handleMarkMessagesRead}
            />
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 cursor-pointer transition-colors ${
                      star <= reviewRating
                        ? 'fill-black text-black'
                        : 'text-neutral-300'
                    }`}
                    onClick={() => setReviewRating(star)}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review">Your Review (optional)</Label>
              <textarea
                id="review"
                className="w-full mt-2 min-h-[100px] rounded-md border border-border bg-background p-3 text-foreground"
                placeholder="Share your experience..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReview(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview} disabled={isSubmitting} className="bg-black hover:bg-black/80 text-white">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
