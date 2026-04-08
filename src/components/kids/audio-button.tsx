'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudio } from '@/hooks/use-audio';

/**
 * AudioToggle — Global audio feedback on/off toggle button
 * Placed in the corner of child-facing pages
 * Features:
 * - Large tap target (toddler-friendly)
 * - Animated icon transition (speaker on/off)
 * - Visual feedback on toggle
 * - Screen reader accessible
 * - Optional label text (hidden for toddlers)
 */

export interface AudioToggleProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show text label */
  showLabel?: boolean;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Position class for floating */
  position?: 'none' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const sizeClasses = {
  sm: 'size-9 rounded-xl text-sm',
  md: 'size-12 rounded-2xl text-lg',
  lg: 'min-w-[60px] min-h-[60px] rounded-2xl text-xl',
};

const positionClasses = {
  none: '',
  'top-right': 'fixed top-4 right-4 z-40',
  'top-left': 'fixed top-4 left-4 z-40',
  'bottom-right': 'fixed bottom-4 right-4 z-40 safe-bottom',
  'bottom-left': 'fixed bottom-4 left-4 z-40 safe-bottom',
};

export function AudioToggle({
  className,
  showLabel = false,
  size = 'lg',
  position = 'top-right',
}: AudioToggleProps) {
  const { isEnabled, toggle } = useAudio();

  return (
    <motion.button
      className={cn(
        'flex items-center justify-center gap-2 font-nunito font-bold shadow-kids transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky focus-visible:ring-offset-2',
        sizeClasses[size],
        positionClasses[position],
        isEnabled
          ? 'bg-kids-sun text-kids-dark hover:bg-kids-peach'
          : 'bg-kids-lightgray text-kids-text-muted hover:bg-kids-lightgray/80',
        className
      )}
      onClick={toggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={isEnabled ? 'Mute sound effects' : 'Enable sound effects'}
      aria-pressed={isEnabled}
      title={isEnabled ? 'Sound On' : 'Sound Off'}
      type="button"
    >
      <motion.div
        key={isEnabled ? 'on' : 'off'}
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        {isEnabled ? (
          <Volume2 className="size-5 sm:size-6" aria-hidden="true" />
        ) : (
          <VolumeX className="size-5 sm:size-6" aria-hidden="true" />
        )}
      </motion.div>
      {showLabel && (
        <span className="text-sm hidden sm:inline">
          {isEnabled ? 'Sound On' : 'Sound Off'}
        </span>
      )}
    </motion.button>
  );
}
