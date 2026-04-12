// Memory Match Game — with Difficulty Selection
// Flow: Start Screen → Difficulty Selection → Game Play → Results Screen

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsButton } from '@/components/kids/kids-button';
import { KidsBadge } from '@/components/kids/kids-badge';
import { KidsProgressBar } from '@/components/kids/kids-progress-bar';
import { useAudio } from '@/hooks/use-audio';
import GameResults from '@/components/kids/game-results';
import { cn } from '@/lib/utils';
import { formatGameTime, calculateStars } from '@/types/games';

// ─── Types ───────────────────────────────────────────────────────────────

interface StoredProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  ageGroup: string;
  screenTimeLimit: number;
}

interface Card {
  id: number;
  emoji: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

type DifficultyLevel = 'easy' | 'medium' | 'hard';
type GamePhase = 'menu' | 'playing' | 'checking' | 'completed';

interface DifficultyConfig {
  level: DifficultyLevel;
  label: string;
  cols: number;
  rows: number;
  pairs: number;
  emojis: string[];
  color: 'sky' | 'sun' | 'coral';
  description: string;
  recommended: string;
  stars: number;
}

// ─── Constants ───────────────────────────────────────────────────────────

const STORAGE_KEY = 'kv-active-profile';

const DEFAULT_PROFILE: StoredProfile = {
  id: 'guest',
  name: 'Friend',
  age: 5,
  avatar: '🌟',
  ageGroup: 'early',
  screenTimeLimit: 60,
};

const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    level: 'easy',
    label: 'Easy',
    cols: 4,
    rows: 3,
    pairs: 6,
    emojis: ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠'],
    color: 'sky',
    description: '6 pairs to find',
    recommended: 'Great for toddlers',
    stars: 1,
  },
  medium: {
    level: 'medium',
    label: 'Medium',
    cols: 4,
    rows: 4,
    pairs: 8,
    emojis: ['🐶', '🐱', '🐻', '🦊', '🐰', '🐼', '🐨', '🦁'],
    color: 'sun',
    description: '8 pairs to find',
    recommended: 'Perfect for early learners',
    stars: 2,
  },
  hard: {
    level: 'hard',
    label: 'Hard',
    cols: 5,
    rows: 4,
    pairs: 10,
    emojis: ['🦄', '🐲', '🦋', '🐬', '🦜', '🐙', '🦈', '🦒', '🐘', '🦉'],
    color: 'coral',
    description: '10 pairs to find',
    recommended: 'A challenge for big kids',
    stars: 3,
  },
};

const FLOATING_EMOJIS = ['🃏', '🧠', '⭐', '🎮', '🎯', '💎', '🌈', '✨'];
const CARD_BACK_COLORS = [
  'from-kids-sky to-kids-blue',
  'from-kids-grass to-kids-green',
  'from-kids-coral to-kids-pink',
  'from-kids-lavender to-kids-purple',
  'from-kids-sun to-kids-amber',
];

// ─── Helpers ─────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createCards(config: DifficultyConfig): Card[] {
  const emojis = shuffleArray([...config.emojis]);
  const cards: Card[] = [];

  emojis.forEach((emoji, idx) => {
    cards.push({ id: idx * 2, emoji, pairId: idx, isFlipped: false, isMatched: false });
    cards.push({ id: idx * 2 + 1, emoji, pairId: idx, isFlipped: false, isMatched: false });
  });

  return shuffleArray(cards);
}

function getDefaultDifficulty(profile: StoredProfile): DifficultyLevel {
  const ageGroup = profile?.ageGroup?.toLowerCase();
  if (ageGroup === 'toddler' || profile.age <= 4) return 'easy';
  if (ageGroup === 'early' || (profile.age >= 5 && profile.age <= 7)) return 'medium';
  if (ageGroup === 'kid' || profile.age >= 8) return 'hard';
  return 'medium';
}

function getRecommendedAgeRange(level: DifficultyLevel): string {
  switch (level) {
    case 'easy': return 'Ages 3–4';
    case 'medium': return 'Ages 5–7';
    case 'hard': return 'Ages 8+';
  }
}

// ─── Animation Variants ──────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// ─── Start Screen Component ──────────────────────────────────────────────

function StartScreen({
  profile,
  recommendedDifficulty,
  onSelectDifficulty,
  onBack,
}: {
  profile: StoredProfile;
  recommendedDifficulty: DifficultyLevel;
  onSelectDifficulty: (level: DifficultyLevel) => void;
  onBack: () => void;
}) {
  const { play: playSelect } = useAudio({ frequency: 700, type: 'triangle', duration: 120 });

  // Floating emoji particles
  const floatingEmojis = React.useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        emoji: FLOATING_EMOJIS[i % FLOATING_EMOJIS.length],
        x: 5 + Math.random() * 90,
        y: 10 + Math.random() * 80,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
        size: 24 + Math.random() * 20,
      })),
    [],
  );

  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard'];

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4 py-8">
      {/* Floating background emojis */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {floatingEmojis.map((item) => (
          <motion.span
            key={item.id}
            className="absolute select-none opacity-20"
            style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: item.size }}
            animate={{ y: [0, -12, 0], rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              delay: item.delay,
              ease: 'easeInOut',
            }}
          >
            {item.emoji}
          </motion.span>
        ))}
      </div>

      {/* Header */}
      <motion.div
        className="relative flex flex-col items-center gap-3 text-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <motion.span
          className="text-7xl sm:text-8xl"
          animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          🧠
        </motion.span>
        <h1 className="text-3xl font-nunito font-extrabold text-kids-dark sm:text-4xl">
          Memory Match
        </h1>
        <p className="text-sm text-kids-text-secondary sm:text-base">
          Find all the matching pairs, {profile.name}!
        </p>
      </motion.div>

      {/* Difficulty Selection Label */}
      <motion.div
        className="relative text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xs font-nunito font-bold uppercase tracking-wider text-kids-text-secondary sm:text-sm">
          Choose Your Challenge
        </p>
      </motion.div>

      {/* Difficulty Cards */}
      <motion.div
        className="relative grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {difficulties.map((level, idx) => {
          const config = DIFFICULTY_CONFIGS[level];
          const isRecommended = level === recommendedDifficulty;

          return (
            <motion.div key={level} variants={itemVariants} className="flex justify-center">
              <KidsCard
                variant="interactive"
                color={config.color}
                padding="lg"
                isActive={isRecommended}
                className={cn(
                  'flex w-full max-w-[200px] cursor-pointer flex-col items-center gap-3 text-center sm:w-full',
                )}
                onClick={() => {
                  playSelect();
                  onSelectDifficulty(level);
                }}
              >
                {/* Difficulty label */}
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl">
                    {level === 'easy' ? '😊' : level === 'medium' ? '🤔' : '🔥'}
                  </span>
                  <h2 className="text-lg font-nunito font-extrabold text-kids-dark">
                    {config.label}
                  </h2>
                </div>

                {/* Star rating preview */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 3 }, (_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'text-base',
                        i < config.stars ? 'opacity-100' : 'opacity-25 grayscale',
                      )}
                    >
                      ⭐
                    </span>
                  ))}
                </div>

                {/* Grid preview */}
                <div
                  className="mx-auto grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(config.cols, 4)}, 1fr)`,
                    maxWidth: config.level === 'hard' ? '72px' : config.level === 'medium' ? '64px' : '64px',
                  }}
                >
                  {Array.from({ length: config.level === 'hard' ? 8 : config.level === 'medium' ? 8 : 6 }, (_, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        'aspect-square rounded-md',
                        i % 2 === 0
                          ? 'bg-gradient-to-br from-kids-sky/60 to-kids-blue/60'
                          : 'bg-gradient-to-br from-kids-lavender/60 to-kids-purple/60',
                      )}
                      animate={
                        isRecommended
                          ? { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>

                {/* Info */}
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs font-nunito font-bold text-kids-dark">
                    {config.description}
                  </p>
                  <p className="text-[10px] text-kids-text-secondary">
                    {getRecommendedAgeRange(level)}
                  </p>
                </div>

                {/* Recommended badge */}
                {isRecommended && (
                  <KidsBadge variant="purple" size="sm" icon="✨">
                    Recommended
                  </KidsBadge>
                )}
              </KidsCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <KidsButton variant="ghost" onClick={onBack} size="kid" leftIcon={<ArrowLeft className="size-4" />}>
          Back to Games
        </KidsButton>
      </motion.div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export default function MemoryGame() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Audio effects
  const audioFlip = useAudio({ frequency: 600, type: 'triangle', duration: 100 });
  const audioMatch = useAudio({ frequency: 1200, type: 'sine', duration: 200 });
  const audioMismatch = useAudio({ frequency: 300, type: 'square', duration: 150 });
  const audioWin = useAudio({ frequency: 1000, type: 'sine', duration: 300 });

  // Profile state
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  // Game state
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [config, setConfig] = useState<DifficultyConfig>(DIFFICULTY_CONFIGS.medium);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [stars, setStars] = useState<0 | 1 | 2 | 3>(0);
  const [showResults, setShowResults] = useState(false);
  const [mismatchPair, setMismatchPair] = useState<number[]>([]);

  // Load profile from localStorage
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredProfile;
          setProfile(parsed);
          setDifficulty(getDefaultDifficulty(parsed));
          setConfig(DIFFICULTY_CONFIGS[getDefaultDifficulty(parsed)]);
        }
      } catch {
        // ignore
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const activeProfile = profile || DEFAULT_PROFILE;

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Stop timer helper
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start game with chosen difficulty
  const handleSelectDifficulty = useCallback(
    (level: DifficultyLevel) => {
      const cfg = DIFFICULTY_CONFIGS[level];
      setDifficulty(level);
      setConfig(cfg);

      const newCards = createCards(cfg);
      setCards(newCards);
      setFlipped([]);
      setMoves(0);
      setMatchedPairs(0);
      setTotalPairs(cfg.pairs);
      setScore(0);
      setElapsed(0);
      setStars(0);
      setShowResults(false);
      setMismatchPair([]);
      setPhase('playing');

      // Start timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    },
    [],
  );

  // Handle card click
  const handleCardClick = useCallback(
    (cardId: number) => {
      if (phase !== 'playing') return;
      if (flipped.length >= 2) return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return;
      if (flipped.includes(cardId)) return;

      audioFlip.play();

      const newFlipped = [...flipped, cardId];
      setFlipped(newFlipped);

      // Flip the card visually
      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)));

      // Check for match when 2 cards are flipped
      if (newFlipped.length === 2) {
        const [firstId, secondId] = newFlipped;
        const firstCard = cards.find((c) => c.id === firstId)!;
        const secondCard = cards.find((c) => c.id === secondId)!;

        setMoves((prev) => prev + 1);

        if (firstCard.pairId === secondCard.pairId) {
          // Match found!
          audioMatch.play();
          const matchScore = 100 + Math.max(0, Math.floor((300 - elapsed) / 5));
          setScore((prev) => prev + matchScore);
          const newMatched = matchedPairs + 1;
          setMatchedPairs(newMatched);
          setFlipped([]);

          // Mark cards as matched with a small delay for visual feedback
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c,
              ),
            );
          }, 400);

          // Check if game is complete
          if (newMatched === totalPairs) {
            stopTimer();
            const minMoves = totalPairs; // Perfect play
            const extraMoves = Math.max(0, moves + 1 - minMoves);
            const earnedStars = calculateStars(newMatched, totalPairs, extraMoves);
            setStars(earnedStars);
            setPhase('completed');

            setTimeout(() => {
              audioWin.play();
              setShowResults(true);
            }, 900);
          }
        } else {
          // No match — shake animation, then flip back
          audioMismatch.play();
          setMismatchPair([firstId, secondId]);
          setPhase('checking');

          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c,
              ),
            );
            setFlipped([]);
            setMismatchPair([]);
            setPhase('playing');
          }, 900);
        }
      }
    },
    [phase, flipped, cards, audioFlip, audioMatch, audioMismatch, audioWin, matchedPairs, totalPairs, moves, elapsed, stopTimer],
  );

  // Play again (back to menu)
  const handlePlayAgain = useCallback(() => {
    setShowResults(false);
    setPhase('menu');
  }, []);

  // Back to games list
  const handleBackToGames = useCallback(() => {
    stopTimer();
    setShowResults(false);
    setPhase('menu');
    router.push('/play');
  }, [router, stopTimer]);

  // Back to menu from game HUD
  const handleBackToMenu = useCallback(() => {
    stopTimer();
    setPhase('menu');
    setFlipped([]);
    setMismatchPair([]);
  }, [stopTimer]);

  // ─── Loading State ────────────────────────────────────────────────────

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
            🃏
          </motion.span>
          <p className="font-nunito text-lg font-bold text-kids-dark">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // ─── Menu / Start Screen ─────────────────────────────────────────────

  if (phase === 'menu') {
    return (
      <div className="min-h-screen bg-kids-offwhite">
        {/* Top bar */}
        <header className="sticky top-0 z-40 w-full">
          <div className="mx-auto max-w-2xl">
            <div className="flex h-14 items-center justify-between rounded-b-2xl bg-white px-4 shadow-kids sm:px-6">
              <button
                type="button"
                onClick={handleBackToGames}
                className="flex items-center gap-2 rounded-2xl px-2 py-1 transition-colors hover:bg-kids-lightgray"
                aria-label="Back"
              >
                <ArrowLeft className="size-5 text-kids-text-secondary" />
              </button>
              <h1 className="font-nunito text-lg font-extrabold text-gradient-rainbow select-none">
                KidsVerse
              </h1>
              <motion.span
                className="text-2xl"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {activeProfile.avatar}
              </motion.span>
            </div>
          </div>
        </header>

        <main>
          <StartScreen
            profile={activeProfile}
            recommendedDifficulty={getDefaultDifficulty(activeProfile)}
            onSelectDifficulty={handleSelectDifficulty}
            onBack={handleBackToGames}
          />
        </main>
      </div>
    );
  }

  // ─── Game Play Screen ────────────────────────────────────────────────

  const cols = config.cols;
  const gridMaxWidth = cols <= 4 ? '360px' : '420px';

  return (
    <div className="min-h-screen bg-kids-offwhite">
      {/* Top bar */}
      <header className="sticky top-0 z-40 w-full">
        <div className="mx-auto max-w-2xl">
          <div className="flex h-14 items-center justify-between rounded-b-2xl bg-white px-4 shadow-kids sm:px-6">
            <button
              type="button"
              onClick={handleBackToMenu}
              className="flex items-center gap-2 rounded-2xl px-2 py-1 transition-colors hover:bg-kids-lightgray"
              aria-label="Back to menu"
            >
              <ArrowLeft className="size-5 text-kids-text-secondary" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <span className="text-sm font-nunito font-bold text-kids-dark">
                {matchedPairs}/{totalPairs}
              </span>
            </div>
            <motion.span
              className="text-2xl"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {activeProfile.avatar}
            </motion.span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-12 pt-4 sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-3">
          {/* HUD Bar */}
          <motion.div
            className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white p-3 shadow-kids"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <KidsBadge
                variant={difficulty === 'easy' ? 'default' : difficulty === 'medium' ? 'gold' : 'danger'}
                size="sm"
              >
                {difficulty === 'easy' ? '😊 Easy' : difficulty === 'medium' ? '🤔 Medium' : '🔥 Hard'}
              </KidsBadge>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <KidsBadge variant="gold" size="sm">
                ⭐ {score}
              </KidsBadge>
              <KidsBadge variant="default" size="sm">
                🎯 {moves}
              </KidsBadge>
              <KidsBadge variant="default" size="sm">
                ⏱ {formatGameTime(elapsed)}
              </KidsBadge>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <KidsProgressBar
              value={matchedPairs}
              max={totalPairs}
              size="md"
              color="sky"
              showLabel
              label="Pairs Found"
              animate
            />
          </motion.div>

          {/* Card Grid */}
          <motion.div
            className="mx-auto grid w-full gap-2 sm:gap-3"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              maxWidth: gridMaxWidth,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {cards.map((card, idx) => {
              const isMismatched = mismatchPair.includes(card.id);
              const backColor = CARD_BACK_COLORS[idx % CARD_BACK_COLORS.length];

              return (
                <motion.button
                  key={card.id}
                  className={cn(
                    'relative aspect-square w-full cursor-pointer rounded-2xl border-3 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky',
                    card.isMatched && 'border-kids-grass',
                    isMismatched && 'border-kids-coral',
                  )}
                  onClick={() => handleCardClick(card.id)}
                  disabled={phase !== 'playing' || card.isFlipped || card.isMatched}
                  whileTap={
                    !card.isFlipped && !card.isMatched && phase === 'playing'
                      ? { scale: 0.95 }
                      : {}
                  }
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.3 }}
                >
                  {/* Card Back */}
                  <AnimatePresence mode="wait">
                    {!card.isFlipped && !card.isMatched ? (
                      <motion.div
                        key="back"
                        className={`absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br ${backColor} shadow-kids`}
                        initial={{ rotateY: 180 }}
                        animate={{ rotateY: 0 }}
                        exit={{ rotateY: -180 }}
                        transition={{ duration: 0.3 }}
                        style={{ perspective: 600 }}
                      >
                        <span className="text-3xl opacity-40 sm:text-4xl">❓</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="front"
                        className={cn(
                          'absolute inset-0 flex items-center justify-center rounded-2xl bg-white shadow-kids',
                          card.isMatched && 'ring-2 ring-kids-grass bg-kids-grass/10',
                          isMismatched && 'ring-2 ring-kids-coral bg-kids-coral/10',
                        )}
                        initial={{ rotateY: 180, scale: 0.8 }}
                        animate={{ rotateY: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        style={{ perspective: 600 }}
                      >
                        <motion.span
                          className={cn('text-3xl sm:text-4xl', cols > 4 && 'text-2xl sm:text-3xl')}
                          animate={
                            isMismatched
                              ? { x: [-4, 4, -4, 4, 0] }
                              : card.isMatched
                                ? { scale: [1, 1.2, 1] }
                                : {}
                          }
                          transition={{ duration: 0.4 }}
                        >
                          {card.emoji}
                        </motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Quick restart button during game */}
          {phase === 'playing' && (
            <motion.div
              className="mt-2 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <KidsButton variant="ghost" size="sm" onClick={handleBackToMenu}>
                Change Difficulty
              </KidsButton>
            </motion.div>
          )}
        </div>
      </main>

      {/* Game Results Overlay */}
      <GameResults
        isOpen={showResults}
        stars={stars}
        score={score}
        duration={elapsed}
        moves={moves}
        gameTitle={`Memory Match — ${config.label}`}
        gameIcon="🧠"
        onPlayAgain={handlePlayAgain}
        onBack={handleBackToGames}
      />
    </div>
  );
}
