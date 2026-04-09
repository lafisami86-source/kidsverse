'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { KidsCard } from './kids-card';
import { useAudio } from '@/hooks/use-audio';

export interface SectionCardProps {
  section: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  colorClass: string;
  href: string;
  showText?: boolean;
  tapSize?: 'toddler' | 'early' | 'kid';
  delay?: number;
}

const tapSizeClasses = {
  toddler: 'min-h-[120px] min-w-[120px]',
  early: 'min-h-[100px] min-w-[100px]',
  kid: 'min-h-[80px]',
};

export function SectionCard({
  icon,
  label,
  description,
  colorClass,
  href,
  showText = true,
  tapSize = 'early',
  delay = 0,
}: SectionCardProps) {
  const router = useRouter();
  const { play } = useAudio({ frequency: 600, type: 'triangle' });

  const handleClick = () => {
    play();
    router.push(href);
  };

  return (
    <KidsCard
      variant="interactive"
      padding="none"
      className={cn('flex flex-col items-center justify-center gap-2 p-4', tapSizeClasses[tapSize], colorClass)}
      onClick={handleClick}
      delay={delay}
    >
      <motion.div
        className="text-4xl sm:text-5xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
        aria-hidden="true"
      >
        {icon}
      </motion.div>
      {showText && (
        <span className="text-base sm:text-lg font-nunito font-bold text-kids-dark text-center leading-tight">
          {label}
        </span>
      )}
      {showText && description && (
        <span className="text-xs sm:text-sm text-kids-text-secondary text-center hidden sm:block">
          {description}
        </span>
      )}
      {!showText && <span className="sr-only">{label}</span>}
    </KidsCard>
  );
}
