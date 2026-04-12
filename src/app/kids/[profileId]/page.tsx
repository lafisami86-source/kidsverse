'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Star, Flame, BookCheck, Sparkles, Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChildProfile } from './layout';
import { useAgeGroup } from '@/hooks/use-age-group';
import { useScreenTime } from '@/hooks/use-screen-time';
import { useAudio } from '@/hooks/use-audio';
import { useStreak, STREAK_MILESTONES } from '@/hooks/use-streak';
import { toast } from '@/hooks/use-toast';
import { SectionCard } from '@/components/kids/section-card';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsBadge } from '@/components/kids/kids-badge';
import Mascot from '@/components/kids/mascot';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

import type { AgeGroupConfig } from '@/hooks/use-age-group';
import type { ScreenTimeState } from '@/hooks/use-screen-time';

/* ------------------------------------------------------------------ */
/*  Defaults for stub hooks                                            */
/* ------------------------------------------------------------------ */

/** Maps Tailwind size classes from useAgeGroup to Mascot component size tokens */
const MASCOT_SIZE_MAP: Record<string, 'sm' | 'md' | 'lg'> = {
  'size-32': 'lg',
  'size-24': 'md',
  'size-20': 'sm',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ------------------------------------------------------------------ */
/*  Section definitions                                                */
/* ------------------------------------------------------------------ */

interface SectionDef {
  section: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  colorClass: string;
  href: string;
}

function getSections(basePath: string): SectionDef[] {
  return [
    {
      section: 'learn',
      icon: <span aria-hidden="true">{'\uD83D\uDCDA'}</span>,
      label: 'Learn',
      description: 'Letters, Numbers, Colors & Science',
      colorClass: 'bg-gradient-to-br from-sky-100 to-blue-200',
      href: `${basePath}/learn`,
    },
    {
      section: 'play',
      icon: <span aria-hidden="true">{'\uD83C\uDFAE'}</span>,
      label: 'Play',
      description: 'Memory, Puzzles, Spelling & Math',
      colorClass: 'bg-gradient-to-br from-green-100 to-emerald-200',
      href: `${basePath}/play`,
    },
    {
      section: 'stories',
      icon: <span aria-hidden="true">{'\uD83D\uDCD6'}</span>,
      label: 'Stories',
      description: 'Animated Storybooks',
      colorClass: 'bg-gradient-to-br from-violet-100 to-purple-200',
      href: `${basePath}/stories`,
    },
    {
      section: 'create',
      icon: <span aria-hidden="true">{'\uD83C\uDFA8'}</span>,
      label: 'Create',
      description: 'Draw, Color & Express',
      colorClass: 'bg-gradient-to-br from-rose-100 to-pink-200',
      href: `${basePath}/create`,
    },
    {
      section: 'watch',
      icon: <span aria-hidden="true">{'\uD83D\uDCFA'}</span>,
      label: 'Watch',
      description: 'Fun & Educational Videos',
      colorClass: 'bg-gradient-to-br from-amber-100 to-yellow-200',
      href: `${basePath}/watch`,
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Daily challenges by age group                                      */
/* ------------------------------------------------------------------ */

const CHALLENGES: Record<string, string> = {
  toddler: 'Can you find 3 red things around you?',
  early: 'Draw a picture of your favorite animal!',
  kid: 'Write a short story about a space adventure!',
};

/* ------------------------------------------------------------------ */
/*  Mock progress data                                                 */
/* ------------------------------------------------------------------ */

interface ProgressItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  colorClass: string;
}

function buildProgressItems(
  todayStars: number,
  currentStreak: number,
): ProgressItem[] {
  return [
    {
      id: 'stars',
      icon: <Star className="size-5 text-kids-sun" aria-hidden="true" />,
      label: 'Stars Today',
      value: todayStars,
      unit: '',
      colorClass: 'bg-kids-sun/10 border-kids-sun/30',
    },
    {
      id: 'lessons',
      icon: <BookCheck className="size-5 text-kids-grass" aria-hidden="true" />,
      label: 'Lessons',
      value: 3,
      unit: '',
      colorClass: 'bg-kids-grass/10 border-kids-grass/30',
    },
    {
      id: 'streak',
      icon: <Flame className="size-5 text-kids-coral" aria-hidden="true" />,
      label: 'Day Streak',
      value: currentStreak,
      unit: ' days',
      colorClass: 'bg-kids-coral/10 border-kids-coral/30',
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
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

const cardFloat = {
  y: [0, -5, 0],
  transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
};

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function KidsHome() {
  const { profile } = useChildProfile();

  /* ---- hooks ---- */
  const ageConfig = useAgeGroup(profile?.age ?? 5);
  const screenTime = useScreenTime({
    profileId: profile?.id ?? 'unknown',
    limitMinutes: profile?.screenTimeLimit ?? 60,
  });
  const { play } = useAudio({ frequency: 600, type: 'triangle' });
  const { play: playReward } = useAudio({ frequency: 880, type: 'sine', duration: 500 });
  const { streakData, logActivity, addStars, checkAndAwardRewards } = useStreak();

  const router = useRouter();

  /* ---- reward notification state ---- */
  const [pendingRewards, setPendingRewards] = React.useState<ReturnType<typeof checkAndAwardRewards>>([]);

  /* ---- derived values ---- */
  const name = profile?.name ?? 'Friend';
  const avatar = profile?.avatar ?? '\uD83D\uDC3E';
  const ageGroup = ageConfig.ageGroup;
  const mascotSize = MASCOT_SIZE_MAP[ageConfig.mascotSize] ?? 'md';
  const greeting = getTimeGreeting();
  const challenge = CHALLENGES[ageGroup] ?? CHALLENGES.early;
  const basePath = profile ? `/kids/${profile.id}` : '/kids/default';
  const sections = getSections(basePath);
  const progressItems = buildProgressItems(streakData.todayActivities.length, streakData.currentStreak);

  /* ---- earned milestones for display ---- */
  const earnedMilestones = STREAK_MILESTONES.filter((m) => streakData.rewards.includes(m.id));

  /* ---- next milestone hint ---- */
  const nextMilestone = STREAK_MILESTONES.find((m) => !streakData.rewards.includes(m.id));

  /* ---- age-adaptive sizes ---- */
  const isToddler = ageGroup === 'toddler';
  const isKid = ageGroup === 'kid';

  const greetingSize = isToddler ? 'text-2xl sm:text-3xl lg:text-4xl' : isKid ? 'text-lg sm:text-xl lg:text-2xl' : 'text-xl sm:text-2xl lg:text-3xl';
  const subtextSize = isToddler ? 'text-base sm:text-lg' : isKid ? 'text-sm sm:text-base' : 'text-sm sm:text-base';
  const sectionIconSize = isToddler ? 'text-4xl sm:text-5xl' : isKid ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl lg:text-5xl';
  const mascotContainerSize = mascotSize === 'lg' ? 'w-28 h-28 sm:w-36 sm:h-36' : mascotSize === 'sm' ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-20 h-20 sm:w-28 sm:h-28';

  const animDuration = isToddler ? 2 : isKid ? 0.5 : 1;

  /* ---- section card interact handler ---- */
  const handleSectionInteract = useCallback(
    (sectionName: string) => {
      logActivity(sectionName);
      addStars(1);
      // Check for new rewards after logging
      const newRewards = checkAndAwardRewards();
      if (newRewards.length > 0) {
        playReward();
        setPendingRewards(newRewards);
      }
    },
    [logActivity, addStars, checkAndAwardRewards, playReward],
  );

  /* ---- dismiss reward notification ---- */
  const dismissReward = useCallback(() => {
    setPendingRewards([]);
  }, []);

  return (
    <motion.div
      className="flex flex-col gap-6 sm:gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ============================================================== */}
      {/*  GREETING SECTION                                              */}
      {/* ============================================================== */}
      <motion.section
        variants={itemVariants}
        className="relative flex flex-col items-center gap-4 text-center sm:gap-5"
        aria-label="Welcome greeting"
      >
        {/* Mascot + Speech bubble */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mascot container */}
          <motion.div
            className={cn('relative flex-shrink-0', mascotContainerSize)}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: animDuration, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-kids-sun/20 to-kids-peach/30">
              <Mascot size={mascotSize} mood="happy" animated />
            </div>
          </motion.div>

          {/* Speech bubble */}
          <motion.div
            className="relative rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-kids sm:px-6 sm:py-4"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
          >
            <p className={cn('font-nunito font-bold text-kids-dark leading-snug', greetingSize)}>
              {greeting}, {name}! {avatar}
            </p>
            <p className={cn('mt-1 text-kids-text-secondary', subtextSize)}>
              What would you like to do today?
            </p>
            {/* Speech bubble tail */}
            <span
              className="absolute -left-2 top-4 h-4 w-4 -rotate-45 bg-white shadow-sm"
              aria-hidden="true"
            />
          </motion.div>
        </div>

        {/* Screen time badge */}
        <KidsBadge
          variant="muted"
          size="sm"
          icon={<span aria-hidden="true">{'\u23F0'}</span>}
        >
          {screenTime.formattedRemaining}
        </KidsBadge>
      </motion.section>

      {/* ============================================================== */}
      {/*  REWARD NOTIFICATION POPUP                                     */}
      {/* ============================================================== */}
      <AnimatePresence>
        {pendingRewards.length > 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={dismissReward}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            {/* Reward card */}
            <motion.div
              className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center"
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {/* Close button */}
              <button
                onClick={dismissReward}
                className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                aria-label="Dismiss reward notification"
              >
                <X className="size-4" />
              </button>

              {/* Reward content */}
              <motion.div
                className="mb-4"
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                <span className="text-6xl" role="img" aria-label="Reward">
                  {pendingRewards[0].emoji}
                </span>
              </motion.div>

              <h3 className="font-nunito text-2xl font-extrabold text-kids-dark">
                New Reward!
              </h3>

              <p className="mt-2 font-nunito text-lg font-bold text-kids-coral">
                {pendingRewards[0].emoji} {pendingRewards[0].label}
              </p>

              <p className="mt-1 text-sm text-kids-text-secondary">
                {pendingRewards.length > 1
                  ? `+${pendingRewards.length - 1} more reward${pendingRewards.length > 2 ? 's' : ''} unlocked!`
                  : `${pendingRewards[0].days}-day streak milestone reached!`}
              </p>

              <div className="mt-4 flex justify-center gap-2">
                {pendingRewards.map((r) => (
                  <span key={r.id} className="text-3xl" role="img" aria-label={r.label}>
                    {r.emoji}
                  </span>
                ))}
              </div>

              <button
                onClick={dismissReward}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-kids-sun to-kids-peach px-6 py-3 font-nunito font-bold text-white shadow-kids transition-transform hover:scale-105 active:scale-95"
              >
                Awesome! 🎉
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/*  DAILY PROGRESS — horizontal scroll                            */}
      {/* ============================================================== */}
      <motion.section
        variants={itemVariants}
        aria-label="Daily progress overview"
      >
        <div className="flex gap-3 overflow-x-auto pb-2 sm:gap-4 no-scrollbar">
          {progressItems.map((item, idx) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex min-w-[140px] flex-shrink-0 items-center gap-3 rounded-2xl border bg-white p-3 shadow-kids sm:min-w-[160px] sm:p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
            >
              <div
                className={cn(
                  'flex size-10 items-center justify-center rounded-xl sm:size-12',
                  item.colorClass,
                )}
              >
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-nunito text-xl font-extrabold text-kids-dark sm:text-2xl">
                  {item.value}{item.unit}
                </span>
                <span className="text-xs font-nunito font-semibold text-kids-text-secondary">
                  {item.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ============================================================== */}
      {/*  SECTION NAVIGATION CARDS                                      */}
      {/* ============================================================== */}
      <motion.section
        variants={itemVariants}
        aria-label="Explore sections"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {sections.map((sec, idx) => (
            <motion.div
              key={sec.section}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 24,
                delay: 0.5 + idx * 0.12,
              }}
            >
              <SectionCard
                section={sec.section}
                onInteract={handleSectionInteract}
                icon={
                  <motion.span
                    className={sectionIconSize}
                    animate={isToddler ? cardFloat : { y: 0 }}
                    transition={cardFloat.transition}
                    aria-hidden="true"
                  >
                    {sec.icon}
                  </motion.span>
                }
                label={sec.label}
                description={ageConfig.showDescriptions ? sec.description : undefined}
                colorClass={sec.colorClass}
                href={sec.href}
                tapSize={ageConfig.tapSize}
                delay={0.5 + idx * 0.12}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ============================================================== */}
      {/*  REWARDS COLLECTION                                           */}
      {/* ============================================================== */}
      {earnedMilestones.length > 0 && (
        <motion.section
          variants={itemVariants}
          aria-label="Rewards collection"
        >
          <KidsCard variant="featured" padding="md">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="size-5 text-kids-sun" aria-hidden="true" />
                <h2 className={cn('font-nunito font-extrabold text-kids-dark', isToddler ? 'text-xl' : 'text-lg')}>
                  My Rewards
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {earnedMilestones.map((m) => (
                  <motion.div
                    key={m.id}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-kids-sun/10 to-kids-peach/10 border border-kids-sun/20 px-3 py-1.5"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg" role="img" aria-label={m.label}>{m.emoji}</span>
                    <span className="text-xs font-nunito font-bold text-kids-dark">{m.label}</span>
                  </motion.div>
                ))}
              </div>
              {nextMilestone && (
                <p className="text-xs text-kids-text-secondary font-nunito">
                  Next reward: <span className="font-bold text-kids-coral">{nextMilestone.emoji} {nextMilestone.label}</span> at{' '}
                  <span className="font-bold">{nextMilestone.days}-day streak</span>
                  {nextMilestone.days - streakData.currentStreak > 0 && (
                    <> ({nextMilestone.days - streakData.currentStreak} day{nextMilestone.days - streakData.currentStreak > 1 ? 's' : ''} to go!)</>
                  )}
                </p>
              )}
            </div>
          </KidsCard>
        </motion.section>
      )}

      {/* ============================================================== */}
      {/*  DAILY CHALLENGE CARD                                          */}
      {/* ============================================================== */}
      <motion.section
        variants={itemVariants}
        aria-label="Daily challenge"
      >
        <KidsCard
          variant="featured"
          padding="lg"
          className="relative overflow-hidden"
        >
          {/* Decorative corner sparkles */}
          <span
            className="pointer-events-none absolute -right-2 -top-2 text-4xl opacity-60 sm:text-5xl"
            aria-hidden="true"
          >
            {'\u2728'}
          </span>

          <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
            {/* Challenge icon */}
            <motion.div
              className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-kids-sun to-kids-peach shadow-kids sm:size-16"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="size-7 text-white sm:size-8" aria-hidden="true" />
            </motion.div>

            {/* Challenge heading */}
            <div>
              <h2 className={cn('font-nunito font-extrabold text-kids-dark', isToddler ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl')}>
                Today&apos;s Challenge
              </h2>
              <p className={cn('mt-1.5 text-kids-text-secondary leading-relaxed', subtextSize)}>
                {challenge}
              </p>
            </div>

            {/* Challenge badge */}
            <KidsBadge variant="gold" size="sm">
              {isToddler ? 'For Toddlers' : isKid ? 'For Kids' : 'For Early Learners'}
            </KidsBadge>
          </div>
        </KidsCard>
      </motion.section>
    </motion.div>
  );
}
