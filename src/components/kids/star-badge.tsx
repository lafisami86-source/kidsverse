'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAudio } from '@/hooks/use-audio';

export interface StarBadgeProps {
  /** Star count to display (0-5) */
  count: number;
  /** Maximum stars possible (default: 5) */
  max?: number;
  /** Star size in pixels (default: 32) */
  size?: number;
  /** Whether stars are animated on mount */
  animate?: boolean;
  /** Whether to play sound when all stars earned */
  playSoundOnComplete?: boolean;
  /** Whether the badge is interactive (click to replay animation) */
  interactive?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label override */
  ariaLabel?: string;
}

export function StarBadge({
  count,
  max = 5,
  size = 32,
  animate = true,
  playSoundOnComplete = true,
  interactive = false,
  className,
  ariaLabel,
}: StarBadgeProps) {
  const clampedCount = Math.min(Math.max(count, 0), max);
  const isComplete = clampedCount >= max;
  const { play: playBadgeSound } = useAudio({ frequency: 1000, type: 'sine', duration: 300 });

  const handleClick = () => {
    if (interactive && isComplete && playSoundOnComplete) {
      playBadgeSound();
    }
  };

  return (
    <div
      className={cn('inline-flex items-center gap-1', interactive && 'cursor-pointer', className)}
      onClick={handleClick}
      role="img"
      aria-label={ariaLabel || `${clampedCount} of ${max} stars earned`}
    >
      {Array.from({ length: max }, (_, i) => {
        const isFilled = i < clampedCount;
        return (
          <motion.span
            key={i}
            className="inline-block"
            style={{ fontSize: size, lineHeight: 1 }}
            initial={animate && isFilled ? { scale: 0, rotate: -180 } : { scale: 1 }}
            animate={
              animate && isFilled
                ? {
                    scale: 1,
                    rotate: 0,
                    filter: isComplete && i === max - 1 ? ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] : undefined,
                  }
                : { scale: 1, rotate: 0 }
            }
            transition={
              animate && isFilled
                ? {
                    type: 'spring',
                    stiffness: 260,
                    damping: 15,
                    delay: i * 0.15,
                    ...(isComplete && i === max - 1 ? { filter: { duration: 0.6, repeat: 1, repeatDelay: 0.3 } } : {}),
                  }
                : {}
            }
            whileHover={interactive ? { scale: 1.2, rotate: [0, -10, 10, 0] } : {}}
            aria-hidden="true"
          >
            {isFilled ? '⭐' : '☆'}
          </motion.span>
        );
      })}
    </div>
  );
}
