'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, BookCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsBadge } from '@/components/kids/kids-badge';
import { KidsProgressBar } from '@/components/kids/kids-progress-bar';
import { KidsButton } from '@/components/kids/kids-button';
import { useAudio } from '@/hooks/use-audio';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StoredProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  ageGroup: string;
  screenTimeLimit: number;
}

interface ModuleProgress {
  completed: number;
  stars: number;
}

interface LearningModule {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: 'sky' | 'grass' | 'coral' | 'lavender';
  gradient: string;
  lessons: number;
  isPremium: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LEARNING_MODULES: LearningModule[] = [
  { id: 'alphabet', title: 'Alphabet', icon: '🔤', description: 'Learn letters A-Z', color: 'sky', gradient: 'from-sky-100 to-blue-200', lessons: 26, isPremium: false },
  { id: 'numbers', title: 'Numbers', icon: '🔢', description: 'Count from 1 to 20', color: 'grass', gradient: 'from-green-100 to-emerald-200', lessons: 10, isPremium: false },
  { id: 'colors', title: 'Colors', icon: '🎨', description: 'Discover and mix colors', color: 'coral', gradient: 'from-rose-100 to-pink-200', lessons: 8, isPremium: false },
  { id: 'science', title: 'Science', icon: '🔬', description: 'Explore the world', color: 'lavender', gradient: 'from-violet-100 to-purple-200', lessons: 8, isPremium: false },
];

const STORAGE_KEY = 'kv-active-profile';
const PROGRESS_KEY = 'kv-learn-progress';

const DEFAULT_PROFILE: StoredProfile = {
  id: 'guest',
  name: 'Friend',
  age: 5,
  avatar: '🌟',
  ageGroup: 'early',
  screenTimeLimit: 60,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStoredProfile(): StoredProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

function getStoredProgress(): Record<string, ModuleProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ModuleProgress>;
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const sparkleFloat = {
  y: [0, -6, 0],
  rotate: [0, 10, -10, 0],
  transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
};

/* ------------------------------------------------------------------ */
/*  Confetti particle (decorative)                                      */
/* ------------------------------------------------------------------ */

function SparkleField() {
  const sparkles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: `${15 + i * 14}%`,
    delay: i * 0.4,
    size: i % 2 === 0 ? 'text-lg' : 'text-sm',
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          className={cn('absolute', s.size)}
          style={{ left: s.left, top: '10%' }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        >
          ✨
        </motion.span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function LearnOverview() {
  const router = useRouter();
  const { play: playPop } = useAudio({ frequency: 600, type: 'triangle' });

  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({});

  /* ---- Load from localStorage on mount ---- */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      setProfile(getStoredProfile());
      setProgress(getStoredProgress());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---- Use stored profile or default guest ---- */
  const activeProfile = profile || DEFAULT_PROFILE;
  const isToddler = (activeProfile.age ?? 5) <= 4;
  const isKid = (activeProfile.age ?? 5) >= 8;

  /* ---- Derived sizing ---- */
  const titleSize = isToddler ? 'text-3xl sm:text-4xl' : isKid ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl';
  const subtitleSize = isToddler ? 'text-base sm:text-lg' : 'text-sm sm:text-base';
  const cardIconSize = isToddler ? 'text-5xl sm:text-6xl' : isKid ? 'text-4xl sm:text-5xl' : 'text-4xl sm:text-5xl';
  const cardTitleSize = isToddler ? 'text-lg sm:text-xl' : isKid ? 'text-sm sm:text-base' : 'text-base sm:text-lg';
  const cardDescSize = isToddler ? 'text-sm sm:text-base' : 'text-xs sm:text-sm';
  const showDescriptions = isToddler ? false : true;
  const gridSize = isToddler ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2';

  /* ---- Computed stats ---- */
  const totalStars = Object.values(progress).reduce((sum, p) => sum + (p.stars ?? 0), 0);
  const totalLessons = Object.values(progress).reduce((sum, p) => sum + (p.completed ?? 0), 0);
  const totalPossibleLessons = LEARNING_MODULES.reduce((sum, m) => sum + m.lessons, 0);

  /* ---- Navigation handler ---- */
  const handleModuleTap = useCallback(
    (moduleId: string) => {
      playPop();
      router.push(`/learn/${moduleId}`);
    },
    [playPop, router],
  );

  /* ---- Not mounted yet ---- */
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kids-offwhite">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.span
            className="text-6xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            📚
          </motion.span>
          <p className="font-nunito text-lg font-bold text-kids-dark">Loading...</p>
        </motion.div>
      </div>
    );
  }

  /* ---- Main content ---- */
  return (
    <div className="min-h-screen bg-kids-offwhite">
      {/* Top bar */}
      <header className="sticky top-0 z-40 w-full">
        <div className="mx-auto max-w-2xl">
          <div className="flex h-14 items-center justify-between rounded-b-2xl bg-white px-4 shadow-kids sm:px-6">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center gap-2 rounded-2xl px-2 py-1 transition-colors hover:bg-kids-lightgray focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky"
              aria-label="Back to home"
            >
              <ArrowLeft className="size-5 text-kids-text-secondary" aria-hidden="true" />
              <span className="hidden text-sm font-nunito font-bold text-kids-text-secondary sm:inline">
                Back
              </span>
            </button>
            <h1 className="font-nunito text-lg font-extrabold text-gradient-rainbow select-none">
              KidsVerse
            </h1>
            <div className="flex items-center gap-2">
              <motion.span
                className="text-2xl"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              >
                {activeProfile.avatar}
              </motion.span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="mx-auto max-w-2xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        <motion.div
          className="flex flex-col gap-6 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ================================================================ */}
          {/*  HEADER — "Let's Learn!"                                        */}
          {/* ================================================================ */}
          <motion.section
            variants={itemVariants}
            className="relative flex flex-col items-center gap-2 text-center"
            aria-label="Learning overview header"
          >
            <SparkleField />
            <motion.div
              className="relative"
              animate={sparkleFloat}
            >
              <span className="text-4xl sm:text-5xl" aria-hidden="true">🌟</span>
            </motion.div>
            <h1 className={cn('font-nunito font-extrabold text-kids-dark', titleSize)}>
              Let&apos;s Learn!
            </h1>
            <p className={cn('text-kids-text-secondary', subtitleSize)}>
              {isToddler ? `Tap a lesson, ${activeProfile.name}!` : `Choose a subject, ${activeProfile.name}!`}
            </p>

            {/* Show guest notice if no profile selected */}
            {!profile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <KidsButton
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/kids')}
                  leftIcon={<span aria-hidden="true">{'🧒'}</span>}
                >
                  Select Profile
                </KidsButton>
              </motion.div>
            )}
          </motion.section>

          {/* ================================================================ */}
          {/*  OVERALL PROGRESS BADGES                                         */}
          {/* ================================================================ */}
          <motion.section
            variants={itemVariants}
            aria-label="Overall learning progress"
          >
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {/* Total Stars Badge */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-kids-sun/20 to-kids-peach/20 border border-kids-sun/30 px-4 py-2.5 sm:px-5 sm:py-3"
              >
                <Star className="size-5 text-kids-sun" aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="font-nunito text-xl font-extrabold text-kids-dark sm:text-2xl">
                    {totalStars}
                  </span>
                  <span className="text-[10px] font-nunito font-semibold text-kids-text-secondary leading-none">
                    Stars
                  </span>
                </div>
              </motion.div>

              {/* Lessons Completed Badge */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-kids-grass/20 to-kids-mint/20 border border-kids-grass/30 px-4 py-2.5 sm:px-5 sm:py-3"
              >
                <BookCheck className="size-5 text-kids-grass" aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="font-nunito text-xl font-extrabold text-kids-dark sm:text-2xl">
                    {totalLessons}
                  </span>
                  <span className="text-[10px] font-nunito font-semibold text-kids-text-secondary leading-none">
                    Lessons
                  </span>
                </div>
              </motion.div>

              {/* Completion Badge */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-kids-sky/20 to-kids-blue/10 border border-kids-sky/30 px-4 py-2.5 sm:px-5 sm:py-3"
              >
                <Sparkles className="size-5 text-kids-sky" aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="font-nunito text-xl font-extrabold text-kids-dark sm:text-2xl">
                    {totalPossibleLessons > 0 ? Math.round((totalLessons / totalPossibleLessons) * 100) : 0}%
                  </span>
                  <span className="text-[10px] font-nunito font-semibold text-kids-text-secondary leading-none">
                    Done
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* ================================================================ */}
          {/*  MODULE CARDS — 2x2 grid                                        */}
          {/* ================================================================ */}
          <motion.section
            variants={itemVariants}
            aria-label="Learning modules"
          >
            <div className={cn('grid gap-4 sm:gap-5', gridSize)}>
              {LEARNING_MODULES.map((module, idx) => {
                const modProgress = progress[module.id] ?? { completed: 0, stars: 0 };
                const pct = module.lessons > 0 ? Math.round((modProgress.completed / module.lessons) * 100) : 0;

                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 24,
                      delay: 0.3 + idx * 0.12,
                    }}
                  >
                    <KidsCard
                      variant="interactive"
                      color={module.color}
                      padding="lg"
                      className="relative flex flex-col items-center text-center gap-3 cursor-pointer h-full"
                      onClick={() => handleModuleTap(module.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleModuleTap(module.id);
                        }
                      }}
                    >
                      {/* Animated module icon */}
                      <motion.div
                        animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
                        transition={{
                          duration: 2 + idx * 0.3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: idx * 0.2,
                        }}
                        aria-hidden="true"
                      >
                        <span className={cardIconSize}>{module.icon}</span>
                      </motion.div>

                      {/* Title */}
                      <h2 className={cn('font-nunito font-extrabold text-kids-dark', cardTitleSize)}>
                        {module.title}
                      </h2>

                      {/* Description */}
                      {showDescriptions && (
                        <p className={cn('text-kids-text-secondary leading-relaxed', cardDescSize)}>
                          {module.description}
                        </p>
                      )}

                      {/* Progress bar */}
                      <div className="w-full mt-auto">
                        <KidsProgressBar
                          value={modProgress.completed}
                          min={0}
                          max={module.lessons}
                          size={isToddler ? 'lg' : 'md'}
                          color={module.color}
                          showLabel
                          label={`${modProgress.completed} / ${module.lessons}`}
                          className="w-full"
                        />
                      </div>

                      {/* Star count badge */}
                      {modProgress.stars > 0 && (
                        <KidsBadge
                          variant="gold"
                          size={isToddler ? 'lg' : 'sm'}
                          icon={<span aria-hidden="true">{'⭐'}</span>}
                        >
                          {modProgress.stars}
                        </KidsBadge>
                      )}

                      {/* Premium lock badge */}
                      {module.isPremium && (
                        <KidsBadge variant="purple" size="sm">
                          ✨ Premium
                        </KidsBadge>
                      )}
                    </KidsCard>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
}
