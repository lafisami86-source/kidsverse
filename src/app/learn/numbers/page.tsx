'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, RotateCcw, PartyPopper, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsButton } from '@/components/kids/kids-button';
import { KidsBadge } from '@/components/kids/kids-badge';
import { KidsProgressBar } from '@/components/kids/kids-progress-bar';
import { KidsModal } from '@/components/kids/kids-modal';
import { useAudio } from '@/hooks/use-audio';
import { useAgeGroup } from '@/hooks/use-age-group';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NumberData {
  num: number;
  emoji: string;
  word: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'kv-active-profile';
const PROGRESS_KEY = 'kv-learn-progress';
const NUMBERS_KEY = 'kv-numbers-progress';

const COUNTING_EMOJIS = ['⭐', '🍎', '🐟', '🦋', '🌸', '🎈', '🐶', '🐱', '🏀', '🚗', '🍓', '🌻', '🐝', '🍀', '🦆', '🌺', '🍎', '🌟', '🌈', '🍬'];

const NUMBER_WORDS: Record<number, string> = {
  1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
  6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
  11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen',
  16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen', 20: 'Twenty',
};

const NUMBERS: NumberData[] = Array.from({ length: 20 }, (_, i) => ({
  num: i + 1,
  emoji: COUNTING_EMOJIS[i],
  word: NUMBER_WORDS[i + 1],
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

interface StoredProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  ageGroup: string;
  screenTimeLimit: number;
}

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

function getPracticedNumbers(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(NUMBERS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

function savePracticedNumbers(numbers: Set<number>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NUMBERS_KEY, JSON.stringify(Array.from(numbers)));

    // Also update global learn-progress
    const raw = localStorage.getItem(PROGRESS_KEY);
    const global = raw ? JSON.parse(raw) : {};
    global['numbers'] = { completed: numbers.size, practiced: Array.from(numbers) };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(global));
  } catch {
    // Silent
  }
}

function speakNumber(n: number) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(NUMBER_WORDS[n]);
  utterance.rate = 0.8;
  utterance.pitch = 1.2;
  window.speechSynthesis.speak(utterance);
}

/* ------------------------------------------------------------------ */
/*  Confetti Component                                                  */
/* ------------------------------------------------------------------ */

function Confetti() {
  const particles = useMemo(() => {
    const colors = ['#FF6B6B', '#FFD93D', '#7ED957', '#60B5FF', '#C4B5FD', '#F472B6', '#6EE7B7', '#FBBF7A'];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 10,
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
            x: [0, (Math.random() - 0.5) * 120],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const numberEntry = {
  initial: { opacity: 0, scale: 0.3, rotate: -10 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

const emojiPop = {
  initial: { scale: 0, opacity: 0 },
  animate: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 15, delay: 0.3 + i * 0.06 },
  }),
  exit: { scale: 0, opacity: 0, transition: { duration: 0.15 } },
};

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function NumbersPage() {
  const router = useRouter();
  const { play: playPop } = useAudio({ frequency: 600, type: 'triangle' });
  const { play: playSuccess } = useAudio({ frequency: 1200, type: 'sine', duration: 300 });
  const { play: playTap } = useAudio({ frequency: 880, type: 'sine', duration: 100 });
  const { play: playRemove } = useAudio({ frequency: 330, type: 'triangle', duration: 100 });

  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [practicedSet, setPracticedSet] = useState<Set<number>>(new Set());
  const [count, setCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasSeenCelebration, setHasSeenCelebration] = useState(false);

  /* ---- Load from localStorage ---- */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      setProfile(getStoredProfile());
      setPracticedSet(getPracticedNumbers());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---- Age config ---- */
  const ageConfig = useAgeGroup(profile?.age ?? 5);
  const isToddler = ageConfig.ageGroup === 'toddler';
  const isKid = ageConfig.ageGroup === 'kid';

  /* ---- Adaptive sizing ---- */
  const selectorNumSize = isToddler ? 'text-xl sm:text-2xl' : isKid ? 'text-base sm:text-lg' : 'text-lg sm:text-xl';
  const displayNumSize = isToddler ? 'text-[100px] sm:text-[140px]' : isKid ? 'text-[72px] sm:text-[96px]' : 'text-[88px] sm:text-[120px]';
  const buttonSize = isToddler ? ('toddler' as const) : isKid ? ('kid' as const) : ('early' as const);
  const selectorItemSize = isToddler ? 'min-w-[52px] min-h-[52px] sm:min-w-[60px] sm:min-h-[60px]' : 'min-w-[42px] min-h-[42px] sm:min-w-[48px] sm:min-h-[48px]';

  /* ---- Derived state ---- */
  const currentNumber = NUMBERS[selectedIdx];
  const targetNum = currentNumber.num;
  const practicedCount = practicedSet.size;
  const allDone = practicedCount >= 20;
  const isCorrect = count === targetNum;
  const hasExceeded = count > targetNum;

  /* ---- Mark a number as practiced ---- */
  const markPracticed = useCallback(
    (num: number) => {
      setPracticedSet((prev) => {
        if (prev.has(num)) return prev;
        const next = new Set(prev);
        next.add(num);
        savePracticedNumbers(next);
        return next;
      });
    },
    [],
  );

  /* ---- Celebration check ---- */
  useEffect(() => {
    if (allDone && mounted && !hasSeenCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(true);
        setHasSeenCelebration(true);
        playSuccess();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [allDone, mounted, hasSeenCelebration, playSuccess]);

  /* ---- Handlers ---- */
  const handleSelectNumber = useCallback(
    (idx: number) => {
      playPop();
      setSelectedIdx(idx);
      setCount(0);
    },
    [playPop],
  );

  const handleAdd = useCallback(() => {
    if (count < targetNum) {
      const newCount = count + 1;
      playTap();
      setCount(newCount);
      if (newCount === targetNum) {
        playSuccess();
        markPracticed(targetNum);
      }
    }
  }, [count, targetNum, playTap, playSuccess, markPracticed]);

  const handleRemove = useCallback(() => {
    if (count > 0) {
      playRemove();
      setCount((prev) => prev - 1);
    }
  }, [count, playRemove]);

  const handleGoBack = useCallback(() => {
    playPop();
    router.push('/learn');
  }, [playPop, router]);

  const handleHearNumber = useCallback(() => {
    playPop();
    speakNumber(currentNumber.num);
  }, [playPop, currentNumber]);

  const handleCloseCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  const handleRestart = useCallback(() => {
    setPracticedSet(new Set());
    savePracticedNumbers(new Set());
    setHasSeenCelebration(false);
    setShowCelebration(false);
    setCount(0);
  }, []);

  /* ---- Loading state ---- */
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
            🔢
          </motion.span>
          <p className="font-nunito text-lg font-bold text-kids-dark">Loading...</p>
        </motion.div>
      </div>
    );
  }

  /* ---- No profile state ---- */
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kids-offwhite px-4">
        <KidsCard
          variant="elevated"
          color="sun"
          padding="xl"
          className="max-w-sm sm:max-w-md text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🔢
          </motion.div>
          <h2 className="text-2xl font-nunito font-bold text-kids-dark mb-2">
            Who&apos;s Learning?
          </h2>
          <p className="text-sm text-kids-text-secondary mb-6">
            Please select a profile first!
          </p>
          <KidsButton variant="primary" size="early" onClick={() => router.push('/kids')}>
            Choose a Profile
          </KidsButton>
        </KidsCard>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-kids-offwhite flex flex-col">
      {/* Confetti */}
      {showCelebration && <Confetti />}

      {/* ---- Top Header ---- */}
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
            <KidsBadge variant="sky" size="sm" icon={<span aria-hidden="true">🔢</span>}>
              {practicedCount}/20
            </KidsBadge>
            <motion.span className="text-2xl" aria-hidden="true">
              {profile.avatar}
            </motion.span>
          </div>
        </div>
      </header>

      {/* ---- Main Content ---- */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-6 flex flex-col gap-5">

        {/* ---- Number Selector Grid ---- */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Select a number"
        >
          {NUMBERS.map((item, idx) => {
            const isPracticed = practicedSet.has(item.num);
            const isActive = idx === selectedIdx;

            return (
              <motion.button
                key={item.num}
                type="button"
                role="tab"
                aria-selected={isActive}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleSelectNumber(idx)}
                className={cn(
                  'flex items-center justify-center rounded-xl border-2 font-nunito font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky',
                  selectorNumSize,
                  selectorItemSize,
                  isActive
                    ? 'bg-kids-sky text-white border-kids-sky shadow-kids'
                    : isPracticed
                      ? 'bg-kids-grass/15 text-kids-grass border-kids-grass/40'
                      : 'bg-white text-kids-dark border-kids-lightgray hover:border-kids-sky/40',
                )}
              >
                {item.num}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ---- Progress bar ---- */}
        <KidsProgressBar
          value={practicedCount}
          min={0}
          max={20}
          size="sm"
          color="rainbow"
          showLabel
          label="Numbers Practiced"
        />

        {/* ---- Number Display + Counting ---- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNumber.num}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center gap-4"
          >
            {/* Number display card */}
            <KidsCard
              variant="elevated"
              color={isCorrect ? 'grass' : 'white'}
              padding="xl"
              className={cn(
                'w-full text-center relative overflow-hidden transition-colors duration-300',
                isCorrect && 'ring-4 ring-kids-grass/40',
              )}
            >
              {/* Decorative background */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
                <div className="absolute top-3 left-3 text-3xl rotate-[-15deg]">{currentNumber.emoji}</div>
                <div className="absolute bottom-3 right-3 text-3xl rotate-[15deg]">{currentNumber.emoji}</div>
              </div>

              {/* The big number */}
              <motion.div
                className={cn('font-nunito font-extrabold leading-none select-none text-kids-sky', displayNumSize)}
                variants={numberEntry}
                initial="initial"
                animate="animate"
              >
                {currentNumber.num}
              </motion.div>

              {/* Word */}
              <motion.div
                className="mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-xl sm:text-2xl font-nunito font-extrabold text-kids-dark">
                  {currentNumber.word}
                </p>
              </motion.div>

              {/* Hear it button */}
              <motion.div
                className="mt-4 flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <KidsButton
                  variant="primary"
                  size={buttonSize}
                  onClick={handleHearNumber}
                  leftIcon={<Volume2 className="size-5" aria-hidden="true" />}
                >
                  {isToddler ? '🔊 Hear It' : 'Hear Number'}
                </KidsButton>
              </motion.div>

              {/* Correct feedback */}
              <AnimatePresence>
                {isCorrect && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="mt-3"
                  >
                    <KidsBadge variant="success" size="md">
                      🎉 Correct! That&apos;s {currentNumber.word}!
                    </KidsBadge>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Over-count feedback */}
              <AnimatePresence>
                {hasExceeded && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="mt-3"
                  >
                    <KidsBadge variant="danger" size="md">
                      Oops! That&apos;s more than {currentNumber.word}. Try removing some!
                    </KidsBadge>
                  </motion.div>
                )}
              </AnimatePresence>
            </KidsCard>

            {/* ---- Counting Practice ---- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full"
            >
              <KidsCard variant="elevated" color="sky" padding="lg" className="text-center">
                <h3 className="text-base sm:text-lg font-nunito font-bold text-kids-dark mb-1 flex items-center justify-center gap-2">
                  <span>👆</span>
                  Count to {currentNumber.word}
                </h3>
                <p className="text-xs text-kids-text-secondary mb-4">
                  Tap the {isToddler ? 'big' : ''} buttons to add or remove items!
                </p>

                {/* Emoji display area */}
                <div className="min-h-[80px] sm:min-h-[100px] flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 mb-5 px-2 py-3 rounded-2xl bg-white/60 border border-white">
                  <AnimatePresence mode="popLayout">
                    {Array.from({ length: count }, (_, i) => (
                      <motion.span
                        key={i}
                        custom={i}
                        variants={emojiPop}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={cn(
                          'inline-block',
                          targetNum <= 5 ? 'text-4xl sm:text-5xl' :
                          targetNum <= 10 ? 'text-3xl sm:text-4xl' :
                          targetNum <= 15 ? 'text-2xl sm:text-3xl' :
                          'text-xl sm:text-2xl',
                        )}
                        aria-hidden="true"
                      >
                        {currentNumber.emoji}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  {count === 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-kids-text-secondary font-nunito"
                    >
                      Tap + to start counting!
                    </motion.p>
                  )}
                </div>

                {/* Count display */}
                <div className="flex items-center justify-center gap-1 mb-4">
                  <span className="text-3xl sm:text-4xl font-nunito font-black text-kids-dark">
                    {count}
                  </span>
                  <span className="text-lg text-kids-text-secondary font-nunito">
                    / {targetNum}
                  </span>
                </div>

                {/* Add / Remove buttons */}
                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  <KidsButton
                    variant="outline"
                    size={buttonSize}
                    onClick={handleRemove}
                    disabled={count === 0}
                    leftIcon={<Minus className="size-5" />}
                  >
                    {isToddler ? 'Less' : 'Remove'}
                  </KidsButton>
                  <KidsButton
                    variant={isCorrect ? 'success' : 'primary'}
                    size={buttonSize}
                    onClick={handleAdd}
                    disabled={count >= targetNum}
                    leftIcon={<Plus className="size-5" />}
                  >
                    {isToddler ? 'More!' : count >= targetNum ? '✓ Done!' : 'Add'}
                  </KidsButton>
                </div>

                {/* Practiced indicator */}
                {practicedSet.has(currentNumber.num) && !isCorrect && (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <KidsBadge variant="muted" size="sm">
                      ✓ Previously practiced
                    </KidsBadge>
                  </motion.div>
                )}
              </KidsCard>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ---- Celebration Modal ---- */}
      <KidsModal
        isOpen={showCelebration}
        onClose={handleCloseCelebration}
        title="🎉 Number Master!"
        description="You've practiced all 20 numbers! Incredible!"
        size="md"
        showCloseButton
        footer={
          <>
            <KidsButton
              variant="outline"
              onClick={handleRestart}
              leftIcon={<RotateCcw className="size-4" aria-hidden="true" />}
            >
              Start Over
            </KidsButton>
            <KidsButton
              variant="rainbow"
              onClick={() => {
                handleCloseCelebration();
                router.push('/learn');
              }}
              leftIcon={<PartyPopper className="size-4" aria-hidden="true" />}
            >
              More Learning!
            </KidsButton>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <motion.span
            className="text-7xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            🏆
          </motion.span>
          <div className="text-center">
            <p className="text-2xl font-nunito font-bold text-kids-dark mb-1">
              {practicedCount} / 20 Numbers
            </p>
            <p className="text-sm text-kids-text-secondary">
              You counted all the way to 20!
            </p>
          </div>
          {/* Show all numbers completed */}
          <div className="flex flex-wrap justify-center gap-1 max-w-xs">
            {NUMBERS.map((n) => (
              <span
                key={n.num}
                className="text-base font-nunito font-bold text-kids-grass px-1"
                aria-hidden="true"
              >
                {n.num}
              </span>
            ))}
          </div>
        </div>
      </KidsModal>
    </div>
  );
}
