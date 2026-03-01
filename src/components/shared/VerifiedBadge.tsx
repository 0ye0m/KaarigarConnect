'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export function VerifiedBadge({ size = 'md', className, showTooltip = true }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const iconSize = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  };

  return (
    <div 
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-black flex-shrink-0',
        sizeClasses[size],
        className
      )}
      title={showTooltip ? 'Verified Professional' : undefined}
    >
      <Check 
        className={cn(
          'text-white stroke-[3]',
          iconSize[size]
        )} 
      />
    </div>
  );
}

// Badge that shows next to name with a nice checkmark
export function VerifiedBadgeInline({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="relative flex items-center justify-center">
        <span className="absolute inset-0 bg-black rounded-full animate-ping opacity-20" />
        <span className="relative flex items-center justify-center h-4 w-4 bg-black rounded-full">
          <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
        </span>
      </span>
    </span>
  );
}

// Premium verified badge with ring effect
export function VerifiedBadgePremium({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 ring-2',
    md: 'h-5 w-5 ring-2',
    lg: 'h-6 w-6 ring-[3px]',
  };

  const iconSize = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <span 
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-black ring-white flex-shrink-0',
        sizeClasses[size]
      )}
    >
      <Check className={cn('text-white stroke-[2.5]', iconSize[size])} />
    </span>
  );
}
