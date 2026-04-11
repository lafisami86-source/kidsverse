'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface KidsProgressBarProps {
  value: number;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'sky' | 'grass' | 'sun' | 'coral' | 'lavender' | 'rainbow' | 'auto';
  showLabel?: boolean;
  showStars?: boolean;
  label?: string;
  animateDuration?: number;
  animate?: boolean;
  className?: string;
}

const sizeClasses = { sm: 'h-2', md: 'h-4', lg: 'h-6', xl: 'h-8' };

const colorFill: Record<string, string> = {
  sky: 'bg-kids-sky',
  grass: 'bg-kids-grass',
  sun: 'bg-kids-sun',
  coral: 'bg-kids-coral',
  lavender: 'bg-gradient-to-r from-kids-lavender to-kids-purple',
  rainbow: 'bg-gradient-to-r from-kids-coral via-kids-sun to-kids-grass',
};

const colorTrack: Record<string, string> = {
  sky: 'bg-kids-sky/20',
  grass: 'bg-kids-grass/20',
  sun: 'bg-kids-sun/20',
  coral: 'bg-kids-coral/20',
  lavender: 'bg-kids-lavender/20',
  rainbow: 'bg-kids-lightgray',
};

function getAutoFill(pct: number): string {
  if (pct < 25) return 'bg-kids-coral';
  if (pct < 50) return 'bg-kids-peach';
  if (pct < 75) return 'bg-kids-sun';
  return 'bg-kids-grass';
}

function getAutoTrack(pct: number): string {
  if (pct < 25) return 'bg-kids-coral/20';
  if (pct < 50) return 'bg-kids-peach/20';
  if (pct < 75) return 'bg-kids-sun/20';
  return 'bg-kids-grass/20';
}

export function KidsProgressBar({
  value,
  min = 0,
  max = 100,
  size = 'md',
  color = 'auto',
  showLabel = false,
  showStars = false,
  label,
  animateDuration = 0.8,
  animate = true,
  className,
}: KidsProgressBarProps) {
  const clamped = Math.min(Math.max(value, min), max);
  const pct = Math.round(((clamped - min) / (max - min)) * 100);

  const fillClass = color === 'auto' ? getAutoFill(pct) : colorFill[color];
  const trackClass = color === 'auto' ? getAutoTrack(pct) : (colorTrack[color] || 'bg-kids-lightgray');

  const milestones = [25, 50, 75, 100];
  const earned = milestones.filter((m) => pct >= m);

  return (
    <div
      className={cn('w-full', className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={label || `Progress: ${pct}%`}
    >
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-nunito font-bold text-kids-dark">
            {label || 'Progress'}
          </span>
          <span className="text-sm font-nunito font-bold text-kids-text-secondary">
            {pct}%
          </span>
        </div>
      )}

      <div className={cn('relative w-full rounded-full overflow-hidden', sizeClasses[size], trackClass)}>
        <motion.div
          className={cn('h-full rounded-full relative', fillClass)}
          initial={animate ? { width: 0 } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: animateDuration, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
        </motion.div>

        {showStars && (
          <div className="absolute inset-0 flex items-center pointer-events-none">
            {milestones.map((m) => {
              const isEarned = pct >= m;
              return (
                <div
                  key={m}
                  className="absolute"
                  style={{ left: `${m}%`, transform: 'translateX(-50%)' }}
                >
                  <motion.span
                    className={cn('text-xs sm:text-sm drop-shadow-sm', isEarned ? 'opacity-100' : 'opacity-30 grayscale')}
                    animate={isEarned ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.4, delay: animateDuration * (m / 100) }}
                  >
                    ⭐
                  </motion.span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showStars && (
        <div className="flex gap-1 mt-1.5 justify-end">
          {milestones.map((m) => (
            <span
              key={m}
              className={cn('text-xs', earned.includes(m) ? 'opacity-100' : 'opacity-30')}
              aria-hidden="true"
            >
              ⭐
            </span>
          ))}
          <span className="text-xs text-kids-text-secondary ml-1 font-nunito">
            {earned.length}/{milestones.length}
          </span>
        </div>
      )}
    </div>
  );
}
