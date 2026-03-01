'use client';

import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Cog,
  Sparkles,
  BrickWall,
  Flame,
  LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Cog,
  Sparkles,
  BrickWall,
  Flame,
};

interface SkillIconProps {
  iconName: string;
  className?: string;
}

export function SkillIcon({ iconName, className = 'h-4 w-4' }: SkillIconProps) {
  const Icon = iconMap[iconName];
  
  if (!Icon) {
    return <Wrench className={className} />;
  }
  
  return <Icon className={className} />;
}

export function getSkillIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Wrench;
}
