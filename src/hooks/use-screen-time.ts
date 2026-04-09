'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * State returned by the `useScreenTime` hook, reflecting the child's
 * current session usage against their daily screen time limit.
 */
export interface ScreenTimeState {
  /** Minutes remaining in today's session (never negative) */
  minutesRemaining: number;
  /** Total minutes allowed per day */
  limitMinutes: number;
  /** Minutes used so far today */
  minutesUsed: number;
  /** Percentage of the limit used (0–100) */
  percentUsed: number;
  /** Whether the daily screen time has been fully consumed */
  isTimeUp: boolean;
  /** Warning level based on usage percentage */
  warningLevel: 'none' | 'warning' | 'urgent';
  /** Human-readable remaining time, e.g. "45 min left" */
  formattedRemaining: string;
  /** Reset the timer to zero (useful for testing) */
  reset: () => void;
}

/** Shape of the JSON blob stored in localStorage per profile. */
interface ScreenTimeStorage {
  /** ISO date string (YYYY-MM-DD) of the recorded session */
  date: string;
  /** Minutes used so far on that date */
  minutes: number;
}

/** localStorage key prefix */
const STORAGE_PREFIX = 'kv-screentime';

/**
 * Returns today's date as a YYYY-MM-DD string.
 */
function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Formats remaining minutes into a friendly string.
 *
 * - >= 60 min → "1h 15m left"
 * - > 0 min  → "45 min left"  (or "1 min left" for singular)
 * - 0 min    → "No time left"
 */
function formatRemaining(minutes: number): string {
  if (minutes <= 0) return 'No time left';
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
  }
  return minutes === 1 ? '1 min left' : `${minutes} min left`;
}

/**
 * Reads persisted screen time data from localStorage for a given profile.
 * Returns `null` if no data exists or the stored date is not today.
 */
function readStorage(profileId: string): ScreenTimeStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}-${profileId}`);
    if (!raw) return null;
    const parsed: ScreenTimeStorage = JSON.parse(raw);
    // If the stored date is not today, treat as expired
    if (parsed.date !== todayKey()) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persists screen time data to localStorage.
 */
function writeStorage(profileId: string, data: ScreenTimeStorage): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}-${profileId}`, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silent fail
  }
}

/**
 * Reads the initial minutes from localStorage for a profile.
 * On SSR or when no valid data exists, returns 0 and seeds a fresh record.
 */
function getInitialMinutes(profileId: string): number {
  const stored = readStorage(profileId);
  if (stored) return stored.minutes;
  // Persist a fresh record for today
  writeStorage(profileId, { date: todayKey(), minutes: 0 });
  return 0;
}

/**
 * Options accepted by the `useScreenTime` hook.
 */
interface UseScreenTimeOptions {
  /** The child's profile ID. Used as part of the localStorage key. */
  profileId: string;
  /** Maximum minutes allowed per day (default 60). */
  limitMinutes?: number;
  /** Whether the timer should auto-increment (default true). Set to false for read-only display. */
  autoTrack?: boolean;
}

/**
 * Tracks a child's screen time usage for the current day.
 *
 * The hook persists minutes used in `localStorage` under the key
 * `kv-screentime-{profileId}`. Every 60 seconds it increments usage
 * by one minute (when `autoTrack` is true). On mount it checks the stored
 * date — if it is a different day the counter resets to zero.
 *
 * @example
 * ```tsx
 * const screen = useScreenTime({ profileId: 'child-42', limitMinutes: 90 });
 * if (screen.isTimeUp) return <TimeUpScreen />;
 * ```
 */
export function useScreenTime(options: UseScreenTimeOptions): ScreenTimeState {
  const { profileId, limitMinutes = 60, autoTrack = true } = options;

  // ---- state (lazy initializer reads from localStorage) ---------------
  const [minutesUsed, setMinutesUsed] = useState<number>(
    () => getInitialMinutes(profileId),
  );

  // ---- auto-increment interval ------------------------------------------
  // Uses functional updater so the callback always sees the latest value
  // without needing an additional ref.
  useEffect(() => {
    if (!autoTrack) return;

    const interval = setInterval(() => {
      setMinutesUsed((prev) => {
        const next = prev + 1;
        writeStorage(profileId, { date: todayKey(), minutes: next });
        return next;
      });
    }, 60_000); // every 60 seconds

    return () => clearInterval(interval);
  }, [profileId, autoTrack]);

  // ---- reset (for testing / parent override) ---------------------------
  const reset = useCallback(() => {
    const fresh: ScreenTimeStorage = { date: todayKey(), minutes: 0 };
    writeStorage(profileId, fresh);
    setMinutesUsed(0);
  }, [profileId]);

  // ---- derived values ---------------------------------------------------
  const minutesRemaining = Math.max(0, limitMinutes - minutesUsed);
  const percentUsed = limitMinutes > 0
    ? Math.min(100, Math.round((minutesUsed / limitMinutes) * 100))
    : 0;
  const isTimeUp = minutesRemaining <= 0;
  const warningLevel: 'none' | 'warning' | 'urgent' = isTimeUp
    ? 'urgent'
    : percentUsed >= 80
      ? 'warning'
      : 'none';

  return {
    minutesRemaining,
    limitMinutes,
    minutesUsed,
    percentUsed,
    isTimeUp,
    warningLevel,
    formattedRemaining: formatRemaining(minutesRemaining),
    reset,
  };
}
