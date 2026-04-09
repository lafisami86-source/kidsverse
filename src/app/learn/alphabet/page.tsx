'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Volume2, ChevronRight, PartyPopper, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsButton } from '@/components/kids/kids-button';
import { KidsBadge } from '@/components/kids/kids-badge';
import { KidsModal } from '@/components/kids/kids-modal';
import { StarBadge } from '@/components/kids/star-badge';
import { useAudio } from '@/hooks/use-audio';
import { useAgeGroup } from '@/hooks/use-age-group';

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

interface LetterData {
  letter: string;
  word: string;
  emoji: string;
  color: string;
}

type AppMode = 'explore' | 'lesson' | 'quiz' | 'celebration';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'kv-active-profile';
const ALPHABET_PROGRESS_KEY = 'kv-alphabet-progress';

const LETTERS: LetterData[] = [
  { letter: 'A', word: 'Apple', emoji: '🍎', color: 'text-kids-coral' },
  { letter: 'B', word: 'Bear', emoji: '🐻', color: 'text-kids-sun' },
  { letter: 'C', word: 'Cat', emoji: '🐱', color: 'text-kids-grass' },
  { letter: 'D', word: 'Dog', emoji: '🐶', color: 'text-kids-sun' },
  { letter: 'E', word: 'Elephant', emoji: '🐘', color: 'text-kids-text-secondary' },
  { letter: 'F', word: 'Fish', emoji: '🐟', color: 'text-kids-sky' },
  { letter: 'G', word: 'Giraffe', emoji: '🦒', color: 'text-kids-grass' },
  { letter: 'H', word: 'House', emoji: '🏠', color: 'text-kids-sun' },
  { letter: 'I', word: 'Ice cream', emoji: '🍦', color: 'text-kids-pink' },
  { letter: 'J', word: 'Juice', emoji: '🧃', color: 'text-kids-grass' },
  { letter: 'K', word: 'Kite', emoji: '🪁', color: 'text-kids-lavender' },
  { letter: 'L', word: 'Lion', emoji: '🦁', color: 'text-kids-sun' },
  { letter: 'M', word: 'Moon', emoji: '🌙', color: 'text-kids-lavender' },
  { letter: 'N', word: 'Nest', emoji: '🪺', color: 'text-kids-sun' },
  { letter: 'O', word: 'Octopus', emoji: '🐙', color: 'text-kids-coral' },
  { letter: 'P', word: 'Penguin', emoji: '🐧', color: 'text-kids-text-secondary' },
  { letter: 'Q', word: 'Queen', emoji: '👸', color: 'text-kids-pink' },
  { letter: 'R', word: 'Rainbow', emoji: '🌈', color: 'text-kids-sky' },
  { letter: 'S', word: 'Star', emoji: '⭐', color: 'text-kids-sun' },
  { letter: 'T', word: 'Tree', emoji: '🌳', color: 'text-kids-grass' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️', color: 'text-kids-sky' },
  { letter: 'V', word: 'Violin', emoji: '🎻', color: 'text-kids-coral' },
  { letter: 'W', word: 'Watermelon', emoji: '🍉', color: 'text-kids-grass' },
  { letter: 'X', word: 'Xylophone', emoji: '🪈', color: 'text-kids-lavender' },
  { letter: 'Y', word: 'Yarn', emoji: '🧶', color: 'text-kids-coral' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓', color: 'text-kids-text-secondary' },
];

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

interface AlphabetProgressData {
  viewed: string[];
  completed: string[];
  stars: Record<string, number>;
}

function getAlphabetProgress(): AlphabetProgressData {
  if (typeof window === 'undefined') return { viewed: [], completed: [], stars: {} };
  try {
    const raw = localStorage.getItem(ALPHABET_PROGRESS_KEY);
    if (!raw) return { viewed: [], completed: [], stars: {} };
    return JSON.parse(raw) as AlphabetProgressData;
  } catch {
    return { viewed: [], completed: [], stars: {} };
  }
}

function saveAlphabetProgress(data: AlphabetProgressData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ALPHABET_PROGRESS_KEY, JSON.stringify(data));
  } catch {
    // Silent fail for storage
  }
}

function speakLetter(letter: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(letter);
  utterance.rate = 0.8;
  utterance.pitch = 1.2;
  window.speechSynthesis.speak(utterance);
}

function speakWord(word: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.7;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

function getQuizOptions(correctLetter: string, allLetters: LetterData[]): { label: string; correct: boolean }[] {
  const correct = correctLetter;
  const others = allLetters
    .map((l) => l.letter)
    .filter((l) => l !== correct);
  // Shuffle and pick 2
  const shuffled = others.sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, 2);
  const options = [
    { label: correct, correct: true },
    { label: picks[0], correct: false },
    { label: picks[1], correct: false },
  ];
  // Shuffle options
  return options.sort(() => Math.random() - 0.5);
}

/* ------------------------------------------------------------------ */
/*  Confetti Component                                                  */
/* ------------------------------------------------------------------ */

function Confetti() {
  const particles = useMemo(() => {
    const colors = ['#FF6B6B', '#FFD93D', '#7ED957', '#60B5FF', '#C4B5FD', '#F472B6', '#6EE7B7', '#FBBF7A'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'square' : 'star',
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : '0%',
            transform: `rotate(${p.rotation}deg)`,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 40 : 1000,
            opacity: [1, 1, 0],
            rotate: p.rotation + 720,
            x: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

const letterGridItem = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 22 },
  },
};

const lessonVariants = {
  enter: { opacity: 0, scale: 0.7, y: 40 },
  center: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  exit: { opacity: 0, scale: 0.8, y: -40, transition: { duration: 0.25 } },
};

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function AlphabetPage() {
  const router = useRouter();
  const { play: playPop } = useAudio({ frequency: 600, type: 'triangle' });
  const { play: playSuccess } = useAudio({ frequency: 1200, type: 'sine', duration: 300 });
  const { play: playError } = useAudio({ frequency: 300, type: 'square', duration: 200 });

  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<AppMode>('explore');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [viewedSet, setViewedSet] = useState<Set<string>>(new Set());
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [starMap, setStarMap] = useState<Record<string, number>>({});
  const [quizOptions, setQuizOptions] = useState<{ label: string; correct: boolean }[]>([]);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [flashCorrect, setFlashCorrect] = useState(false);
  const [flashWrong, setFlashWrong] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  /* ---- Load from localStorage on mount ---- */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      setProfile(getStoredProfile());

      const prog = getAlphabetProgress();
      setViewedSet(new Set(prog.viewed));
      setCompletedSet(new Set(prog.completed));
      setStarMap(prog.stars);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---- Persist progress ---- */
  const persistProgress = useCallback(
    (viewed: Set<string>, completed: Set<string>, stars: Record<string, number>) => {
      const data: AlphabetProgressData = {
        viewed: Array.from(viewed),
        completed: Array.from(completed),
        stars,
      };
      saveAlphabetProgress(data);

      // Also update the global learn-progress for the overview page
      if (typeof window === 'undefined') return;
      try {
        const raw = localStorage.getItem('kv-learn-progress');
        const globalProgress = raw ? JSON.parse(raw) : {};
        const totalCompleted = completed.size;
        const totalStars = Object.values(stars).reduce((s, v) => s + v, 0);
        globalProgress['alphabet'] = { completed: totalCompleted, stars: totalStars };
        localStorage.setItem('kv-learn-progress', JSON.stringify(globalProgress));
      } catch {
        // Silent
      }
    },
    [],
  );

  /* ---- Age config ---- */
  const ageConfig = useAgeGroup(profile?.age ?? 5);
  const ageGroup = ageConfig.ageGroup;
  const isToddler = ageGroup === 'toddler';
  const isKid = ageGroup === 'kid';

  /* ---- Adaptive sizing ---- */
  const gridLetterSize = isToddler ? 'text-2xl sm:text-3xl' : isKid ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl';
  const displayLetterSize = isToddler ? 'text-[120px] sm:text-[160px]' : isKid ? 'text-[80px] sm:text-[100px]' : 'text-[100px] sm:text-[130px]';
  const emojiSize = isToddler ? 'text-6xl sm:text-7xl' : isKid ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl';
  const buttonSize = isToddler ? 'toddler' as const : isKid ? 'kid' as const : 'early' as const;

  /* ---- Derived state ---- */
  const currentLetter = LETTERS[selectedIdx];
  const isViewed = viewedSet.has(currentLetter.letter);
  const isCompleted = completedSet.has(currentLetter.letter);
  const completedCount = completedSet.size;
  const allDone = completedCount >= 26;

  /* ---- Check celebration ---- */
  useEffect(() => {
    if (allDone && mounted) {
      const timer = setTimeout(() => {
        setMode('celebration');
        setShowCelebration(true);
        playSuccess();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [allDone, mounted, playSuccess]);

  /* ---- Handlers ---- */
  const handleLetterTap = useCallback(
    (idx: number) => {
      playPop();
      setSelectedIdx(idx);
      setMode('lesson');
      setQuizAttempts(0);
      setFlashCorrect(false);
      setFlashWrong(false);

      // Mark as viewed
      setViewedSet((prev) => {
        const next = new Set(prev);
        next.add(LETTERS[idx].letter);
        return next;
      });
    },
    [playPop],
  );

  const handleHearIt = useCallback(() => {
    playPop();
    speakLetter(currentLetter.letter);
  }, [playPop, currentLetter]);

  const handleHearWord = useCallback(() => {
    playPop();
    speakWord(currentLetter.word);
  }, [playPop, currentLetter]);

  const handleStartQuiz = useCallback(() => {
    playPop();
    const opts = getQuizOptions(currentLetter.letter, LETTERS);
    setQuizOptions(opts);
    setQuizAttempts(0);
    setMode('quiz');
  }, [playPop, currentLetter]);

  const handleQuizAnswer = useCallback(
    (option: { label: string; correct: boolean }) => {
      if (option.correct) {
        playSuccess();
        setFlashCorrect(true);
        setTimeout(() => setFlashCorrect(false), 800);

        // Calculate stars
        const stars = quizAttempts === 0 ? 3 : quizAttempts === 1 ? 2 : 1;

        setCompletedSet((prev) => {
          const next = new Set(prev);
          next.add(currentLetter.letter);
          return next;
        });
        setStarMap((prev) => {
          const existing = prev[currentLetter.letter] ?? 0;
          return { ...prev, [currentLetter.letter]: Math.max(existing, stars) };
        });

        // Persist after a short delay for animation
        setTimeout(() => {
          const newViewed = new Set(viewedSet);
          newViewed.add(currentLetter.letter);
          const newCompleted = new Set(completedSet);
          newCompleted.add(currentLetter.letter);
          const newStars = { ...starMap, [currentLetter.letter]: Math.max(starMap[currentLetter.letter] ?? 0, stars) };
          persistProgress(newViewed, newCompleted, newStars);
        }, 300);

        // Auto advance after delay
        setTimeout(() => {
          if (selectedIdx < 25) {
            setSelectedIdx((prev) => prev + 1);
            setMode('lesson');
            setQuizAttempts(0);
            setViewedSet((prev) => {
              const next = new Set(prev);
              next.add(LETTERS[selectedIdx + 1].letter);
              return next;
            });
          } else {
            // Last letter completed
            const newCompleted = new Set(completedSet);
            newCompleted.add(currentLetter.letter);
            const stars = quizAttempts === 0 ? 3 : quizAttempts === 1 ? 2 : 1;
            const newStars = { ...starMap, [currentLetter.letter]: Math.max(starMap[currentLetter.letter] ?? 0, stars) };
            persistProgress(viewedSet, newCompleted, newStars);
            setMode('explore');
          }
        }, 1200);
      } else {
        playError();
        setFlashWrong(true);
        setQuizAttempts((prev) => prev + 1);
        setTimeout(() => setFlashWrong(false), 600);
      }
    },
    [
      playSuccess, playError, quizAttempts, currentLetter, selectedIdx,
      viewedSet, completedSet, starMap, persistProgress,
    ],
  );

  const handleNextLetter = useCallback(() => {
    // For toddlers — explore mode: just view, mark as "completed", and move on
    playPop();
    if (!isCompleted) {
      setCompletedSet((prev) => {
        const next = new Set(prev);
        next.add(currentLetter.letter);
        return next;
      });
      setStarMap((prev) => ({
        ...prev,
        [currentLetter.letter]: Math.max(prev[currentLetter.letter] ?? 0, 2),
      }));

      const newViewed = new Set(viewedSet);
      newViewed.add(currentLetter.letter);
      const newCompleted = new Set(completedSet);
      newCompleted.add(currentLetter.letter);
      const newStars = { ...starMap, [currentLetter.letter]: Math.max(starMap[currentLetter.letter] ?? 0, 2) };
      persistProgress(newViewed, newCompleted, newStars);
    }

    if (selectedIdx < 25) {
      setSelectedIdx((prev) => prev + 1);
      setMode('lesson');
      setQuizAttempts(0);
      setViewedSet((prev) => {
        const next = new Set(prev);
        next.add(LETTERS[selectedIdx + 1].letter);
        return next;
      });
    } else {
      setMode('explore');
    }
  }, [playPop, isCompleted, currentLetter, selectedIdx, viewedSet, completedSet, starMap, persistProgress]);

  const handleBackToExplore = useCallback(() => {
    playPop();
    setMode('explore');
  }, [playPop]);

  const handleGoBack = useCallback(() => {
    playPop();
    router.push('/learn');
  }, [playPop, router]);

  const handleRestart = useCallback(() => {
    setViewedSet(new Set());
    setCompletedSet(new Set());
    setStarMap({});
    setMode('explore');
    setShowCelebration(false);
    persistProgress(new Set(), new Set(), {});
  }, [persistProgress]);

  /* ---- Not mounted / no profile ---- */
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
            🔤
          </motion.span>
          <p className="font-nunito text-lg font-bold text-kids-dark">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kids-offwhite px-4">
        <motion.div
          className="flex flex-col items-center gap-6 rounded-3xl bg-white p-8 shadow-kids-lg text-center max-w-sm sm:max-w-md"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <motion.span
            className="text-6xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            🔤
          </motion.span>
          <div>
            <h1 className="text-2xl font-nunito font-extrabold text-kids-dark">
              Who&apos;s Learning?
            </h1>
            <p className="mt-2 text-sm text-kids-text-secondary leading-relaxed">
              Please select a profile first!
            </p>
          </div>
          <KidsButton variant="primary" size="early" onClick={() => router.push('/kids')}>
            Choose a Profile
          </KidsButton>
        </motion.div>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-kids-offwhite">
      {/* Confetti on celebration */}
      {showCelebration && <Confetti />}

      {/* Top bar */}
      <header className="sticky top-0 z-40 w-full">
        <div className="mx-auto max-w-2xl">
          <div className="flex h-14 items-center justify-between rounded-b-2xl bg-white px-4 shadow-kids sm:px-6">
            <button
              type="button"
              onClick={handleGoBack}
              className="flex items-center gap-2 rounded-2xl px-2 py-1 transition-colors hover:bg-kids-lightgray focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky"
              aria-label="Back to learning modules"
            >
              <ArrowLeft className="size-5 text-kids-text-secondary" aria-hidden="true" />
              <span className="hidden text-sm font-nunito font-bold text-kids-text-secondary sm:inline">
                Learn
              </span>
            </button>
            <div className="flex items-center gap-2">
              <KidsBadge variant="sky" size="sm" icon={<span aria-hidden="true">🔤</span>}>
                {completedCount}/26
              </KidsBadge>
            </div>
            <div className="flex items-center gap-2">
              <motion.span className="text-2xl" aria-hidden="true">
                {profile.avatar}
              </motion.span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-4 pb-12 pt-4 sm:px-6 sm:pt-6">
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/*  EXPLORE MODE — Letter Grid                                  */}
          {/* ============================================================ */}
          {mode === 'explore' && (
            <motion.div
              key="explore"
              className="flex flex-col gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            >
              {/* Section title */}
              <motion.div variants={letterGridItem} className="text-center">
                <h1 className="text-xl sm:text-2xl font-nunito font-extrabold text-kids-dark">
                  Alphabet Adventure 🔤
                </h1>
                <p className="mt-1 text-sm text-kids-text-secondary">
                  {isToddler
                    ? 'Tap a letter to explore!'
                    : `Tap a letter to start learning — ${completedCount} of 26 done!`}
                </p>
                {/* Progress bar */}
                <div className="mt-3 mx-auto max-w-xs">
                  <div className="h-3 w-full rounded-full bg-kids-lightgray overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-kids-sky to-kids-blue"
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedCount / 26) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Letter grid */}
              <motion.div
                className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2 sm:gap-3"
                variants={containerVariants}
              >
                {LETTERS.map((item, idx) => {
                  const done = completedSet.has(item.letter);
                  const viewed = viewedSet.has(item.letter);
                  const stars = starMap[item.letter] ?? 0;

                  return (
                    <motion.button
                      key={item.letter}
                      type="button"
                      variants={letterGridItem}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleLetterTap(idx)}
                      className={cn(
                        'relative flex flex-col items-center justify-center rounded-2xl border-2 p-2 sm:p-3 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky',
                        done
                          ? 'bg-gradient-to-br from-kids-grass/20 to-kids-mint/20 border-kids-grass/40'
                          : viewed
                            ? 'bg-gradient-to-br from-kids-sun/10 to-kids-peach/10 border-kids-sun/30'
                            : 'bg-white border-kids-lightgray hover:border-kids-sky/40',
                        isToddler ? 'min-h-[64px] sm:min-h-[72px]' : 'min-h-[52px] sm:min-h-[60px]',
                      )}
                      aria-label={`Letter ${item.letter}${done ? ', completed' : viewed ? ', viewed' : ''}`}
                    >
                      <span
                        className={cn(
                          'font-nunito font-extrabold leading-none',
                          gridLetterSize,
                          done ? 'text-kids-grass' : 'text-kids-dark',
                        )}
                      >
                        {item.letter}
                      </span>
                      {/* Star indicator */}
                      {done && stars > 0 && (
                        <span className="absolute -top-1 -right-1 text-xs" aria-hidden="true">
                          ⭐
                        </span>
                      )}
                      {/* Viewed dot */}
                      {viewed && !done && (
                        <span className="absolute -top-1 -right-1 size-2 rounded-full bg-kids-sun" aria-hidden="true" />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/*  LESSON MODE — Large letter display                          */}
          {/* ============================================================ */}
          {mode === 'lesson' && (
            <motion.div
              key={`lesson-${selectedIdx}`}
              variants={lessonVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center gap-5 sm:gap-6"
            >
              {/* Back to grid button */}
              <div className="w-full flex justify-start">
                <KidsButton variant="ghost" size="sm" onClick={handleBackToExplore} sound="pop">
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  <span>All Letters</span>
                </KidsButton>
              </div>

              {/* Large letter card */}
              <KidsCard
                variant="elevated"
                color="white"
                padding="xl"
                className="w-full text-center relative overflow-hidden"
              >
                {/* Decorative background dots */}
                <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
                  <div className="absolute top-4 left-4 text-4xl">{currentLetter.emoji}</div>
                  <div className="absolute bottom-4 right-4 text-4xl">{currentLetter.emoji}</div>
                  <div className="absolute top-8 right-8 text-2xl">{currentLetter.emoji}</div>
                </div>

                {/* Progress indicator: which letter */}
                <div className="relative flex items-center justify-center gap-2 mb-2">
                  <span className="text-xs font-nunito font-bold text-kids-text-muted">
                    {selectedIdx + 1} of 26
                  </span>
                </div>

                {/* The big letter */}
                <motion.div
                  className={cn('font-nunito font-extrabold leading-none', displayLetterSize, currentLetter.color)}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                >
                  {currentLetter.letter}
                </motion.div>

                {/* Emoji + Word */}
                <motion.div
                  className="mt-2 flex flex-col items-center gap-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className={emojiSize} aria-hidden="true">
                    {currentLetter.emoji}
                  </span>
                  <p className="text-lg sm:text-xl font-nunito font-bold text-kids-dark">
                    {isToddler ? '' : `${currentLetter.letter} is for`}
                  </p>
                  <p className="text-xl sm:text-2xl font-nunito font-extrabold text-kids-dark">
                    {currentLetter.word}
                  </p>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {/* Hear letter sound */}
                  <KidsButton
                    variant="primary"
                    size={buttonSize}
                    onClick={handleHearIt}
                    sound="pop"
                    leftIcon={<Volume2 className="size-5" aria-hidden="true" />}
                  >
                    {isToddler ? '🔊 Hear It' : 'Hear Letter'}
                  </KidsButton>

                  {/* Hear the word */}
                  <KidsButton
                    variant="accent"
                    size={buttonSize}
                    onClick={handleHearWord}
                    sound="pop"
                    leftIcon={<span aria-hidden="true">{currentLetter.emoji}</span>}
                  >
                    {isToddler ? '🗣️ Word' : `Hear "${currentLetter.word}"`}
                  </KidsButton>
                </motion.div>

                {/* Quiz / Next button */}
                <motion.div
                  className="mt-5 flex justify-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {isToddler ? (
                    <KidsButton
                      variant="success"
                      size={buttonSize}
                      onClick={handleNextLetter}
                      sound="pop"
                      rightIcon={<ChevronRight className="size-5" aria-hidden="true" />}
                    >
                      {selectedIdx < 25 ? 'Next Letter →' : 'All Done! 🎉'}
                    </KidsButton>
                  ) : (
                    <KidsButton
                      variant="success"
                      size={buttonSize}
                      onClick={handleStartQuiz}
                      sound="pop"
                      rightIcon={<span aria-hidden="true">🎯</span>}
                    >
                      {isCompleted ? 'Quiz Again!' : 'Quiz Me!'}
                    </KidsButton>
                  )}
                </motion.div>

                {/* Show stars if already completed */}
                {isCompleted && (starMap[currentLetter.letter] ?? 0) > 0 && (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <StarBadge
                      count={starMap[currentLetter.letter]}
                      max={3}
                      size={isToddler ? 36 : 28}
                      animate={false}
                      ariaLabel={`${starMap[currentLetter.letter]} of 3 stars earned for ${currentLetter.letter}`}
                    />
                  </motion.div>
                )}
              </KidsCard>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/*  QUIZ MODE                                                   */}
          {/* ============================================================ */}
          {mode === 'quiz' && (
            <motion.div
              key={`quiz-${selectedIdx}`}
              variants={lessonVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center gap-5 sm:gap-6"
            >
              {/* Back to lesson */}
              <div className="w-full flex justify-start">
                <KidsButton variant="ghost" size="sm" onClick={() => setMode('lesson')} sound="pop">
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  <span>Back</span>
                </KidsButton>
              </div>

              {/* Question card */}
              <KidsCard
                variant="elevated"
                color={flashCorrect ? 'grass' : flashWrong ? 'coral' : 'white'}
                padding="xl"
                className={cn(
                  'w-full text-center transition-colors duration-300',
                  flashCorrect && 'ring-4 ring-kids-grass/50',
                  flashWrong && 'ring-4 ring-kids-coral/50',
                )}
              >
                {/* Question text */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-base sm:text-lg font-nunito font-bold text-kids-text-secondary">
                    Which letter is this?
                  </p>
                </motion.div>

                {/* Show the letter + word hint */}
                <motion.div
                  className="my-4"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
                >
                  <span className={cn('text-6xl sm:text-7xl font-nunito font-extrabold', currentLetter.color)}>
                    {currentLetter.letter}
                  </span>
                </motion.div>

                {/* Emoji hint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-3xl" aria-hidden="true">{currentLetter.emoji}</span>
                </motion.div>

                {/* Feedback text */}
                <AnimatePresence mode="wait">
                  {flashCorrect && (
                    <motion.p
                      key="correct"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 text-lg font-nunito font-extrabold text-kids-grass"
                    >
                      ✅ Amazing! That&apos;s right!
                    </motion.p>
                  )}
                  {flashWrong && (
                    <motion.p
                      key="wrong"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 text-lg font-nunito font-extrabold text-kids-coral"
                    >
                      😊 Try again!
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Answer options */}
                <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
                  {quizOptions.map((option) => (
                    <motion.button
                      key={option.label}
                      type="button"
                      disabled={flashCorrect}
                      whileHover={!flashCorrect ? { scale: 1.05, y: -2 } : {}}
                      whileTap={!flashCorrect ? { scale: 0.92 } : {}}
                      onClick={() => !flashCorrect && handleQuizAnswer(option)}
                      className={cn(
                        'flex items-center justify-center rounded-2xl border-3 font-nunito font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky',
                        isToddler ? 'min-h-[72px] sm:min-h-[80px] text-3xl sm:text-4xl' : 'min-h-[56px] sm:min-h-[64px] text-2xl sm:text-3xl',
                        flashCorrect && option.correct
                          ? 'bg-kids-grass text-white border-kids-grass'
                          : 'bg-white text-kids-dark border-kids-lightgray hover:border-kids-sky/50',
                      )}
                      aria-label={`Letter ${option.label}`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>

                {/* Hear it during quiz */}
                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <KidsButton variant="ghost" size="sm" onClick={handleHearIt} sound="pop">
                    <Volume2 className="size-4" aria-hidden="true" />
                    <span>Hear it</span>
                  </KidsButton>
                </motion.div>
              </KidsCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ================================================================ */}
      {/*  CELEBRATION MODAL                                               */}
      {/* ================================================================ */}
      <KidsModal
        isOpen={mode === 'celebration'}
        onClose={() => {
          setShowCelebration(false);
          setMode('explore');
        }}
        title="🎉 You Did It!"
        description="You've learned all 26 letters of the alphabet!"
        size="md"
        showCloseButton={true}
        footer={
          <>
            <KidsButton
              variant="outline"
              onClick={handleRestart}
              sound="pop"
              leftIcon={<RotateCcw className="size-4" aria-hidden="true" />}
            >
              Start Over
            </KidsButton>
            <KidsButton
              variant="rainbow"
              onClick={() => {
                setShowCelebration(false);
                setMode('explore');
                router.push('/learn');
              }}
              sound="success"
              leftIcon={<span aria-hidden="true">📚</span>}
            >
              More Learning!
            </KidsButton>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 py-4">
          {/* Celebration emoji */}
          <motion.span
            className="text-7xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            🏆
          </motion.span>

          {/* Stars summary */}
          <div className="text-center">
            <p className="text-sm text-kids-text-secondary mb-2">
              Total stars earned
            </p>
            <StarBadge
              count={Object.values(starMap).reduce((s, v) => s + v, 0)}
              max={78}
              size={32}
              animate={true}
              ariaLabel={`Total stars earned: ${Object.values(starMap).reduce((s, v) => s + v, 0)} out of 78`}
            />
            <p className="mt-2 text-xs text-kids-text-muted font-nunito">
              {Object.values(starMap).reduce((s, v) => s + v, 0)} / 78 stars
            </p>
          </div>

          {/* Perfect score badge */}
          {Object.values(starMap).every((s) => s === 3) && (
            <KidsBadge variant="gold" size="lg" isAchievement glow>
              ⭐ Perfect Score!
            </KidsBadge>
          )}

          {/* Decorative letters */}
          <div className="flex flex-wrap justify-center gap-1 mt-2 max-w-xs" aria-hidden="true">
            {LETTERS.map((l) => (
              <motion.span
                key={l.letter}
                className="text-sm font-nunito font-extrabold text-kids-sky"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: Math.random() * 0.5,
                  ease: 'easeInOut',
                }}
              >
                {l.letter}
              </motion.span>
            ))}
          </div>
        </div>
      </KidsModal>
    </div>
  );
}
