'use client';

import { useMemo } from 'react';
import { AGE_RANGES } from '@/lib/constants';

/**
 * Configuration for a specific age group, controlling UI sizing,
 * content filtering, greetings, mascot display, and navigation behavior.
 */
export interface AgeGroupConfig {
  /** Which age group bucket this falls into */
  ageGroup: 'toddler' | 'early' | 'kid';
  /** Human-readable label for the age group */
  label: string;
  /** Minimum tap target size class */
  tapSize: 'toddler' | 'early' | 'kid';
  /** Base font size class */
  fontSize: 'text-lg' | 'text-base' | 'text-sm';
  /** Icon size class */
  iconSize: 'text-5xl' | 'text-4xl' | 'text-3xl';
  /** Card padding class */
  cardPadding: 'p-6' | 'p-4' | 'p-3';
  /** Grid columns class for content grids */
  gridCols: 'grid-cols-2' | 'grid-cols-3' | 'grid-cols-4';
  /** Categories allowed for this age group */
  allowedCategories: string[];
  /** Maximum game difficulty (1=easy, 2=medium, 3=hard) */
  maxGameDifficulty: number;
  /** Whether to show text labels (toddlers may not read yet) */
  showTextLabels: boolean;
  /** Whether to show longer descriptions */
  showDescriptions: boolean;
  /** Friendly greeting message */
  greeting: string;
  /** Mascot size token */
  mascotSize: 'size-32' | 'size-24' | 'size-20';
  /** Whether to show the bottom navigation bar */
  showBottomNav: boolean;
  /** Whether to show text labels under navigation icons */
  navLabels: boolean;
}

/**
 * Pre-defined configurations keyed by age group.
 * Ordered from youngest (toddler) to oldest (kid).
 */
const AGE_CONFIGS: Record<'toddler' | 'early' | 'kid', AgeGroupConfig> = {
  toddler: {
    ageGroup: 'toddler',
    label: AGE_RANGES.toddler.label,
    tapSize: 'toddler',
    fontSize: 'text-lg',
    iconSize: 'text-5xl',
    cardPadding: 'p-6',
    gridCols: 'grid-cols-2',
    allowedCategories: ['alphabet', 'numbers', 'colors', 'shapes', 'songs', 'art'],
    maxGameDifficulty: 1,
    showTextLabels: false,
    showDescriptions: false,
    greeting: 'Time to play!',
    mascotSize: 'size-32',
    showBottomNav: true,
    navLabels: false,
  },
  early: {
    ageGroup: 'early',
    label: AGE_RANGES.early.label,
    tapSize: 'early',
    fontSize: 'text-base',
    iconSize: 'text-4xl',
    cardPadding: 'p-4',
    gridCols: 'grid-cols-3',
    allowedCategories: ['alphabet', 'numbers', 'colors', 'shapes', 'science', 'stories', 'songs', 'art', 'games'],
    maxGameDifficulty: 2,
    showTextLabels: true,
    showDescriptions: false,
    greeting: "Let's learn something new!",
    mascotSize: 'size-24',
    showBottomNav: true,
    navLabels: true,
  },
  kid: {
    ageGroup: 'kid',
    label: AGE_RANGES.kid.label,
    tapSize: 'kid',
    fontSize: 'text-sm',
    iconSize: 'text-3xl',
    cardPadding: 'p-3',
    gridCols: 'grid-cols-4',
    allowedCategories: ['alphabet', 'numbers', 'colors', 'shapes', 'science', 'stories', 'songs', 'art', 'games'],
    maxGameDifficulty: 3,
    showTextLabels: true,
    showDescriptions: true,
    greeting: 'Welcome back!',
    mascotSize: 'size-20',
    showBottomNav: true,
    navLabels: true,
  },
};

/**
 * Determines the age group key from a numeric age (2–10).
 * Clamps out-of-range values to the nearest bucket.
 */
function resolveAgeGroup(age: number): 'toddler' | 'early' | 'kid' {
  if (age <= AGE_RANGES.toddler.max) return 'toddler';
  if (age <= AGE_RANGES.early.max) return 'early';
  return 'kid';
}

/**
 * Provides age-appropriate UI and content settings based on a child's age.
 *
 * @param age - The child's age in years (2–10). Values outside this range
 *              are clamped to the nearest supported bucket.
 * @returns A frozen `AgeGroupConfig` object with all settings for the age group.
 *
 * @example
 * ```tsx
 * const config = useAgeGroup(5);
 * // config.fontSize === 'text-base'
 * // config.maxGameDifficulty === 2
 * ```
 */
export function useAgeGroup(age: number): AgeGroupConfig {
  const groupKey = resolveAgeGroup(age);

  return useMemo(() => AGE_CONFIGS[groupKey], [groupKey]);
}
