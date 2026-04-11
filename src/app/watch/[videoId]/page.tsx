'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ThumbsUp, Eye, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsBadge } from '@/components/kids/kids-badge';
import { KidsButton } from '@/components/kids/kids-button';
import { useAudio } from '@/hooks/use-audio';
import { useAgeGroup } from '@/hooks/use-age-group';

/* ------------------------------------------------------------------ */
/*  Video data                                                         */
/* ------------------------------------------------------------------ */

const VIDEOS_DB: Record<string, {
  title: string;
  thumbnail: string;
  description: string;
  duration: string;
  views: string;
  category: string;
  relatedVideos: { id: string; title: string; thumbnail: string }[];
}> = {
  'abc-song': {
    title: 'The ABC Song',
    thumbnail: '🎤',
    description: 'Sing along and learn the alphabet with this catchy song! Perfect for toddlers and early learners starting their reading journey.',
    duration: '2:30',
    views: '2.1M',
    category: 'Songs & Music',
    relatedVideos: [
      { id: 'shapes-song', title: 'The Shapes Song', thumbnail: '🔷' },
      { id: 'counting-fun', title: 'Counting to 20', thumbnail: '🔢' },
      { id: 'dance-party', title: 'Kids Dance Party', thumbnail: '💃' },
    ],
  },
  'counting-fun': {
    title: 'Counting to 20',
    thumbnail: '🔢',
    description: 'Count from 1 to 20 with colorful animals and fun music! A great way to practice number recognition.',
    duration: '3:15',
    views: '1.8M',
    category: 'Songs & Music',
    relatedVideos: [
      { id: 'abc-song', title: 'The ABC Song', thumbnail: '🎤' },
      { id: 'counting-caterpillar', title: 'Counting Caterpillar', thumbnail: '🐛' },
    ],
  },
};

const DEFAULT_VIDEO = {
  title: 'Fun Learning Video',
  thumbnail: '🎬',
  description: 'An exciting educational video full of fun and learning! Watch and discover something new today.',
  duration: '3:00',
  views: '1M',
  category: 'Learning',
  relatedVideos: [
    { id: 'abc-song', title: 'The ABC Song', thumbnail: '🎤' },
    { id: 'three-little-pigs', title: 'Three Little Pigs', thumbnail: '🐷' },
    { id: 'ocean-animals', title: 'Ocean Animals', thumbnail: '🐙' },
  ],
};

const STORAGE_KEY = 'kv-active-profile';

function getStoredProfile() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function VideoPlayer() {
  const router = useRouter();
  const params = useParams();
  const { play: playPop } = useAudio({ frequency: 600, type: 'triangle' });

  const videoId = params.videoId as string || 'abc-song';
  const video = VIDEOS_DB[videoId] || DEFAULT_VIDEO;

  const [profile, setProfile] = useState<{ name: string; age: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      setProfile(getStoredProfile());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const ageConfig = useAgeGroup(profile?.age ?? 5);
  const isToddler = ageConfig.ageGroup === 'toddler';

  const handleBack = () => {
    playPop();
    router.replace('/watch');
  };

  const handleRelatedTap = (id: string) => {
    playPop();
    router.replace(`/watch/${id}`);
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kids-offwhite">
        <div className="text-6xl animate-bounce">🎬</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kids-offwhite">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-2xl flex items-center justify-between px-4 h-14">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 rounded-2xl px-2 py-1 hover:bg-kids-lightgray transition-colors"
          >
            <ArrowLeft className="size-5 text-kids-text-secondary" />
            <span className="hidden sm:inline text-sm font-nunito font-bold text-kids-text-secondary">Videos</span>
          </button>
          <h1 className="text-sm sm:text-base font-nunito font-extrabold text-kids-dark truncate max-w-[200px]">
            {video.title}
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Video player area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden shadow-kids-lg mb-6"
        >
          {/* Video placeholder (YouTube embed placeholder) */}
          <div className="relative aspect-video bg-gradient-to-br from-kids-lightgray to-kids-offwhite flex items-center justify-center">
            <motion.span
              className="text-7xl sm:text-8xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {video.thumbnail}
            </motion.span>
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/70 text-white text-xs font-nunito font-bold">
              {video.duration}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 shadow-kids-lg flex items-center justify-center">
                <span className="text-3xl ml-1">▶️</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Video info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <KidsCard variant="default" padding="lg" color="white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-nunito font-extrabold text-kids-dark">
                  {video.title}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-kids-text-secondary font-nunito">
                  <span className="flex items-center gap-1">
                    <Eye className="size-4" />
                    {video.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" />
                    {video.duration}
                  </span>
                  <KidsBadge variant="muted" size="sm">
                    {video.category}
                  </KidsBadge>
                </div>
              </div>
              <motion.button
                type="button"
                onClick={() => setLiked(!liked)}
                whileTap={{ scale: 0.9 }}
                className="p-2"
                aria-label={liked ? 'Unlike' : 'Like'}
              >
                <motion.span
                  className="text-2xl"
                  animate={liked ? { scale: [1, 1.3, 1] } : {}}
                >
                  {liked ? '👍' : '👍'}
                </motion.span>
              </motion.button>
            </div>

            {/* Description */}
            {showInfo && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 text-sm text-kids-text-secondary font-nunito leading-relaxed"
              >
                {video.description}
              </motion.p>
            )}

            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className="mt-2 text-xs font-nunito font-bold text-kids-sky hover:text-kids-blue transition-colors"
            >
              {showInfo ? 'Show less' : 'Show more'}
            </button>
          </KidsCard>
        </motion.div>

        {/* Related videos */}
        {video.relatedVideos.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <h3 className="text-base font-nunito font-bold text-kids-dark mb-3">
              Up Next
            </h3>
            <div className="space-y-3">
              {video.relatedVideos.map((rv, idx) => (
                <motion.div
                  key={rv.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                >
                  <KidsCard
                    variant="interactive"
                    padding="none"
                    className="flex items-center gap-3 p-3"
                    onClick={() => handleRelatedTap(rv.id)}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-kids-lightgray flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{rv.thumbnail}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-nunito font-bold text-kids-dark truncate">
                        {rv.title}
                      </p>
                    </div>
                    <span className="text-kids-text-muted text-lg">▶</span>
                  </KidsCard>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
