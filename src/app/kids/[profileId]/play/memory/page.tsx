'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useChildProfile } from '@/app/kids/[profileId]/layout';
import { useAgeGroup } from '@/hooks/use-age-group';
import { useAudio } from '@/hooks/use-audio';
import { KidsButton } from '@/components/kids/kids-button';
import { KidsBadge } from '@/components/kids/kids-badge';
import { cn } from '@/lib/utils';
import type { GameDifficulty } from '@/types/games';
import { MEMORY_EMOJIS, MEMORY_GRID, calculateStars, formatGameTime } from '@/types/games';
import GameResults from '@/components/kids/game-results';

// ─── Types ───────────────────────────────────────────────────────────────

interface Card {
  id: number;
  emoji: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

type GamePhase = 'idle' | 'playing' | 'checking' | 'completed';

// ─── Helpers ─────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createCards(pairs: number): Card[] {
  const emojis = shuffleArray([...MEMORY_EMOJIS]).slice(0, pairs);
  const cards: Card[] = [];

  emojis.forEach((emoji, idx) => {
    cards.push({ id: idx * 2, emoji, pairId: idx, isFlipped: false, isMatched: false });
    cards.push({ id: idx * 2 + 1, emoji, pairId: idx, isFlipped: false, isMatched: false });
  });

  return shuffleArray(cards);
}

function getDifficultyFromAge(age: number): GameDifficulty {
  if (age <= 4) return 1;
  if (age <= 7) return 2;
  return 3;
}

// ─── Component ───────────────────────────────────────────────────────────

export default function MemoryGame() {
  const { profile } = useChildProfile();
  const router = useRouter();
  const config = useAgeGroup(profile?.age ?? 5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audioFlip = useAudio({ frequency: 600, type: 'triangle', duration: 100 });
  const audioMatch = useAudio({ frequency: 1200, type: 'sine', duration: 200 });
  const audioMismatch = useAudio({ frequency: 300, type: 'square', duration: 150 });

  const [phase, setPhase] = useState<GamePhase>('idle');
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

  const difficulty = profile ? getDifficultyFromAge(profile.age) : 1;
  const gridConfig = MEMORY_GRID[difficulty];
  const cols = gridConfig.cols;
  const minMoves = gridConfig.pairs; // Perfect play = one move per pair

  // Start game
  const startGame = useCallback(() => {
    const newCards = createCards(gridConfig.pairs);
    setCards(newCards);
    setFlipped([]);
    setMoves(0);
    setMatchedPairs(0);
    setTotalPairs(gridConfig.pairs);
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
  }, [gridConfig.pairs]);

  // Extract stable values for callbacks
  const profileId = profile?.id;

  // Save score
  const saveScore = useCallback(
    (finalScore: number) => {
      if (!profileId) return;
      const record = {
        id: `local-${Date.now()}`,
        childId: profileId,
        gameType: 'memory' as const,
        score: finalScore,
        level: difficulty,
        duration: elapsed,
        completedAt: new Date().toISOString(),
      };

      // Save to localStorage
      try {
        const key = `kv-game-scores-${profileId}`;
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        if (!existing.memory || finalScore > (existing.memory?.score ?? 0)) {
          existing.memory = record;
          localStorage.setItem(key, JSON.stringify(existing));
        }
      } catch {
        // ignore
      }

      // Save to API
      fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: profileId,
          gameType: 'memory',
          score: finalScore,
          level: difficulty,
          duration: elapsed,
        }),
      }).catch(() => { /* ignore */ });
    },
    [profileId, difficulty, elapsed],
  );

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

      // Flip the card
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)),
      );

      // Check for match when 2 cards are flipped
      if (newFlipped.length === 2) {
        const [firstId, secondId] = newFlipped;
        const firstCard = cards.find((c) => c.id === firstId)!;
        const secondCard = cards.find((c) => c.id === secondId)!;

        setMoves((prev) => prev + 1);

        if (firstCard.pairId === secondCard.pairId) {
          // Match!
          audioMatch.play();
          const matchScore = 100 + Math.max(0, Math.floor((300 - elapsed) / 5));
          setScore((prev) => prev + matchScore);
          const newMatched = matchedPairs + 1;
          setMatchedPairs(newMatched);
          setFlipped([]);

          // Mark cards as matched
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c,
              ),
            );
          }, 300);

          // Check if game is complete
          if (newMatched === totalPairs) {
            stopTimer();
            const extraMoves = moves + 1 - minMoves;
            const earnedStars = calculateStars(newMatched, totalPairs, Math.max(0, extraMoves));
            setStars(earnedStars);
            setPhase('completed');
            setTimeout(() => setShowResults(true), 800);

            // Save score
            saveScore(matchScore);
          }
        } else {
          // No match — brief shake, then flip back
          audioMismatch.play();
          setMismatchPair([firstId, secondId]);
          setPhase('checking');

          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c,
              ),
            );
            setFlipped([]);
            setMismatchPair([]);
            setPhase('playing');
          }, 800);
        }
      }
    },
    [phase, flipped, cards, audioFlip, audioMatch, audioMismatch, matchedPairs, totalPairs, moves, minMoves, elapsed, stopTimer, saveScore],
  );

  // Start screen
  if (phase === 'idle') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <span className="text-7xl sm:text-8xl">🃏</span>
        </motion.div>
        <motion.h1
          className="text-3xl font-nunito font-extrabold text-kids-dark sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Memory Match
        </motion.h1>
        <motion.p
          className="text-center text-kids-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Find all the matching pairs!
          <br />
          {difficulty === 1 && '3 pairs to find'}
          {difficulty === 2 && '6 pairs to find'}
          {difficulty === 3 && '8 pairs to find'}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          <KidsButton variant="outline" onClick={() => router.back()} size="early">
            Back
          </KidsButton>
          <KidsButton variant="primary" onClick={startGame} size="early">
            Start Game
          </KidsButton>
        </motion.div>
      </div>
    );
  }

  // Card back color patterns
  const cardBackColors = [
    'from-kids-sky to-kids-blue',
    'from-kids-grass to-kids-green',
    'from-kids-coral to-kids-pink',
    'from-kids-lavender to-kids-purple',
    'from-kids-sun to-kids-amber',
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* HUD — responsive layout */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white p-3 shadow-kids">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { stopTimer(); setPhase('idle'); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-kids-lightgray/60 transition-all hover:bg-kids-lightgray active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kids-sky"
            aria-label="Back to menu"
          >
            <ArrowLeft className="size-4 text-kids-dark" />
          </button>
          <KidsBadge variant="default" size="sm">🃏</KidsBadge>
          <span className="text-sm font-nunito font-bold text-kids-dark">
            {matchedPairs}/{totalPairs}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <KidsBadge variant="gold" size="sm">⭐ {score}</KidsBadge>
          <KidsBadge variant="default" size="sm">🎯 {moves}</KidsBadge>
          <KidsBadge variant="default" size="sm">⏱ {formatGameTime(elapsed)}</KidsBadge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-kids-lightgray">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-kids-sky to-kids-grass"
          initial={{ width: '0%' }}
          animate={{ width: `${(matchedPairs / totalPairs) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Card Grid — responsive sizing */}
      <div
        className="mx-auto grid w-full gap-2 sm:gap-3"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: cols <= 3 ? '300px' : '360px',
        }}
      >
        {cards.map((card, idx) => {
          const isMismatched = mismatchPair.includes(card.id);
          const backColor = cardBackColors[idx % cardBackColors.length];

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
                      className={`text-4xl sm:text-5xl ${card.isMatched ? 'opacity-100' : ''}`}
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
      </div>

      {/* Game Results */}
      <GameResults
        isOpen={showResults}
        stars={stars}
        score={score}
        duration={elapsed}
        moves={moves}
        gameTitle="Memory Match"
        gameIcon="🃏"
        onPlayAgain={startGame}
        onBack={() => router.push(`/kids/${profile?.id}/play`)}
      />
    </div>
  );
}
