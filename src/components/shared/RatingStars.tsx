'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = true,
  interactive = false,
  onChange,
}: RatingStarsProps) {
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    const filled = i <= rating;
    stars.push(
      <Star
        key={i}
        className={cn(
          sizeClasses[size],
          filled ? 'fill-black text-black' : 'fill-none text-neutral-300',
          interactive && 'cursor-pointer hover:scale-110 transition-transform'
        )}
        onClick={() => interactive && onChange?.(i)}
      />
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">{stars}</div>
      {showValue && (
        <span className="ml-1 text-sm text-neutral-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
