'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KidsButton } from '@/components/kids/kids-button';
import { StarBadge } from '@/components/kids/star-badge';
import { useAudio } from '@/hooks/use-audio';
import { formatGameTime } from '@/types/games';

interface GameResultsProps {
  stars: 0 | 1 | 2 | 3;
  score: number;
  duration: number;
  moves?: number;
  gameTitle: string;
  gameIcon: string;
  onPlayAgain: () => void;
  onBack: () => void;
  isOpen: boolean;
}

const CELEBRATION_EMOJIS = ['🎉', '⭐', '🌟', '🏆', '🎊', '✨', '💫', '🎆'];

/**
 * GameResults — Shared results overlay shown after completing any game.
 * Displays stars, score, time, and options to replay or go back.
 */
export default function GameResults({
  stars,
  score,
  duration,
  moves,
  gameTitle,
  gameIcon,
  onPlayAgain,
  onBack,
  isOpen,
}: GameResultsProps) {
  const { play: playBadge } = useAudio({ frequency: 1000, type: 'sine', duration: 300 });

  React.useEffect(() => {
    if (isOpen && stars >= 2) {
      const timer = setTimeout(() => playBadge(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, stars, playBadge]);

  // Generate random confetti particles
  const confetti = React.useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      emoji: CELEBRATION_EMOJIS[i % CELEBRATION_EMOJIS.length],
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1,
      rotation: Math.random() * 360,
    }));
  }, []);

  const getMessage = () => {
    if (stars === 3) return 'Amazing!';
    if (stars === 2) return 'Great Job!';
    if (stars === 1) return 'Good Try!';
    return 'Keep Practicing!';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onBack}
          />

          {/* Confetti */}
          {stars >= 2 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {confetti.map((particle) => (
                <motion.span
                  key={particle.id}
                  className="absolute text-2xl sm:text-3xl"
                  style={{ left: `${particle.x}%`, top: '-10%' }}
                  initial={{ y: -20, opacity: 1, rotate: 0 }}
                  animate={{
                    y: [0, 200, 400, 600, 800],
                    opacity: [1, 1, 0.8, 0.3, 0],
                    rotate: particle.rotation,
                  }}
                  transition={{
                    duration: particle.duration,
                    delay: particle.delay,
                    ease: 'easeIn',
                  }}
                >
                  {particle.emoji}
                </motion.span>
              ))}
            </div>
          )}

          {/* Results Card */}
          <motion.div
            className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-kids-lg sm:p-8"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Game icon + title */}
            <motion.div
              className="mb-4 text-center"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-4xl sm:text-5xl">{gameIcon}</span>
              <h2 className="mt-2 text-xl font-nunito font-extrabold text-kids-dark sm:text-2xl">
                {gameTitle}
              </h2>
            </motion.div>

            {/* Message */}
            <motion.p
              className="mb-2 text-center text-lg font-nunito font-bold text-kids-sky"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3, stiffness: 400, damping: 15 }}
            >
              {getMessage()}
            </motion.p>

            {/* Stars */}
            <motion.div
              className="my-4 flex justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <StarBadge count={stars} />
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mb-6 grid grid-cols-2 gap-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="rounded-2xl bg-kids-sky/10 p-3 text-center">
                <p className="text-xs font-nunito font-bold text-kids-text-secondary">Score</p>
                <p className="text-2xl font-nunito font-extrabold text-kids-sky">{score}</p>
              </div>
              <div className="rounded-2xl bg-kids-grass/10 p-3 text-center">
                <p className="text-xs font-nunito font-bold text-kids-text-secondary">Time</p>
                <p className="text-2xl font-nunito font-extrabold text-kids-grass">
                  {formatGameTime(duration)}
                </p>
              </div>
              {moves !== undefined && (
                <div className="col-span-2 rounded-2xl bg-kids-sun/10 p-3 text-center">
                  <p className="text-xs font-nunito font-bold text-kids-text-secondary">Moves</p>
                  <p className="text-2xl font-nunito font-extrabold text-kids-sun">{moves}</p>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex gap-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <KidsButton
                variant="outline"
                onClick={onBack}
                className="flex-1"
                size="early"
              >
                Back to Games
              </KidsButton>
              <KidsButton
                variant="success"
                onClick={onPlayAgain}
                className="flex-1"
                size="early"
              >
                Play Again
              </KidsButton>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
