'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useChildProfile } from '@/app/kids/[profileId]/layout';
import { useAgeGroup } from '@/hooks/use-age-group';
import { useAudio } from '@/hooks/use-audio';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsBadge } from '@/components/kids/kids-badge';
import { Mascot } from '@/components/kids/mascot';
import type { GameType, GameScoreRecord } from '@/types/games';
import { GAMES, getGamesForAgeGroup } from '@/types/games';

// ─── Local Storage Helpers ───────────────────────────────────────────────

function loadScores(profileId: string): Record<GameType, GameScoreRecord | null> {
  if (typeof window === 'undefined') return { memory: null, math: null, puzzle: null, spelling: null };
  try {
    const raw = localStorage.getItem(`kv-game-scores-${profileId}`);
    if (!raw) return { memory: null, math: null, puzzle: null, spelling: null };
    return JSON.parse(raw);
  } catch {
    return { memory: null, math: null, puzzle: null, spelling: null };
  }
}

function saveScores(profileId: string, scores: Record<GameType, GameScoreRecord | null>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`kv-game-scores-${profileId}`, JSON.stringify(scores));
  } catch {
    // Storage full — ignore
  }
}

// ─── Component ───────────────────────────────────────────────────────────

export default function PlayOverview() {
  const { profile } = useChildProfile();
  const router = useRouter();
  const { play: playClick } = useAudio();
  const config = useAgeGroup(profile?.age ?? 5);

  const [scores, setScores] = useState<Record<GameType, GameScoreRecord | null>>({
    memory: null, math: null, puzzle: null, spelling: null,
  });

  // Fetch scores
  useEffect(() => {
    if (!profile?.id) return;

    async function fetchScores() {
      // Try localStorage first for instant display
      const localScores = loadScores(profile.id);
      setScores(localScores);

      // Then fetch from API
      try {
        const res = await fetch(`/api/games?profileId=${encodeURIComponent(profile.id)}`);
        if (res.ok) {
          const data = await res.json();
          const bestScores: Record<GameType, GameScoreRecord | null> = {
            memory: null, math: null, puzzle: null, spelling: null,
          };
          if (data.bestScores) {
            for (const [type, record] of Object.entries(data.bestScores)) {
              bestScores[type as GameType] = record as GameScoreRecord;
            }
          }
          setScores(bestScores);
          saveScores(profile.id, bestScores);
        }
      } catch {
        // API failed — keep localStorage scores
      }
    }

    fetchScores();
  }, [profile?.id]);

  // Filter games by age group
  const availableGames = useMemo(() => {
    return getGamesForAgeGroup(config.ageGroup, config.maxGameDifficulty);
  }, [config]);

  const lockedGames = useMemo(() => {
    return GAMES.filter(
      (g) => !g.ageGroups.includes(config.ageGroup) || g.difficulty > config.maxGameDifficulty,
    );
  }, [config]);

  const totalBestScore = useMemo(() => {
    return Object.values(scores).reduce((sum, s) => sum + (s?.score ?? 0), 0);
  }, [scores]);

  const gamesPlayedCount = useMemo(() => {
    return Object.values(scores).filter((s) => s !== null).length;
  }, [scores]);

  const handleGameClick = useCallback(
    (gameId: string) => {
      playClick();
      router.push(`/kids/${profile?.id}/play/${gameId}`);
    },
    [playClick, router, profile?.id],
  );

  // Loading state
  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          className="text-5xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🎮
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header with back button */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-kids transition-all hover:scale-105 hover:shadow-kids-hover active:scale-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5 text-kids-dark" />
        </button>
        <Mascot mood="excited" size="md" speechBubble={config.greeting} />
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex-1 rounded-2xl bg-gradient-to-br from-kids-sky/10 to-kids-sky/5 p-4 text-center">
          <p className="text-xs font-nunito font-bold text-kids-text-secondary">Games Played</p>
          <p className="text-2xl font-nunito font-extrabold text-kids-sky">{gamesPlayedCount}</p>
        </div>
        <div className="flex-1 rounded-2xl bg-gradient-to-br from-kids-grass/10 to-kids-grass/5 p-4 text-center">
          <p className="text-xs font-nunito font-bold text-kids-text-secondary">Best Score</p>
          <p className="text-2xl font-nunito font-extrabold text-kids-grass">{totalBestScore}</p>
        </div>
      </motion.div>

      {/* Available Games */}
      <div>
        <motion.h2
          className={`mb-3 font-nunito font-extrabold text-kids-dark ${config.fontSize}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          🎮 Choose a Game
        </motion.h2>

        <div className={`grid gap-4 ${config.gridCols === 'grid-cols-2' ? 'grid-cols-2' : config.gridCols}`}>
          {availableGames.map((game, idx) => (
            <KidsCard
              key={game.id}
              variant="interactive"
              color={game.color}
              padding="md"
              onClick={() => handleGameClick(game.id)}
              delay={idx * 0.1}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <motion.span
                  className={`font-nunito ${config.iconSize}`}
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: idx * 0.3,
                    ease: 'easeInOut',
                  }}
                  aria-hidden="true"
                >
                  {game.icon}
                </motion.span>

                {config.showTextLabels && (
                  <>
                    <h3 className={`font-nunito font-bold text-kids-dark ${config.fontSize}`}>
                      {game.title}
                    </h3>
                    {config.showDescriptions && (
                      <p className="text-xs text-kids-text-secondary">{game.description}</p>
                    )}
                  </>
                )}

                {/* High Score Badge */}
                {scores[game.id] && (
                  <KidsBadge variant="gold" size="sm">
                    🏆 {scores[game.id]!.score}
                  </KidsBadge>
                )}
              </div>
            </KidsCard>
          ))}
        </div>
      </div>

      {/* Locked Games (shown for toddlers seeing early/kid games) */}
      {lockedGames.length > 0 && (
        <div>
          <motion.h2
            className={`mb-3 font-nunito font-extrabold text-kids-text-secondary ${config.fontSize}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            🔒 Coming Soon
          </motion.h2>

          <div className={`grid gap-4 ${config.gridCols === 'grid-cols-2' ? 'grid-cols-2' : config.gridCols}`}>
            {lockedGames.map((game, idx) => (
              <motion.div
                key={game.id}
                className="rounded-2xl bg-kids-lightgray/40 p-4 opacity-60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className={`${config.iconSize} grayscale`}>{game.icon}</span>
                  {config.showTextLabels && (
                    <p className={`font-nunito font-bold text-kids-text-secondary ${config.fontSize}`}>
                      {game.title}
                    </p>
                  )}
                  <p className="text-xs text-kids-text-secondary/70">
                    For bigger kids!
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
