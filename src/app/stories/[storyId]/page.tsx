'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, BookOpen, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsButton } from '@/components/kids/kids-button';
import { KidsBadge } from '@/components/kids/kids-badge';
import { useAudio } from '@/hooks/use-audio';
import { useAgeGroup } from '@/hooks/use-age-group';

/* ------------------------------------------------------------------ */
/*  Story data                                                         */
/* ------------------------------------------------------------------ */

const STORIES_DB: Record<string, {
  title: string;
  icon: string;
  pages: { text: string; emoji: string; bg: string }[];
}> = {
  'lion-mouse': {
    title: 'The Lion & The Mouse',
    icon: '🦁',
    pages: [
      { text: 'Once upon a time, a mighty lion was sleeping in the forest.', emoji: '🦁', bg: 'from-green-100 to-emerald-100' },
      { text: 'A tiny mouse ran across the lion\'s nose by mistake! The lion woke up angry.', emoji: '🐭', bg: 'from-amber-100 to-yellow-100' },
      { text: '"Please let me go!" squeaked the mouse. "Maybe I can help you someday!"', emoji: '😞', bg: 'from-rose-100 to-pink-100' },
      { text: 'The lion laughed but let the mouse go free. "How could a tiny mouse help ME?"', emoji: '😄', bg: 'from-green-100 to-emerald-100' },
      { text: 'Days later, the lion got caught in a hunter\'s net! He roared for help.', emoji: '🪢', bg: 'from-sky-100 to-blue-100' },
      { text: 'The little mouse heard the lion and hurried to help!', emoji: '🐭', bg: 'from-amber-100 to-yellow-100' },
      { text: 'The mouse chewed through the ropes and set the lion free!', emoji: '✂️', bg: 'from-green-100 to-emerald-100' },
      { text: '"Thank you, little friend!" said the lion. "You were right — even the smallest friends can be the biggest help!"', emoji: '❤️', bg: 'from-rose-100 to-pink-100' },
    ],
  },
  'moon-rabbit': {
    title: 'The Moon Rabbit',
    icon: '🐰',
    pages: [
      { text: 'Long ago, a kind rabbit lived on Earth with her friends: a fox, a monkey, and an otter.', emoji: '🐰', bg: 'from-violet-100 to-purple-100' },
      { text: 'One day, a hungry old man came asking for food. Everyone wanted to help!', emoji: '👴', bg: 'from-amber-100 to-yellow-100' },
      { text: 'The monkey brought fruit, the otter brought fish, and the fox brought milk.', emoji: '🐒', bg: 'from-green-100 to-emerald-100' },
      { text: 'But the rabbit had no food to give. She only knew how to gather grass.', emoji: '😢', bg: 'from-rose-100 to-pink-100' },
      { text: 'So the rabbit jumped into the fire to offer herself as food for the old man.', emoji: '🔥', bg: 'from-red-100 to-orange-100' },
      { text: 'But the fire didn\'t hurt! The old man was a magical being, touched by her kindness.', emoji: '✨', bg: 'from-sky-100 to-blue-100' },
      { text: 'He took the rabbit to the moon, where she lives forever, making delicious rice cakes!', emoji: '🌕', bg: 'from-violet-100 to-purple-100' },
      { text: 'If you look at the moon, you can still see the rabbit with her rice cake mortar! 🍙', emoji: '🌙', bg: 'from-indigo-100 to-blue-100' },
    ],
  },
};

// Default story for any story ID not in DB
const DEFAULT_STORY = {
  title: 'A Wonderful Story',
  icon: '📖',
  pages: [
    { text: 'Once upon a time, in a land far away, something magical was about to happen!', emoji: '🌟', bg: 'from-amber-100 to-yellow-100' },
    { text: 'The animals of the forest gathered together to share stories and laughter.', emoji: '🦁', bg: 'from-green-100 to-emerald-100' },
    { text: 'Each friend had something special to share. What matters most is being kind.', emoji: '❤️', bg: 'from-rose-100 to-pink-100' },
    { text: 'And they all lived happily ever after! The End. 🎉', emoji: '🌟', bg: 'from-sky-100 to-blue-100' },
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

function speakText(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.7;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function StoryViewer() {
  const router = useRouter();
  const { play: playPop } = useAudio({ frequency: 600, type: 'triangle' });
  const { play: playSuccess } = useAudio({ frequency: 1200, type: 'sine' });

  const [profile, setProfile] = useState<{ name: string; age: number; id?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const storyId = typeof window !== 'undefined'
    ? window.location.pathname.split('/stories/')[1] || 'lion-mouse'
    : 'lion-mouse';

  const story = STORIES_DB[storyId] || DEFAULT_STORY;
  const totalPages = story.pages.length;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      const p = getStoredProfile();
      setProfile(p);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const ageConfig = useAgeGroup(profile?.age ?? 5);
  const isToddler = ageConfig.ageGroup === 'toddler';

  const handlePrev = useCallback(() => {
    if (currentPage > 0) {
      playPop();
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage, playPop]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      playPop();
      setCurrentPage((p) => p + 1);
    } else {
      playSuccess();
      router.replace('/stories');
    }
  }, [currentPage, totalPages, playPop, playSuccess, router]);

  const handleReadAloud = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else {
      speakText(story.pages[currentPage].text);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 5000);
    }
  }, [currentPage, story, isSpeaking]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kids-offwhite">
        <div className="text-6xl animate-bounce">📖</div>
      </div>
    );
  }

  const page = story.pages[currentPage];

  return (
    <div className="min-h-screen bg-kids-offwhite flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-2xl flex items-center justify-between px-4 h-14">
          <button
            type="button"
            onClick={() => { playPop(); router.replace('/stories'); }}
            className="flex items-center gap-2 rounded-2xl px-2 py-1 hover:bg-kids-lightgray transition-colors"
          >
            <ArrowLeft className="size-5 text-kids-dark" />
            <span className="hidden sm:inline text-sm font-nunito font-bold text-kids-dark">Stories</span>
          </button>
          <h1 className="text-sm sm:text-base font-nunito font-extrabold text-kids-dark truncate max-w-[200px]">
            {story.title}
          </h1>
          <KidsBadge variant="default" size="sm">
            {currentPage + 1}/{totalPages}
          </KidsBadge>
        </div>
      </header>

      {/* Story content */}
      <main className="flex-1 flex flex-col mx-auto max-w-2xl w-full px-3 py-3 sm:px-4 sm:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className={cn('flex-1 flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br px-5 py-5 sm:px-10 sm:py-8 shadow-kids-lg', page.bg)}
          >
            {/* Page emoji */}
            <motion.span
              className="text-5xl sm:text-7xl mb-4 sm:mb-6"
              animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {page.emoji}
            </motion.span>

            {/* Story text */}
            <p className={cn(
              'font-nunito text-kids-dark text-center leading-relaxed max-w-md sm:max-w-lg',
              isToddler ? 'text-lg sm:text-xl' : 'text-sm sm:text-base',
            )}>
              {page.text}
            </p>

            {/* Read aloud button */}
            <motion.button
              type="button"
              onClick={handleReadAloud}
              className={cn(
                'mt-4 sm:mt-6 px-4 py-2 rounded-2xl bg-white/80 shadow-kids font-nunito font-bold flex items-center gap-2 hover:bg-white transition-colors',
                'text-kids-sky text-xs sm:text-sm',
              )}
              whileTap={{ scale: 0.95 }}
            >
              <Volume2 className="size-3.5 sm:size-4" />
              {isSpeaking ? 'Stop' : 'Read Aloud'}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="sticky bottom-0 bg-white border-t border-kids-lightgray shadow-sm">
        <div className="mx-auto max-w-2xl flex items-center justify-between px-4 h-16">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-2xl font-nunito font-bold text-sm transition-all',
              currentPage === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-kids-dark bg-kids-lightgray/60 hover:bg-kids-lightgray active:scale-95',
            )}
          >
            <ChevronLeft className="size-5" />
            {isToddler ? '' : 'Back'}
          </button>

          {/* Progress dots */}
          <div className="flex gap-2">
            {story.pages.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full transition-all',
                  i === currentPage
                    ? 'bg-kids-sky w-3 h-3'
                    : 'bg-gray-300 w-2.5 h-2.5',
                )}
              />
            ))}
          </div>

          <KidsButton
            variant="primary"
            size="early"
            onClick={handleNext}
            rightIcon={<ChevronRight className="size-5" />}
            sound="pop"
          >
            {currentPage === totalPages - 1 ? (isToddler ? '🏠' : 'Done!') : (isToddler ? '▶️' : 'Next')}
          </KidsButton>
        </div>
      </nav>
    </div>
  );
}
