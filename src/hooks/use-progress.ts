'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ModuleId,
  ModuleProgress,
  LessonProgress,
  LearningSummary,
} from '@/types/learning';
import { getAllLessons } from '@/types/learning';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UseProgressOptions {
  profileId: string;
  moduleId?: ModuleId;
}

interface UseProgressReturn {
  /** Map of lessonId -> LessonProgress */
  lessons: Record<string, LessonProgress>;
  /** Per-module progress summaries */
  modules: Record<ModuleId, ModuleProgress>;
  /** Overall summary */
  summary: LearningSummary;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Mark a lesson as completed with stars/score */
  completeLesson: (
    moduleId: ModuleId,
    lessonId: string,
    stars: number,
    score: number,
  ) => Promise<void>;
  /** Refetch progress from API */
  refetch: () => Promise<void>;
}

// ─── API response shape ──────────────────────────────────────────────────────

interface ProgressRecord {
  id: string;
  moduleId: string;
  lessonId: string;
  completed: boolean;
  score: number;
  stars: number;
  completedAt: string | null;
}

// ─── Empty defaults ──────────────────────────────────────────────────────────

const ALL_MODULE_IDS: ModuleId[] = [
  'alphabet',
  'numbers',
  'colors',
  'science',
];

function emptyModulesMap(): Record<ModuleId, ModuleProgress> {
  const map = {} as Record<ModuleId, ModuleProgress>;
  for (const id of ALL_MODULE_IDS) {
    const allLessons = getAllLessons(id);
    map[id] = {
      moduleId: id,
      totalLessons: allLessons.length,
      completedLessons: 0,
      totalStars: 0,
      maxStars: allLessons.length * 3,
      percentComplete: 0,
      isStarted: false,
      isComplete: false,
    };
  }
  return map;
}

function emptySummary(): LearningSummary {
  return {
    modules: [],
    totalStars: 0,
    totalCompletedLessons: 0,
    totalLessons: 0,
    streak: 0,
  };
}

// ─── Computation helpers ─────────────────────────────────────────────────────

function buildModuleProgress(
  moduleId: ModuleId,
  lessons: Record<string, LessonProgress>,
): ModuleProgress {
  const allLessons = getAllLessons(moduleId);
  const totalLessons = allLessons.length;
  const maxStars = totalLessons * 3;

  let completedLessons = 0;
  let totalStars = 0;

  for (const lesson of allLessons) {
    const progress = lessons[lesson.id];
    if (progress && progress.isCompleted) {
      completedLessons += 1;
      totalStars += progress.stars;
    }
  }

  const percentComplete =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    moduleId,
    totalLessons,
    completedLessons,
    totalStars,
    maxStars,
    percentComplete,
    isStarted: completedLessons > 0,
    isComplete: completedLessons === totalLessons,
  };
}

function buildSummary(
  modulesMap: Record<ModuleId, ModuleProgress>,
): LearningSummary {
  const modules = ALL_MODULE_IDS.map((id) => modulesMap[id]);
  const totalStars = modules.reduce((sum, m) => sum + m.totalStars, 0);
  const totalCompletedLessons = modules.reduce(
    (sum, m) => sum + m.completedLessons,
    0,
  );
  const totalLessons = modules.reduce((sum, m) => sum + m.totalLessons, 0);

  return {
    modules,
    totalStars,
    totalCompletedLessons,
    totalLessons,
    streak: 0,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useProgress — tracks learning module completion and scores.
 *
 * - Fetches progress from `/api/progress?profileId={profileId}` on mount.
 * - Computes `ModuleProgress` and `LearningSummary` from raw lesson data.
 * - `completeLesson()` POSTs to `/api/progress` with optimistic local updates.
 */
export function useProgress({
  profileId,
  moduleId: _moduleId,
}: UseProgressOptions): UseProgressReturn {
  const [lessons, setLessons] = useState<Record<string, LessonProgress>>({});
  const [modules, setModules] = useState<Record<ModuleId, ModuleProgress>>(
    emptyModulesMap,
  );
  const [summary, setSummary] = useState<LearningSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Keep track of mounted state for safe async updates
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Recompute derived state whenever lessons change
  useEffect(() => {
    const newModules = emptyModulesMap();
    for (const id of ALL_MODULE_IDS) {
      newModules[id] = buildModuleProgress(id, lessons);
    }
    setModules(newModules);
    setSummary(buildSummary(newModules));
  }, [lessons]);

  // Fetch progress from the API
  const fetchProgress = useCallback(async () => {
    if (!profileId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/progress?profileId=${encodeURIComponent(profileId)}`,
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch progress (${res.status})`);
      }

      const data: { progress: ProgressRecord[] } = await res.json();

      // Convert API records into LessonProgress map
      const map: Record<string, LessonProgress> = {};
      for (const record of data.progress) {
        map[record.lessonId] = {
          lessonId: record.lessonId,
          moduleId: record.moduleId as ModuleId,
          isCompleted: record.completed,
          stars: record.stars,
          score: record.score,
          attempts: record.completed ? 1 : 0,
          lastPlayed: record.completedAt ?? undefined,
        };
      }

      if (mountedRef.current) {
        setLessons(map);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch progress',
        );
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [profileId]);

  // Initial fetch on mount (and when profileId changes)
  useEffect(() => {
    void fetchProgress();
  }, [fetchProgress]);

  // Complete a lesson with optimistic updates
  const completeLesson = useCallback(
    async (
      mId: ModuleId,
      lessonId: string,
      stars: number,
      score: number,
    ) => {
      // Snapshot previous state for rollback
      const prevLessons = { ...lessons };

      // Optimistic update — apply immediately
      const existing = prevLessons[lessonId];
      const updated: LessonProgress = {
        lessonId,
        moduleId: mId,
        isCompleted: true,
        stars: Math.max(existing?.stars ?? 0, stars),
        score: Math.max(existing?.score ?? 0, score),
        attempts: (existing?.attempts ?? 0) + 1,
        lastPlayed: new Date().toISOString(),
      };

      if (mountedRef.current) {
        setLessons({ ...prevLessons, [lessonId]: updated });
      }

      // Send to API
      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId,
            moduleId: mId,
            lessonId,
            stars,
            score,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to save progress (${res.status})`);
        }

        // On success, optionally merge server response (e.g. for timestamp)
        const serverRecord: { progress: ProgressRecord } = await res.json();
        const server = serverRecord.progress;

        if (mountedRef.current) {
          setLessons((prev) => ({
            ...prev,
            [lessonId]: {
              lessonId,
              moduleId: server.moduleId as ModuleId,
              isCompleted: server.completed,
              stars: server.stars,
              score: server.score,
              attempts: (prev[lessonId]?.attempts ?? 0) + (server.completed ? 0 : 0),
              lastPlayed: server.completedAt ?? undefined,
            },
          }));
        }
      } catch (err) {
        // Roll back on error
        if (mountedRef.current) {
          setLessons(prevLessons);
          setError(
            err instanceof Error ? err.message : 'Failed to save progress',
          );
        }
      }
    },
    [profileId, lessons],
  );

  return {
    lessons,
    modules,
    summary,
    loading,
    error,
    completeLesson,
    refetch: fetchProgress,
  };
}
