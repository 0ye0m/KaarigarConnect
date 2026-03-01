'use client';

import Link from 'next/link';
import { MapPin, Star, IndianRupee, Briefcase, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkillIcon } from '@/components/shared/SkillIcon';
import { VerifiedBadgePremium } from '@/components/shared/VerifiedBadge';
import { SKILL_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';

interface WorkerCardProps {
  worker: {
    id: string;
    skill_category: string;
    experience_years: number;
    hourly_rate: number;
    is_available: boolean;
    is_verified: boolean;
    total_jobs: number;
    rating: number;
    rating_count: number;
    latitude: number | null;
    longitude: number | null;
    user?: {
      full_name: string | null;
      phone: string | null;
      avatar_url: string | null;
      city: string | null;
    } | null;
  };
  userLat?: number;
  userLng?: number;
  distance?: number;
  onBook?: () => void;
}

export function WorkerCard({ worker, userLat, userLng, distance, onBook }: WorkerCardProps) {
  const skillInfo = SKILL_CATEGORIES.find((s) => s.value === worker.skill_category);
  
  const calculatedDistance =
    distance ??
    (userLat && userLng && worker.latitude && worker.longitude
      ? Math.round(
          ((lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371;
            const dLat = ((lat2 - lat1) * Math.PI) / 180;
            const dLon = ((lon2 - lon1) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          })(userLat, userLng, worker.latitude, worker.longitude) * 10
        ) / 10
      : null);

  const getInitials = (name: string | null) => {
    if (!name) return 'W';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDistance = (dist: number) => {
    if (dist < 1) return `${Math.round(dist * 1000)}m`;
    return `${dist.toFixed(1)}km`;
  };

  return (
    <Card className="group border border-border/40 bg-card hover:border-border hover:shadow-lg transition-all duration-300 ease-out overflow-hidden">
      <CardContent className="p-0">
        {/* Top Section with Avatar and Basic Info */}
        <div className="p-5 pb-4">
          <div className="flex gap-4">
            {/* Avatar Section */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                <AvatarImage src={worker.user?.avatar_url || ''} />
                <AvatarFallback className="bg-neutral-100 text-neutral-800 font-semibold text-lg">
                  {getInitials(worker.user?.full_name || null)}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              {worker.is_available && (
                <span className="absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-black border-2 border-background" />
                </span>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0">
              {/* Name with Verified Badge */}
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-foreground text-base truncate">
                  {worker.user?.full_name || 'Worker'}
                </h3>
                {worker.is_verified && <VerifiedBadgePremium size="sm" />}
              </div>

              {/* Skill Category */}
              <div className="flex items-center gap-1.5 mt-1">
                <SkillIcon iconName={skillInfo?.icon ?? 'Wrench'} className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{skillInfo?.label || worker.skill_category}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-black fill-black" />
                  <span className="font-semibold text-sm">{worker.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">({worker.rating_count})</span>
                </div>
                <span className="text-muted-foreground/40">·</span>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{worker.total_jobs} jobs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* Stats Section */}
        <div className="px-5 py-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{worker.hourly_rate}</span>
              <span className="text-muted-foreground text-sm">/hr</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Experience */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{worker.experience_years} yrs exp</span>
              </div>

              {/* Availability Badge */}
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs font-medium px-2 py-0.5 border-0',
                  worker.is_available 
                    ? 'bg-black text-white hover:bg-black/80' 
                    : 'bg-neutral-200 text-neutral-600'
                )}
              >
                {worker.is_available ? 'Available' : 'Busy'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Location Section */}
        {(worker.user?.city || calculatedDistance !== null) && (
          <div className="px-5 py-2.5 border-t border-border/30">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {worker.user?.city && <span>{worker.user?.city}</span>}
              {calculatedDistance !== null && (
                <span className="text-muted-foreground/60">
                  {worker.user?.city && '· '}
                  {formatDistance(calculatedDistance)} away
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-5 pt-3 flex gap-2 border-t border-border/30">
          <Link href={`/worker/${worker.id}`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full h-10 text-sm font-medium border-border hover:bg-muted"
            >
              View Profile
            </Button>
          </Link>
          {worker.is_available && onBook && (
            <Button 
              onClick={onBook} 
              className="flex-1 h-10 text-sm font-medium bg-black hover:bg-black/90 text-white shadow-sm"
            >
              Book Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
