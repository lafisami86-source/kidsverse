'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsBadge } from '@/components/kids/kids-badge';
import { useAudio } from '@/hooks/use-audio';
import { usePremium, PremiumModal } from '@/hooks/use-premium';

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'kv-active-profile';

interface StoredProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  ageGroup: string;
  screenTimeLimit: number;
}

const DEFAULT_PROFILE: StoredProfile = {
  id: 'guest', name: 'Friend', age: 5,
  avatar: '🌟', ageGroup: 'early', screenTimeLimit: 60,
};

const ACTIVITIES = [
  { id: 'draw', title: 'Free Draw', icon: '🖌️', description: 'Draw anything you imagine!', color: 'coral' as const, isPremium: false },
  { id: 'color', title: 'Coloring', icon: '🖍️', description: 'Color beautiful pictures!', color: 'sun' as const, isPremium: false },
  { id: 'stamp', title: 'Stamp Art', icon: '🌺', description: 'Create art with fun stamps!', color: 'grass' as const, isPremium: true },
  { id: 'pixel', title: 'Pixel Art', icon: '🟦', description: 'Make pixel art masterpieces!', color: 'sky' as const, isPremium: true },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function CreativeStudio() {
  const router = useRouter();
  const { play: playPop } = useAudio({ frequency: 600, type: 'triangle' });
  const { isPremium, showModal, closeModal, guardPremium } = usePremium();
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setProfile(JSON.parse(raw) as StoredProfile);
      } catch { /* ignore */ }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const activeProfile = profile || DEFAULT_PROFILE;

  /* ---- Go back to kid profile ---- */
  const handleGoBack = useCallback(() => {
    if (profile?.id) {
      router.push(`/kids/${profile.id}`);
    } else {
      router.push('/');
    }
  }, [profile, router]);

  const handleActivityTap = useCallback(
    (activityId: string, activityIsPremium: boolean, activityTitle: string) => {
      playPop();
      if (!guardPremium(activityIsPremium, `"${activityTitle}" is a Premium activity!`, [
        'Unlock all creative tools',
        'Save and share your art',
        'New templates every week',
      ])) return;
      router.push(`/create/${activityId}`);
    },
    [playPop, router, guardPremium],
  );

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kids-offwhite">
        <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <motion.span className="text-6xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>🎨</motion.span>
          <p className="font-nunito text-lg font-bold text-kids-dark">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kids-offwhite">
      {/* Top bar */}
      <header className="sticky top-0 z-40 w-full">
        <div className="mx-auto max-w-2xl">
          <div className="flex h-14 items-center justify-between rounded-b-2xl bg-white px-4 shadow-kids sm:px-6">
            <button type="button" onClick={handleGoBack} className="flex items-center gap-2 rounded-2xl px-2 py-1 transition-colors hover:bg-kids-lightgray" aria-label="Back">
              <ArrowLeft className="size-5 text-kids-text-secondary" />
            </button>
            <h1 className="font-nunito text-lg font-extrabold text-gradient-rainbow select-none">KidsVerse</h1>
            <motion.span className="text-2xl" animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>{activeProfile.avatar}</motion.span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        <motion.div className="flex flex-col gap-6 sm:gap-8" variants={containerVariants} initial="hidden" animate="visible">
          <motion.section variants={itemVariants} className="text-center">
            <motion.span className="text-5xl inline-block" animate={{ y: [0, -6, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>🎨</motion.span>
            <h1 className="text-2xl sm:text-3xl font-nunito font-extrabold text-kids-dark mt-2">Creative Studio</h1>
            <p className="text-sm sm:text-base text-kids-text-secondary mt-1">What will you create today, {activeProfile.name}?</p>
          </motion.section>

          <motion.section variants={itemVariants} className="grid grid-cols-2 gap-4">
            {ACTIVITIES.map((activity, idx) => (
              <motion.div key={activity.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.2 + idx * 0.12 }}>
                <KidsCard
                  variant="interactive"
                  color={activity.color}
                  padding="lg"
                  onClick={() => handleActivityTap(activity.id, activity.isPremium, activity.title)}
                  className="relative flex flex-col items-center text-center gap-3 cursor-pointer h-full"
                >
                  <motion.span className="text-5xl sm:text-6xl" animate={{ y: [0, -4, 0] }} transition={{ duration: 2 + idx * 0.3, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.2 }}>{activity.icon}</motion.span>
                  <h2 className="text-base sm:text-lg font-nunito font-extrabold text-kids-dark">{activity.title}</h2>
                  <p className="text-xs sm:text-sm text-kids-text-secondary">{activity.description}</p>

                  {/* Premium badge */}
                  {activity.isPremium && (
                    <KidsBadge variant="purple" size="sm">
                      ✨ Premium
                    </KidsBadge>
                  )}

                  {/* Premium lock overlay for non-subscribers */}
                  {activity.isPremium && !isPremium && (
                    <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center pointer-events-none">
                      <span className="text-3xl" aria-hidden="true">🔒</span>
                    </div>
                  )}
                </KidsCard>
              </motion.div>
            ))}
          </motion.section>
        </motion.div>
      </main>

      {/* Premium modal */}
      <PremiumModal isOpen={showModal} onClose={closeModal} />
    </div>
  );
}
