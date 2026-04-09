'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useChildProfile } from '@/app/kids/[profileId]/layout';
import { useAgeGroup } from '@/hooks/use-age-group';
import { useAudio } from '@/hooks/use-audio';
import { KidsButton } from '@/components/kids/kids-button';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsBadge } from '@/components/kids/kids-badge';
import { cn } from '@/lib/utils';
import { PUZZLE_SCENES, calculateStars, formatGameTime } from '@/types/games';
import type { GameDifficulty } from '@/types/games';
import GameResults from '@/components/kids/game-results';

// ─── Types ───────────────────────────────────────────────────────────────

interface PuzzlePiece {
  index: number;       // Original position in scene
  emoji: string;
  isPlaced: boolean;
}

type GamePhase = 'select' | 'playing' | 'completed';

// ─── Helpers ─────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getGridSize(age: number): { size: 2 | 3; total: number } {
  return age <= 7 ? { size: 2, total: 4 } : { size: 3, total: 9 };
}

// ─── Component ───────────────────────────────────────────────────────────

export default function PuzzleGame() {
  const { profile } = useChildProfile();
  const router = useRouter();
  const config = useAgeGroup(profile?.age ?? 5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audioPlace = useAudio({ frequency: 1000, type: 'sine', duration: 150 });
  const audioWrong = useAudio({ frequency: 300, type: 'square', duration: 150 });
  const audioComplete = useAudio({ frequency: 1200, type: 'sine', duration: 400 });

  const [phase, setPhase] = useState<GamePhase>('select');
  const [selectedScene, setSelectedScene] = useState<typeof PUZZLE_SCENES[number] | null>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [gridSize, setGridSize] = useState<2 | 3>(2);
  const [placedPieces, setPlacedPieces] = useState<(string | null)[]>([]);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [stars, setStars] = useState<0 | 1 | 2 | 3>(0);
  const [showResults, setShowResults] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);

  const { size: gridSizeNum, total: totalPieces } = profile
    ? getGridSize(profile.age)
    : { size: 2 as const, total: 4 };

  // Start game with selected scene
  const startPuzzle = useCallback(
    (sceneIdx: number) => {
      const scene = PUZZLE_SCENES[sceneIdx];
      const grid = gridSizeNum;
      const count = grid * grid;

      setSelectedScene(scene);
      setGridSize(grid);

      // Create pieces from scene (only take needed count)
      const scenePieces: PuzzlePiece[] = scene.pieces
        .slice(0, count)
        .map((emoji, idx) => ({
          index: idx,
          emoji,
          isPlaced: false,
        }));

      setPieces(shuffleArray(scenePieces));
      setPlacedPieces(Array(count).fill(null));
      setWrongTaps(0);
      setScore(0);
      setElapsed(0);
      setStars(0);
      setShowResults(false);
      setShakeWrong(false);
      setPhase('playing');

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    },
    [gridSizeNum],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Extract stable values for callbacks
  const profileId = profile?.id;

  // Save score
  const savePuzzleScore = useCallback(() => {
    if (!profileId) return;
    const record = {
      id: `local-${Date.now()}`,
      childId: profileId,
      gameType: 'puzzle' as const,
      score,
      level: gridSize,
      duration: elapsed,
      completedAt: new Date().toISOString(),
    };
    try {
      const key = `kv-game-scores-${profileId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      if (!existing.puzzle || score > (existing.puzzle?.score ?? 0)) {
        existing.puzzle = record;
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch { /* ignore */ }
    fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId: profileId, gameType: 'puzzle', score, level: gridSize, duration: elapsed }),
    }).catch(() => {});
  }, [profileId, score, gridSize, elapsed]);

  // Handle piece tap
  const handlePieceTap = useCallback(
    (pieceIndex: number) => {
      if (phase !== 'playing') return;

      const piece = pieces.find((p) => p.index === pieceIndex);
      if (!piece || piece.isPlaced) return;

      const nextSlot = pieces.filter((p) => p.isPlaced).length;
      if (pieceIndex === nextSlot) {
        // Correct!
        audioPlace.play();
        const placementScore = 100 + Math.max(0, Math.floor((200 - elapsed) / 5));
        setScore((prev) => prev + placementScore);
        setPieces((prev) =>
          prev.map((p) => (p.index === pieceIndex ? { ...p, isPlaced: true } : p)),
        );
        setPlacedPieces((prev) => {
          const next = [...prev];
          next[pieceIndex] = piece.emoji;
          return next;
        });

        const allPlacedCount = pieces.filter((p) => p.isPlaced).length + 1;
        if (allPlacedCount === totalPieces) {
          setTimeout(() => {
            if (timerRef.current) clearInterval(timerRef.current);
            audioComplete.play();
            const earnedStars = calculateStars(totalPieces, totalPieces, wrongTaps);
            setStars(earnedStars);
            setPhase('completed');
            setTimeout(() => setShowResults(true), 600);
            savePuzzleScore();
          }, 300);
        }
      } else {
        audioWrong.play();
        setWrongTaps((prev) => prev + 1);
        setShakeWrong(true);
        setTimeout(() => setShakeWrong(false), 400);
      }
    },
    [phase, pieces, elapsed, totalPieces, wrongTaps, audioPlace, audioWrong, audioComplete, savePuzzleScore],
  );

  // Age check
  if (profile && profile.age <= 4) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <motion.span
          className="text-7xl"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🧩
        </motion.span>
        <motion.h2
          className="text-2xl font-nunito font-extrabold text-kids-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          For Bigger Kids!
        </motion.h2>
        <motion.p
          className="text-center text-kids-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          This game is for kids age 5 and up.
          <br />
          Try Memory Match or Math Challenge instead!
        </motion.p>
        <KidsButton variant="primary" onClick={() => router.push(`/kids/${profile.id}/play`)} size="early">
          Back to Games
        </KidsButton>
      </div>
    );
  }

  // Scene Selection
  if (phase === 'select') {
    return (
      <div className="flex flex-col gap-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-5xl">🧩</span>
          <h1 className="mt-2 text-3xl font-nunito font-extrabold text-kids-dark">
            Puzzle Builder
          </h1>
          <p className="mt-1 text-kids-text-secondary">
            Choose a scene to build!
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PUZZLE_SCENES.map((scene, idx) => (
            <KidsCard
              key={scene.id}
              variant="interactive"
              color="lavender"
              padding="md"
              onClick={() => startPuzzle(idx)}
              delay={idx * 0.08}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <span className={config?.iconSize ?? 'text-4xl'}>{scene.emoji}</span>
                {config?.showTextLabels && (
                  <h3 className={`font-nunito font-bold text-kids-dark ${config?.fontSize}`}>
                    {scene.title}
                  </h3>
                )}
              </div>
            </KidsCard>
          ))}
        </div>

        <div className="flex justify-center">
          <KidsButton variant="outline" onClick={() => router.back()} size="early">
            Back to Games
          </KidsButton>
        </div>
      </div>
    );
  }

  // Puzzle Grid
  return (
    <div className="flex flex-col gap-4">
      {/* HUD */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-kids">
        <div className="flex items-center gap-2">
          <KidsBadge variant="default" size="sm">{selectedScene?.emoji}</KidsBadge>
          <span className="text-sm font-nunito font-bold text-kids-dark">
            {placedPieces.filter(Boolean).length}/{totalPieces}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <KidsBadge variant="gold" size="sm">⭐ {score}</KidsBadge>
          <KidsBadge variant="default" size="sm">⏱ {formatGameTime(elapsed)}</KidsBadge>
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 overflow-hidden rounded-full bg-kids-lightgray">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-kids-lavender to-kids-purple"
          animate={{ width: `${(placedPieces.filter(Boolean).length / totalPieces) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Target Grid */}
      <div className="flex justify-center">
        <div
          className="grid gap-2 rounded-2xl border-2 border-dashed border-kids-lavender/50 bg-kids-lavender/5 p-3 sm:gap-3"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            width: gridSize === 2 ? '200px' : '280px',
            height: gridSize === 2 ? '200px' : '280px',
          }}
        >
          {placedPieces.map((emoji, idx) => (
            <motion.div
              key={idx}
              className={cn(
                'flex items-center justify-center rounded-xl border-2 border-dashed',
                emoji
                  ? 'border-kids-grass bg-kids-grass/10'
                  : 'border-kids-lightgray bg-white',
              )}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {emoji ? (
                <motion.span
                  className="text-2xl sm:text-3xl"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  {emoji}
                </motion.span>
              ) : (
                <span className="text-lg text-kids-text-secondary/30 font-nunito font-bold">
                  {idx + 1}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Instruction */}
      <p className="text-center text-sm font-nunito font-bold text-kids-text-secondary">
        Tap the pieces in order (left to right, top to bottom)
      </p>

      {/* Available Pieces */}
      <motion.div
        className={cn(
          'grid gap-2 sm:gap-3',
          shakeWrong && 'animate-[shake_0.4s_ease-in-out]',
        )}
        style={{
          gridTemplateColumns: `repeat(${gridSize <= 2 ? 2 : 3}, 1fr)`,
        }}
      >
        {pieces.map((piece) => {
          if (piece.isPlaced) return null;
          return (
            <motion.button
              key={piece.index}
              className="flex aspect-square items-center justify-center rounded-2xl bg-white border-2 border-kids-lavender/30 shadow-kids cursor-pointer transition-colors hover:border-kids-lavender hover:bg-kids-lavender/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-lavender"
              onClick={() => handlePieceTap(piece.index)}
              whileTap={{ scale: 0.9 }}
              animate={
                shakeWrong
                  ? { x: [-3, 3, -3, 3, 0] }
                  : {}
              }
              transition={{ duration: 0.4 }}
            >
              <span className="text-2xl sm:text-3xl">{piece.emoji}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Game Results */}
      <GameResults
        isOpen={showResults}
        stars={stars}
        score={score}
        duration={elapsed}
        moves={wrongTaps}
        gameTitle={`Puzzle: ${selectedScene?.title ?? ''}`}
        gameIcon="🧩"
        onPlayAgain={() => setPhase('select')}
        onBack={() => router.push(`/kids/${profile?.id}/play`)}
      />
    </div>
  );
}
