'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, Heart, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsBadge } from '@/components/kids/kids-badge';
import { KidsButton } from '@/components/kids/kids-button';
import { useAudio } from '@/hooks/use-audio';
import { STORY_CATEGORIES } from '@/lib/constants';

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

interface Story {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  readTime: string;
  ageRange: [number, number];
  isPremium: boolean;
  rating: number;
  color: 'sky' | 'grass' | 'coral' | 'lavender' | 'sun' | 'mint';
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORIES: Story[] = [
  { id: 'lion-mouse', title: 'The Lion & The Mouse', description: 'A tiny mouse saves a mighty lion in this classic fable about friendship and kindness.', category: 'animals', icon: '🦁', readTime: '3 min', ageRange: [3, 7], isPremium: false, rating: 5, color: 'sun' },
  { id: 'moon-rabbit', title: 'The Moon Rabbit', description: 'Discover the legend of the rabbit who lives on the moon and makes delicious rice cakes.', category: 'bedtime', icon: '🐰', readTime: '4 min', ageRange: [3, 6], isPremium: false, rating: 5, color: 'lavender' },
  { id: 'alphabet-forest', title: 'Alphabet Forest Adventure', description: 'Walk through a magical forest where every tree represents a letter of the alphabet!', category: 'learning', icon: '🌳', readTime: '5 min', ageRange: [2, 5], isPremium: false, rating: 4, color: 'grass' },
  { id: 'brave-little-star', title: 'The Brave Little Star', description: 'A tiny star goes on a journey to find its place among the constellations.', category: 'adventure', icon: '⭐', readTime: '4 min', ageRange: [4, 8], isPremium: false, rating: 5, color: 'sky' },
  { id: 'giggly-giraffe', title: 'The Giggly Giraffe', description: 'Gerry the Giraffe cannot stop laughing, and his laugh is contagious!', category: 'funny', icon: '🦒', readTime: '3 min', ageRange: [2, 5], isPremium: false, rating: 4, color: 'coral' },
  { id: 'ocean-friends', title: 'Friends of the Ocean', description: 'A dolphin and a seahorse become best friends and explore the deep blue sea together.', category: 'animals', icon: '🐬', readTime: '5 min', ageRange: [3, 7], isPremium: false, rating: 4, color: 'sky' },
  { id: 'counting-caterpillar', title: 'The Counting Caterpillar', description: 'Follow a hungry caterpillar as it eats its way through numbers 1 to 10!', category: 'learning', icon: '🐛', readTime: '3 min', ageRange: [2, 5], isPremium: false, rating: 5, color: 'mint' },
  { id: 'dragon-dreams', title: 'Dragon Dreams', description: 'A friendly dragon learns that being different is what makes you special.', category: 'adventure', icon: '🐉', readTime: '6 min', ageRange: [5, 10], isPremium: true, rating: 5, color: 'coral' },
  { id: 'sleepy-owl', title: 'The Sleepy Owl', description: 'Oliver the Owl wants to stay awake and see the sunrise, but sleepiness keeps catching him.', category: 'bedtime', icon: '🦉', readTime: '4 min', ageRange: [2, 5], isPremium: false, rating: 5, color: 'lavender' },
];

const STORAGE_KEY = 'kv-active-profile';
const FAVORITES_KEY = 'kv-story-favorites';

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

function getFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function toggleFavorite(storyId: string): Set<string> {
  const favs = getFavorites();
  if (favs.has(storyId)) favs.delete(storyId);
  else favs.add(storyId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
  }
  return favs;
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

export default function StoriesLibrary() {
  const router = useRouter();
  const { play: playPop } = useAudio({ frequency: 600, type: 'triangle' });
  const { play: playHeart } = useAudio({ frequency: 1000, type: 'sine' });

  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* ---- Load from localStorage on mount ---- */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      setProfile(getStoredProfile());
      setFavorites(getFavorites());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---- Use stored profile or default guest ---- */
  const activeProfile = profile || DEFAULT_PROFILE;
  const isToddler = (activeProfile.age ?? 5) <= 4;

  /* ---- Filter stories ---- */
  const filteredStories = STORIES.filter((story) => {
    const matchesCategory = activeCategory === 'all' || story.category === activeCategory;
    const matchesAge = (activeProfile.age ?? 5) >= story.ageRange[0] && (activeProfile.age ?? 5) <= story.ageRange[1];
    const matchesSearch = !searchQuery || story.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesAge && matchesSearch;
  });

  /* ---- Handlers ---- */
  const handleStoryTap = useCallback(
    (storyId: string) => {
      playPop();
      router.push(`/stories/${storyId}`);
    },
    [playPop, router],
  );

  const handleFavorite = useCallback(
    (e: React.MouseEvent, storyId: string) => {
      e.stopPropagation();
      playHeart();
      setFavorites(toggleFavorite(storyId));
    },
    [playHeart],
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
            📖
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
          {/* Header */}
          <motion.section
            variants={itemVariants}
            className="relative flex flex-col items-center gap-2 text-center"
          >
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-4xl sm:text-5xl" aria-hidden="true">📖</span>
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-nunito font-extrabold text-kids-dark">
              Story Library
            </h1>
            <p className="text-sm sm:text-base text-kids-text-secondary">
              {isToddler ? `Tap a story, ${activeProfile.name}!` : `Pick a story to read, ${activeProfile.name}!`}
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
              {STORY_CATEGORIES.map((cat) => (
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

          {/* Search (for non-toddlers) */}
          {!isToddler && (
            <motion.section variants={itemVariants}>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-kids-text-muted" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-kids-lightgray bg-white font-nunito text-kids-dark placeholder:text-kids-text-muted focus:border-kids-sky focus:ring-2 focus:ring-kids-sky/20 focus:outline-none transition-colors"
                />
              </div>
            </motion.section>
          )}

          {/* Stories Grid */}
          <motion.section variants={itemVariants} aria-label="Story list">
            <div className="grid gap-3 sm:gap-5 grid-cols-2 sm:grid-cols-2">
              {filteredStories.map((story, idx) => {
                const isFav = favorites.has(story.id);
                return (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 24,
                      delay: 0.2 + idx * 0.1,
                    }}
                  >
                    <KidsCard
                      variant="interactive"
                      color={story.color}
                      padding="md"
                      className="relative flex flex-col gap-2 cursor-pointer h-full"
                      onClick={() => handleStoryTap(story.id)}
                    >
                      {/* Story icon + favorite button */}
                      <div className="flex items-start justify-between">
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 2 + idx * 0.2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <span className="text-3xl sm:text-5xl">{story.icon}</span>
                        </motion.div>
                        <button
                          type="button"
                          onClick={(e) => handleFavorite(e, story.id)}
                          className="p-1 rounded-full hover:bg-white/50 transition-colors"
                          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <motion.span
                            animate={isFav ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {isFav ? '❤️' : '🤍'}
                          </motion.span>
                        </button>
                      </div>

                      {/* Title */}
                      <h2 className="text-xs sm:text-lg font-nunito font-extrabold text-kids-dark leading-tight line-clamp-2">
                        {story.title}
                      </h2>

                      {/* Description - hidden on small mobile for cleaner look */}
                      <p className="hidden sm:block text-sm text-kids-text-secondary leading-relaxed line-clamp-2">
                        {story.description}
                      </p>

                      {/* Meta info */}
                      <div className="flex items-center gap-2 mt-auto pt-1">
                        <span className="flex items-center gap-0.5 text-[10px] sm:text-xs text-kids-text-muted font-nunito">
                          <Clock className="size-2.5 sm:size-3" aria-hidden="true" />
                          {story.readTime}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] sm:text-xs text-kids-sun font-nunito">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn('size-2.5 sm:size-3', i < story.rating ? 'fill-kids-sun text-kids-sun' : 'text-kids-lightgray')}
                              aria-hidden="true"
                            />
                          ))}
                        </span>
                        {story.isPremium && (
                          <KidsBadge variant="purple" size="sm">
                            ✨ Premium
                          </KidsBadge>
                        )}
                      </div>
                    </KidsCard>
                  </motion.div>
                );
              })}
            </div>

            {filteredStories.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-5xl mb-4 block">🔍</span>
                <p className="font-nunito font-bold text-kids-dark text-lg">No stories found</p>
                <p className="text-sm text-kids-text-secondary mt-1">Try a different category or search</p>
              </motion.div>
            )}
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
}
