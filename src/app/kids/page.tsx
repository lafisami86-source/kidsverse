'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, RefreshCw, UserPlus, Play, Star } from 'lucide-react';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsBadge } from '@/components/kids/kids-badge';
import { useAudio } from '@/hooks/use-audio';
import { AGE_RANGES } from '@/lib/constants';
import Mascot from '@/components/kids/mascot';

interface ProfileData {
  id: string;
  name: string;
  age: number;
  avatar: string;
  ageGroup: string;
  screenTimeLimit: number;
  _count?: { badges: number; gameScores: number };
}

type FetchState = 'loading' | 'success' | 'error' | 'empty';

const AGE_GROUP_GRADIENT: Record<string, string> = {
  toddler: 'bg-gradient-to-br from-teal-100 to-emerald-100',
  early: 'bg-gradient-to-br from-amber-100 to-yellow-100',
  kid: 'bg-gradient-to-br from-blue-100 to-sky-100',
};

const AGE_GROUP_BADGE_VARIANT: Record<string, 'mint' | 'gold' | 'default'> = {
  toddler: 'mint',
  early: 'gold',
  kid: 'default',
};

const AGE_GROUP_LABEL: Record<string, string> = {
  toddler: 'Toddler',
  early: 'Early Learner',
  kid: 'Kid',
};

const AGE_GROUP_ICON: Record<string, React.ReactNode> = {
  toddler: '🧒',
  early: '🌟',
  kid: '🚀',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export default function KidsSelector() {
  const router = useRouter();
  const { play: playPop } = useAudio({ frequency: 600, type: 'triangle', duration: 120 });
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchProfiles = useCallback(async () => {
    setFetchState('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/child-profiles');

      if (!response.ok) {
        throw new Error(`Failed to load profiles (${response.status})`);
      }

      const data = await response.json();
      const profileList: ProfileData[] = data.profiles ?? [];

      if (profileList.length === 0) {
        setFetchState('empty');
      } else {
        setProfiles(profileList);
        setFetchState('success');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMessage(message);
      setFetchState('error');
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleProfileSelect = (profileId: string) => {
    playPop();
    router.push(`/kids/${profileId}`);
  };

  const renderLoading = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="mb-6"
      >
        <Loader2 className="h-12 w-12 text-kids-sky" />
      </motion.div>
      <p className="text-xl font-nunito font-bold text-kids-dark">
        Finding your profiles...
      </p>
      <motion.div
        className="flex gap-2 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 rounded-full bg-kids-sky"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );

  const renderError = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        initial={{ rotate: -10 }}
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-6xl mb-4"
      >
        😢
      </motion.div>
      <p className="text-xl font-nunito font-bold text-kids-dark mb-2">
        Oops! Something went wrong
      </p>
      <p className="text-kids-text-secondary font-nunito mb-6 max-w-sm">
        {errorMessage || 'We couldn\'t load the profiles right now.'}
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={fetchProfiles}
        className="flex items-center gap-2 px-6 py-3 bg-kids-sky text-white rounded-2xl font-nunito font-bold text-lg shadow-kids hover:shadow-kids-hover transition-shadow"
      >
        <RefreshCw className="h-5 w-5" />
        Try Again
      </motion.button>
    </motion.div>
  );

  const renderEmpty = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        animate={floatingVariants.animate}
        className="text-7xl mb-6"
      >
        🎨
      </motion.div>
      <p className="text-xl font-nunito font-bold text-kids-dark mb-2">
        No profiles yet!
      </p>
      <p className="text-kids-text-secondary font-nunito mb-8 max-w-sm">
        Let&apos;s create a profile for your little one so they can start learning and having fun!
      </p>
      <Link href="/parent/profiles">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-kids-sun to-kids-peach text-kids-dark rounded-2xl font-nunito font-bold text-lg shadow-kids hover:shadow-kids-hover transition-shadow"
        >
          <UserPlus className="h-5 w-5" />
          Create a Profile
        </motion.div>
      </Link>
    </motion.div>
  );

  const renderProfiles = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key="profiles-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-3xl mx-auto"
      >
        {profiles.map((profile, index) => {
          const gradientClass = AGE_GROUP_GRADIENT[profile.ageGroup] || AGE_GROUP_GRADIENT.kid;
          const badgeVariant = AGE_GROUP_BADGE_VARIANT[profile.ageGroup] || 'default';
          const ageLabel = AGE_GROUP_LABEL[profile.ageGroup] || 'Kid';
          const ageIcon = AGE_GROUP_ICON[profile.ageGroup] || '🚀';
          const badgeCount = profile._count?.badges ?? 0;
          const gameCount = profile._count?.gameScores ?? 0;

          return (
            <motion.div
              key={profile.id}
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleProfileSelect(profile.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProfileSelect(profile.id);
                }
              }}
              aria-label={`Play as ${profile.name}`}
              className={`${gradientClass} rounded-3xl p-6 cursor-pointer shadow-kids hover:shadow-kids-lg transition-shadow flex flex-col items-center text-center relative overflow-hidden group`}
            >
              {/* Decorative background circles */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/20 group-hover:scale-125 transition-transform duration-500" aria-hidden="true" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/15 group-hover:scale-125 transition-transform duration-500" aria-hidden="true" />

              {/* Giant avatar emoji */}
              <motion.div
                className="text-7xl sm:text-8xl mb-3 drop-shadow-md"
                animate={{
                  y: [0, -4, 0],
                  rotate: [0, 3, -3, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.2,
                }}
              >
                {profile.avatar}
              </motion.div>

              {/* Child's name */}
              <h2 className="text-2xl sm:text-3xl font-nunito font-extrabold text-kids-dark mb-2 tracking-tight">
                {profile.name}
              </h2>

              {/* Age group badge */}
              <KidsBadge variant={badgeVariant} size="md" className="mb-3">
                <span className="mr-1" aria-hidden="true">{ageIcon}</span>
                {ageLabel}
              </KidsBadge>

              {/* Stats row */}
              {(badgeCount > 0 || gameCount > 0) && (
                <div className="flex items-center gap-3 text-sm font-nunito text-kids-text-secondary mt-1">
                  {badgeCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-kids-sun" aria-hidden="true" />
                      {badgeCount} badge{badgeCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {gameCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Play className="h-3.5 w-3.5 text-kids-grass" aria-hidden="true" />
                      {gameCount} game{gameCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}

              {/* Play button overlay on hover */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-hidden="true"
              >
                <div className="w-16 h-16 rounded-full bg-kids-sky/90 flex items-center justify-center shadow-kids-lg">
                  <Play className="h-7 w-7 text-white ml-1" />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50/30 to-amber-50/40 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-kids-sky/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-kids-lavender/10 rounded-full blur-3xl translate-x-1/2" aria-hidden="true" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-kids-sun/10 rounded-full blur-3xl translate-y-1/2" aria-hidden="true" />
      <div className="absolute bottom-1/4 left-0 w-56 h-56 bg-kids-mint/10 rounded-full blur-3xl -translate-x-1/3" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-6 sm:py-10 min-h-screen">
        {/* Back to parent link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="self-start mb-6"
        >
          <Link
            href="/parent"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-nunito font-semibold text-kids-text-secondary hover:text-kids-dark bg-white/60 hover:bg-white/90 backdrop-blur-sm rounded-xl shadow-sm transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Parent Area
          </Link>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-2"
        >
          <h1 className="text-4xl sm:text-5xl font-nunito font-black text-gradient-rainbow tracking-tight">
            KidsVerse
          </h1>
        </motion.div>

        {/* Mascot and greeting */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 15 }}
          className="flex flex-col items-center mb-8 sm:mb-10"
        >
          <div className="mb-3">
            <Mascot />
          </div>
          <p className="text-xl sm:text-2xl font-nunito font-bold text-kids-dark text-center">
            Who wants to play today?
          </p>
          <p className="text-sm font-nunito text-kids-text-secondary mt-1 text-center">
            Tap your name to start the fun!
          </p>
        </motion.div>

        {/* Content area */}
        <div className="w-full max-w-4xl mx-auto flex-1">
          <AnimatePresence mode="wait">
            {fetchState === 'loading' && renderLoading()}
            {fetchState === 'error' && renderError()}
            {fetchState === 'empty' && renderEmpty()}
            {fetchState === 'success' && renderProfiles()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-auto pt-8 pb-4 text-center"
        >
          <p className="text-xs font-nunito text-kids-text-muted">
            Safe, ad-free learning for kids ages 2–10
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
