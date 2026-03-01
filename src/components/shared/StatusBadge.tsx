'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-neutral-100 text-neutral-700 border-neutral-300' },
  accepted: { label: 'Accepted', className: 'bg-neutral-800 text-white border-neutral-800' },
  rejected: { label: 'Rejected', className: 'bg-neutral-400 text-white border-neutral-400' },
  in_progress: { label: 'In Progress', className: 'bg-neutral-200 text-neutral-800 border-neutral-300' },
  completed: { label: 'Completed', className: 'bg-black text-white border-black' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-border' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      variant="outline"
      className={cn('text-[11px] font-medium px-2 py-0.5 rounded-md', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
