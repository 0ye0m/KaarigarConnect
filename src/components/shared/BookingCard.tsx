'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { SKILL_CATEGORIES } from '@/types';

interface BookingCardProps {
  booking: {
    id: string;
    service_type: string;
    description: string | null;
    scheduled_date: Date;
    scheduled_time: string | null;
    address: string | null;
    status: string;
    price_quoted: number | null;
    price_agreed: number | null;
    customer?: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    } | null;
    worker?: {
      id: string;
      skill_category: string;
      user?: {
        full_name: string | null;
        avatar_url: string | null;
      } | null;
    } | null;
  };
  userRole: 'customer' | 'worker';
  showChat?: boolean;
}

export function BookingCard({ booking, userRole, showChat = true }: BookingCardProps) {
  const skillInfo = SKILL_CATEGORIES.find((s) => s.value === booking.service_type);
  const otherParty = userRole === 'customer' ? booking.worker?.user : booking.customer;

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="group border-0 shadow-subtle hover:shadow-subtle-md transition-all duration-200 ease-out bg-card">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border border-border/50">
            <AvatarImage src={otherParty?.avatar_url || ''} />
            <AvatarFallback className="bg-muted text-muted-foreground font-medium">
              {getInitials(otherParty?.full_name || null)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {otherParty?.full_name || 'Unknown'}
              </h3>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {skillInfo?.icon} {skillInfo?.label || booking.service_type}
            </p>
          </div>
        </div>

        {/* Description */}
        {booking.description && (
          <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
            {booking.description}
          </p>
        )}

        {/* Details */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {format(new Date(booking.scheduled_date), 'MMM d, yyyy')}
          </div>
          {booking.scheduled_time && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {booking.scheduled_time}
            </div>
          )}
          {booking.address && (
            <div className="flex items-center gap-1.5 truncate max-w-[200px]">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{booking.address}</span>
            </div>
          )}
        </div>

        {/* Price */}
        {(booking.price_quoted || booking.price_agreed) && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <span className="text-sm text-muted-foreground">
              {booking.price_agreed ? 'Final Price' : 'Quoted Price'}
            </span>
            <span className="font-semibold text-foreground">
              ₹{booking.price_agreed || booking.price_quoted}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Link href={`/booking/${booking.id}`} className="flex-1">
            <Button variant="outline" className="w-full h-9 text-sm">
              View Details
            </Button>
          </Link>
          {showChat && (
            <Link href={`/booking/${booking.id}?chat=true`}>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
