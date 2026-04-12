'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Clock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsBadge } from '@/components/kids/kids-badge';
import { KidsButton } from '@/components/kids/kids-button';
import { useAudio } from '@/hooks/use-audio';
import { VIDEO_CATEGORIES } from '@/lib/constants';

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

interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  duration: string;
  ageRange: [number, number];
  isPremium: boolean;
  views: string;
  color: 'sky' | 'grass' | 'coral' | 'lavender' | 'sun' | 'mint';
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const VIDEOS: Video[] = [
  { id: 'abc-song', title: 'The ABC Song', description: 'Sing along and learn the alphabet with this catchy song!', category: 'songs', thumbnail: '🎤', duration: '2:30', ageRange: [2, 5], isPremium: false, views: '2.1M', color: 'sun' },
  { id: 'counting-fun', title: 'Counting to 20', description: 'Count from 1 to 20 with colorful animals and fun music.', category: 'songs', thumbnail: '🔢', duration: '3:15', ageRange: [2, 5], isPremium: false, views: '1.8M', color: 'grass' },
  { id: 'colors-rainbow', title: 'Colors of the Rainbow', description: 'Learn all the colors of the rainbow with painting fun!', category: 'art', thumbnail: '🎨', duration: '4:00', ageRange: [2, 6], isPremium: false, views: '3.5M', color: 'coral' },
  { id: 'solar-system', title: 'The Solar System', description: 'Explore our solar system and learn about all the planets!', category: 'science', thumbnail: '🪐', duration: '5:30', ageRange: [5, 10], isPremium: false, views: '4.2M', color: 'sky' },
  { id: 'drawing-animals', title: 'How to Draw Animals', description: 'Step-by-step instructions to draw cute animals easily.', category: 'art', thumbnail: '🐾', duration: '6:00', ageRange: [4, 10], isPremium: false, views: '2.7M', color: 'mint' },
  { id: 'three-little-pigs', title: 'Three Little Pigs', description: 'Watch the classic story of the Three Little Pigs come alive!', category: 'stories', thumbnail: '🐷', duration: '4:45', ageRange: [2, 7], isPremium: false, views: '5.1M', color: 'coral' },
  { id: 'shapes-song', title: 'The Shapes Song', description: 'Learn circles, squares, triangles and more with music!', category: 'songs', thumbnail: '🔷', duration: '2:50', ageRange: [2, 5], isPremium: false, views: '1.5M', color: 'sun' },
  { id: 'volcano-science', title: 'How Volcanoes Work', description: 'Discover what makes volcanoes erupt in this exciting science video!', category: 'science', thumbnail: '🌋', duration: '5:00', ageRange: [5, 10], isPremium: true, views: '3.8M', color: 'coral' },
  { id: 'ocean-animals', title: 'Ocean Animals for Kids', description: 'Dive deep into the ocean and meet amazing sea creatures!', category: 'science', thumbnail: '🐙', duration: '4:20', ageRange: [3, 8], isPremium: false, views: '6.3M', color: 'sky' },
  { id: 'dance-party', title: 'Kids Dance Party', description: 'Get up and dance with these fun moves for kids of all ages!', category: 'songs', thumbnail: '💃', duration: '3:45', ageRange: [2, 8], isPremium: false, views: '8.1M', color: 'lavender' },
  { id: 'paper-crafts', title: 'Easy Paper Crafts', description: 'Make amazing things with just paper, scissors and glue!', category: 'art', thumbnail: '✂️', duration: '7:00', ageRange: [4, 10], isPremium: false, views: '1.9M', color: 'grass' },
  { id: 'butterfly-life', title: 'Life Cycle of a Butterfly', description: 'Watch a caterpillar transform into a beautiful butterfly!', category: 'science', thumbnail: '🦋', duration: '3:30', ageRange: [3, 7], isPremium: false, views: '4.5M', color: 'mint' },
];

const STORAGE_KEY = 'kv-active-profile';

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

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function VideoBrowser() {
  const router = useRouter();
  const { play: playPop } = useAudio({ frequency: 600, type: 'triangle' });

  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  /* ---- Load from localStorage on mount ---- */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      setProfile(getStoredProfile());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---- Use stored profile or default guest ---- */
  const activeProfile = profile || DEFAULT_PROFILE;
  const isToddler = (activeProfile.age ?? 5) <= 4;

  /* ---- Filter videos ---- */
  const filteredVideos = VIDEOS.filter((video) => {
    const matchesCategory = activeCategory === 'all' || video.category === activeCategory;
    const matchesAge = (activeProfile.age ?? 5) >= video.ageRange[0] && (activeProfile.age ?? 5) <= video.ageRange[1];
    return matchesCategory && matchesAge;
  });

  /* ---- Go back to kid profile ---- */
  const handleGoBack = useCallback(() => {
    if (profile?.id) {
      router.push(`/kids/${profile.id}`);
    } else {
      router.push('/');
    }
  }, [profile, router]);

  /* ---- Handlers ---- */
  const handleVideoTap = useCallback(
    (videoId: string) => {
      playPop();
      router.push(`/watch/${videoId}`);
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
            🎬
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
              onClick={handleGoBack}
              className="flex items-center gap-2 rounded-2xl px-2 py-1 transition-colors hover:bg-kids-lightgray focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky"
              aria-label="Back to profile"
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
          {/* Header */}
          <motion.section
            variants={itemVariants}
            className="relative flex flex-col items-center gap-2 text-center"
          >
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-4xl sm:text-5xl" aria-hidden="true">🎬</span>
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-nunito font-extrabold text-kids-dark">
              Videos
            </h1>
            <p className="text-sm sm:text-base text-kids-text-secondary">
              {isToddler ? `Tap a video, ${activeProfile.name}!` : `Choose a video to watch, ${activeProfile.name}!`}
            </p>
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

          {/* Category Filters */}
          <motion.section variants={itemVariants}>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-2xl font-nunito font-bold text-sm transition-all',
                  activeCategory === 'all'
                    ? 'bg-kids-sky text-white shadow-kids'
                    : 'bg-white text-kids-text-secondary border border-kids-lightgray hover:border-kids-sky'
                )}
              >
                ✨ All
              </button>
              {VIDEO_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-2xl font-nunito font-bold text-sm transition-all flex items-center gap-1.5',
                    activeCategory === cat.id
                      ? 'bg-kids-sky text-white shadow-kids'
                      : 'bg-white text-kids-text-secondary border border-kids-lightgray hover:border-kids-sky'
                  )}
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.section>

          {/* Videos Grid */}
          <motion.section variants={itemVariants} aria-label="Video list">
            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2">
              {filteredVideos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 24,
                    delay: 0.2 + idx * 0.08,
                  }}
                >
                  <KidsCard
                    variant="interactive"
                    color={video.color}
                    padding="none"
                    className="relative flex flex-col cursor-pointer h-full overflow-hidden"
                    onClick={() => handleVideoTap(video.id)}
                  >
                    {/* Thumbnail area */}
                    <div className="relative aspect-video bg-gradient-to-br from-kids-lightgray to-kids-offwhite flex items-center justify-center">
                      <motion.span
                        className="text-5xl sm:text-6xl"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: idx * 0.3,
                          ease: 'easeInOut',
                        }}
                      >
                        {video.thumbnail}
                      </motion.span>

                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-14 h-14 rounded-full bg-white/90 shadow-kids flex items-center justify-center"
                        >
                          <Play className="size-6 text-kids-sky ml-1" fill="currentColor" aria-hidden="true" />
                        </motion.div>
                      </div>

                      {/* Duration badge */}
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 text-white text-xs font-nunito font-bold">
                        {video.duration}
                      </div>
                    </div>

                    {/* Info area */}
                    <div className="p-3 sm:p-4 flex flex-col gap-1.5">
                      <h2 className="text-sm sm:text-base font-nunito font-extrabold text-kids-dark leading-tight line-clamp-2">
                        {video.title}
                      </h2>

                      <p className="text-xs text-kids-text-secondary leading-relaxed line-clamp-2">
                        {video.description}
                      </p>

                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-kids-text-muted font-nunito">
                          <Eye className="size-3" aria-hidden="true" />
                          {video.views}
                        </span>
                        {video.isPremium && (
                          <KidsBadge variant="purple" size="sm">
                            ✨ Premium
                          </KidsBadge>
                        )}
                      </div>
                    </div>
                  </KidsCard>
                </motion.div>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-5xl mb-4 block">🎬</span>
                <p className="font-nunito font-bold text-kids-dark text-lg">No videos found</p>
                <p className="text-sm text-kids-text-secondary mt-1">Try a different category</p>
              </motion.div>
            )}
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
}
