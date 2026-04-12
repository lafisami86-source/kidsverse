'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface StreakData {
  /** Consecutive days of activity */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** ISO date string YYYY-MM-DD of the last active day */
  lastActiveDate: string;
  /** Total accumulated stars */
  totalStars: number;
  /** Activities completed today (activity IDs) */
  todayActivities: string[];
  /** IDs of earned reward milestones */
  rewards: string[];
}

export interface StreakMilestone {
  days: number;
  id: string;
  label: string;
  emoji: string;
}

export interface UseStreakReturn {
  streakData: StreakData;
  logActivity: (activityId: string) => StreakData;
  addStars: (count: number) => StreakData;
  checkAndAwardRewards: () => StreakMilestone[];
  resetStreak: () => StreakData;
  /** Whether a streak was just broken (useful for UI feedback) */
  streakBroken: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'kv-streak-data';

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, id: 'bronze', label: 'Bronze Star', emoji: '🎉' },
  { days: 7, id: 'silver', label: 'Silver Star', emoji: '🥈' },
  { days: 14, id: 'gold', label: 'Gold Star', emoji: '🥇' },
  { days: 30, id: 'champion', label: 'Champion', emoji: '🏆' },
];

const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  totalStars: 0,
  todayActivities: [],
  rewards: [],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Returns today's date as a YYYY-MM-DD string using local timezone */
function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns yesterday's date as a YYYY-MM-DD string */
function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Calculate the difference in calendar days between two YYYY-MM-DD strings */
function daysBetween(a: string, b: string): number {
  if (!a || !b) return Infinity;
  const dateA = new Date(a + 'T00:00:00');
  const dateB = new Date(b + 'T00:00:00');
  const diffMs = Math.abs(dateA.getTime() - dateB.getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/** Safely read streak data from localStorage */
function loadStreakData(): StreakData {
  if (typeof window === 'undefined') return DEFAULT_STREAK_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STREAK_DATA;
    const parsed = JSON.parse(raw) as Partial<StreakData>;
    return {
      currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0,
      longestStreak: typeof parsed.longestStreak === 'number' ? parsed.longestStreak : 0,
      lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : '',
      totalStars: typeof parsed.totalStars === 'number' ? parsed.totalStars : 0,
      todayActivities: Array.isArray(parsed.todayActivities) ? parsed.todayActivities : [],
      rewards: Array.isArray(parsed.rewards) ? parsed.rewards : [],
    };
  } catch {
    return DEFAULT_STREAK_DATA;
  }
}

/** Persist streak data to localStorage */
function saveStreakData(data: StreakData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable – silently fail
  }
}

/**
 * Validates and adjusts streak data on load.
 * If the last active date is before yesterday, the streak should be reset.
 * If the last active date is yesterday or today, streak is still valid.
 * If we're on a new day, clear today's activities.
 */
function validateStreak(data: StreakData): { data: StreakData; streakBroken: boolean } {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  let streakBroken = false;

  if (!data.lastActiveDate) {
    // First time user – nothing to adjust
    return { data: { ...data, todayActivities: [] }, streakBroken: false };
  }

  if (data.lastActiveDate === today) {
    // Same day – data is current
    return { data, streakBroken: false };
  }

  if (data.lastActiveDate === yesterday) {
    // Yesterday – streak is valid, but clear today's activities since it's a new day
    return {
      data: { ...data, todayActivities: [] },
      streakBroken: false,
    };
  }

  // Last active was 2+ days ago – streak is broken
  if (data.currentStreak > 0) {
    streakBroken = true;
  }
  return {
    data: {
      ...data,
      currentStreak: 0,
      todayActivities: [],
    },
    streakBroken,
  };
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useStreak(): UseStreakReturn {
  // Lazy initializer: read from localStorage on first client render only
  const [streakData, setStreakData] = useState<StreakData>(() => {
    if (typeof window === 'undefined') return DEFAULT_STREAK_DATA;
    const raw = loadStreakData();
    const { data: validated } = validateStreak(raw);
    return validated;
  });

  // Derive streakBroken from data: active if longestStreak > 0 but currentStreak is 0
  // and there was a lastActiveDate (meaning they played before but broke the streak)
  const streakBroken = streakData.longestStreak > 0
    && streakData.currentStreak === 0
    && streakData.lastActiveDate !== ''
    && streakData.lastActiveDate !== getTodayDateString()
    && streakData.lastActiveDate !== getYesterdayDateString();

  const isMountedRef = useRef(false);

  // Persist to localStorage whenever streakData changes (after initial mount)
  useEffect(() => {
    if (isMountedRef.current) {
      saveStreakData(streakData);
    } else {
      isMountedRef.current = true;
    }
  }, [streakData]);

  /**
   * Log an activity as completed today.
   * Handles streak incrementing / resetting automatically.
   * Returns the updated StreakData.
   */
  const logActivity = useCallback((activityId: string): StreakData => {
    setStreakData((prev) => {
      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();

      let newStreak = prev.currentStreak;
      let newLongest = prev.longestStreak;
      let newActivities = [...prev.todayActivities];

      if (prev.lastActiveDate === today) {
        // Same day – just add the activity if it hasn't been logged yet
        if (!newActivities.includes(activityId)) {
          newActivities.push(activityId);
        }
      } else if (prev.lastActiveDate === yesterday) {
        // Consecutive day – increment streak
        newStreak = prev.currentStreak + 1;
        newLongest = Math.max(newLongest, newStreak);
        newActivities = [activityId];
      } else {
        // Streak was broken or first activity – start fresh
        newStreak = 1;
        newLongest = Math.max(newLongest, 1);
        newActivities = [activityId];
      }

      const updated: StreakData = {
        ...prev,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: today,
        todayActivities: newActivities,
      };

      return updated;
    });

    // Return the latest state synchronously is tricky with React state,
    // so we compute it manually for the return value
    const prev = streakData; // We read from current state for return
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    let newStreak = prev.currentStreak;
    let newLongest = prev.longestStreak;
    let newActivities = [...prev.todayActivities];

    if (prev.lastActiveDate === today) {
      if (!newActivities.includes(activityId)) {
        newActivities.push(activityId);
      }
    } else if (prev.lastActiveDate === yesterday) {
      newStreak = prev.currentStreak + 1;
      newLongest = Math.max(newLongest, newStreak);
      newActivities = [activityId];
    } else {
      newStreak = 1;
      newLongest = Math.max(newLongest, 1);
      newActivities = [activityId];
    }

    return {
      ...prev,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
      todayActivities: newActivities,
    };
  }, [streakData]);

  /**
   * Add stars to the user's total.
   * Returns the updated StreakData.
   */
  const addStars = useCallback((count: number): StreakData => {
    const safeCount = Math.max(0, Math.min(count, 9999));
    setStreakData((prev) => ({
      ...prev,
      totalStars: prev.totalStars + safeCount,
    }));
    return {
      ...streakData,
      totalStars: streakData.totalStars + safeCount,
    };
  }, [streakData]);

  /**
   * Check if any new reward milestones have been reached.
   * Returns an array of newly-earned milestones (to show notifications).
   * Each earned milestone is added to the rewards list automatically.
   */
  const checkAndAwardRewards = useCallback((): StreakMilestone[] => {
    const newlyEarned: StreakMilestone[] = [];

    setStreakData((prev) => {
      const earned: StreakMilestone[] = [];

      for (const milestone of STREAK_MILESTONES) {
        if (
          prev.currentStreak >= milestone.days &&
          !prev.rewards.includes(milestone.id)
        ) {
          earned.push(milestone);
        }
      }

      if (earned.length > 0) {
        // Push to outer scope for return
        newlyEarned.push(...earned);
        return {
          ...prev,
          rewards: [...prev.rewards, ...earned.map((m) => m.id)],
        };
      }

      return prev;
    });

    return newlyEarned;
  }, []);

  /**
   * Manually reset the streak (e.g., for testing or admin use).
   */
  const resetStreak = useCallback((): StreakData => {
    const reset: StreakData = {
      ...streakData,
      currentStreak: 0,
      todayActivities: [],
    };
    setStreakData(reset);
    return reset;
  }, [streakData]);

  return {
    streakData,
    logActivity,
    addStars,
    checkAndAwardRewards,
    resetStreak,
    streakBroken,
  };
}
