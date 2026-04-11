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
import type { MathProblem, MathOperation } from '@/types/games';
import { calculateStars, formatGameTime } from '@/types/games';
import GameResults from '@/components/kids/game-results';

// ─── Constants ───────────────────────────────────────────────────────────

const TOTAL_PROBLEMS = 10;
const COUNTING_EMOJIS = ['🍎', '🌟', '🐶', '🎈', '🦋', '🍓', '🐟', '🌻', '🐸', '🍪'];

// ─── Problem Generators ──────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateToddlerProblem(): MathProblem {
  const count = randInt(1, 5);
  const emoji = COUNTING_EMOJIS[randInt(0, COUNTING_EMOJIS.length - 1)];
  const choices = new Set<number>([count]);
  while (choices.size < 3) {
    const c = randInt(1, 5);
    choices.add(c);
  }
  return {
    question: `How many ${emoji}?`,
    answer: count,
    choices: shuffleArray([...choices]),
    visualEmoji: emoji,
    operation: '+',
  };
}

function generateEarlyProblem(): MathProblem {
  const operation: MathOperation = (Math.random() > 0.4 ? '+' : '-') as MathOperation;
  let a: number, b: number, answer: number;

  if (operation === '+') {
    a = randInt(1, 10);
    b = randInt(1, 10);
    answer = a + b;
  } else {
    a = randInt(3, 15);
    b = randInt(1, Math.min(a, 10));
    answer = a - b;
  }

  const choices = new Set<number>([answer]);
  while (choices.size < 4) {
    const offset = randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1);
    const c = answer + offset;
    if (c >= 0 && c <= 25) choices.add(c);
  }
  // Ensure exactly 4 choices
  let fill = 0;
  while (choices.size < 4) {
    choices.add(answer + fill + 4);
    fill++;
  }

  return {
    question: `What is ${a} ${operation} ${b}?`,
    answer,
    choices: shuffleArray([...choices]).slice(0, 4),
    operation,
  };
}

function generateKidProblem(): MathProblem {
  const ops: MathOperation[] = ['+', '-', '×'];
  const operation = ops[randInt(0, 2)];
  let a: number, b: number, answer: number;

  if (operation === '+') {
    a = randInt(10, 50);
    b = randInt(10, 50);
    answer = a + b;
  } else if (operation === '-') {
    a = randInt(20, 80);
    b = randInt(5, a);
    answer = a - b;
  } else {
    const tables = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    const table = tables[randInt(0, tables.length - 1)];
    a = table;
    b = randInt(2, 10);
    answer = a * b;
  }

  const choices = new Set<number>([answer]);
  while (choices.size < 4) {
    const offset = randInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
    choices.add(answer + offset);
  }
  let fill = 0;
  while (choices.size < 4) {
    choices.add(answer + fill + 5);
    fill++;
  }

  return {
    question: `What is ${a} ${operation} ${b}?`,
    answer,
    choices: shuffleArray([...choices]).slice(0, 4),
    operation,
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateProblem(age: number): MathProblem {
  if (age <= 4) return generateToddlerProblem();
  if (age <= 7) return generateEarlyProblem();
  return generateKidProblem();
}

// ─── Component ───────────────────────────────────────────────────────────

export default function MathGame() {
  const { profile } = useChildProfile();
  const router = useRouter();
  const config = useAgeGroup(profile?.age ?? 5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audioCorrect = useAudio({ frequency: 1200, type: 'sine', duration: 200 });
  const audioWrong = useAudio({ frequency: 300, type: 'square', duration: 150 });

  const [phase, setPhase] = useState<'idle' | 'playing' | 'answered' | 'completed'>('idle');
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [stars, setStars] = useState<0 | 1 | 2 | 3>(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const currentProblem = problems[currentIdx] ?? null;

  // Start game
  const startGame = useCallback(() => {
    const newProblems = Array.from({ length: TOTAL_PROBLEMS }, () =>
      generateProblem(profile?.age ?? 5),
    );
    setProblems(newProblems);
    setCurrentIdx(0);
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setElapsed(0);
    setStars(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setFeedback(null);
    setPhase('playing');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, [profile?.age]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Extract stable values for callbacks
  const profileId = profile?.id;
  const profileAge = profile?.age;

  // Save score
  const saveGameScore = useCallback(() => {
    if (!profileId) return;
    const finalScore = score;
    const record = {
      id: `local-${Date.now()}`,
      childId: profileId,
      gameType: 'math' as const,
      score: finalScore,
      level: profileAge && profileAge <= 4 ? 1 : profileAge && profileAge <= 7 ? 2 : 3,
      duration: elapsed,
      completedAt: new Date().toISOString(),
    };
    try {
      const key = `kv-game-scores-${profileId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      if (!existing.math || finalScore > (existing.math?.score ?? 0)) {
        existing.math = record;
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch { /* ignore */ }

    fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childId: profileId,
        gameType: 'math',
        score: finalScore,
        level: record.level,
        duration: elapsed,
      }),
    }).catch(() => {});
  }, [profileId, profileAge, score, elapsed]);

  // Handle answer selection
  const handleAnswer = useCallback(
    (answer: number) => {
      if (phase !== 'playing' || !currentProblem) return;

      setSelectedAnswer(answer);
      setPhase('answered');

      if (answer === currentProblem.answer) {
        audioCorrect.play();
        setFeedback('correct');
        const timeBonus = Math.max(0, Math.floor((15 - elapsed) / 3));
        const points = 10 + timeBonus;
        setScore((prev) => prev + points);
        setCorrect((prev) => prev + 1);
      } else {
        audioWrong.play();
        setFeedback('wrong');
        setWrong((prev) => prev + 1);
      }

      // Auto-advance after delay
      setTimeout(() => {
        const nextIdx = currentIdx + 1;
        if (nextIdx >= TOTAL_PROBLEMS) {
          // Game complete
          if (timerRef.current) clearInterval(timerRef.current);
          const finalCorrect = correct + (answer === currentProblem.answer ? 1 : 0);
          const finalWrong = wrong + (answer !== currentProblem.answer ? 1 : 0);
          const earnedStars = calculateStars(finalCorrect, TOTAL_PROBLEMS, finalWrong);
          setStars(earnedStars);
          setPhase('completed');
          setTimeout(() => setShowResults(true), 400);
          saveGameScore();
        } else {
          setCurrentIdx(nextIdx);
          setSelectedAnswer(null);
          setFeedback(null);
          setPhase('playing');
        }
      }, 1200);
    },
    [phase, currentProblem, currentIdx, correct, wrong, elapsed, audioCorrect, audioWrong, saveGameScore],
  );

  // Start screen
  if (phase === 'idle') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <motion.span
          className="text-7xl sm:text-8xl"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          🧮
        </motion.span>
        <motion.h1
          className="text-3xl font-nunito font-extrabold text-kids-dark sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Math Challenge
        </motion.h1>
        <motion.p
          className="text-center text-kids-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Solve {TOTAL_PROBLEMS} math problems!
          <br />
          {profile?.age && profile.age <= 4 && 'Count objects and simple addition'}
          {profile?.age && profile.age > 4 && profile.age <= 7 && 'Addition and subtraction within 20'}
          {profile?.age && profile.age > 7 && 'Addition, subtraction, and multiplication'}
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
          <KidsButton variant="success" onClick={startGame} size="early">
            Start!
          </KidsButton>
        </motion.div>
      </div>
    );
  }

  // Answer color mapping
  const getChoiceStyle = (choice: number) => {
    if (selectedAnswer === null) return 'bg-white border-3 border-kids-lightgray hover:border-kids-sky hover:bg-kids-sky/5';
    if (choice === currentProblem?.answer) return 'bg-kids-grass/20 border-3 border-kids-grass';
    if (choice === selectedAnswer && feedback === 'wrong') return 'bg-kids-coral/20 border-3 border-kids-coral';
    return 'bg-white border-3 border-kids-lightgray opacity-50';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* HUD */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-kids">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setPhase('idle'); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-kids-lightgray/60 transition-all hover:bg-kids-lightgray active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kids-sky"
            aria-label="Back to menu"
          >
            <ArrowLeft className="size-4 text-kids-dark" />
          </button>
          <KidsBadge variant="default" size="sm">🧮</KidsBadge>
          <span className="text-sm font-nunito font-bold text-kids-dark">
            {currentIdx + 1}/{TOTAL_PROBLEMS}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <KidsBadge variant="gold" size="sm">⭐ {score}</KidsBadge>
          <KidsBadge variant="default" size="sm">✅ {correct}</KidsBadge>
          <KidsBadge variant="default" size="sm">⏱ {formatGameTime(elapsed)}</KidsBadge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 overflow-hidden rounded-full bg-kids-lightgray">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-kids-grass to-kids-sun"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentIdx) / TOTAL_PROBLEMS) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Problem Area */}
      <AnimatePresence mode="wait">
        {currentProblem && (
          <motion.div
            key={currentIdx}
            className="flex flex-col items-center gap-6 py-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Visual for toddlers (counting) */}
            {currentProblem.visualEmoji && (
              <motion.div
                className="flex flex-wrap justify-center gap-1 sm:gap-2"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {Array.from({ length: currentProblem.answer }, (_, i) => (
                  <motion.span
                    key={i}
                    className={`${config?.iconSize ?? 'text-4xl'}`}
                    initial={{ scale: 0, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05, type: 'spring', stiffness: 400 }}
                  >
                    {currentProblem.visualEmoji}
                  </motion.span>
                ))}
              </motion.div>
            )}

            {/* Question */}
            <motion.h2
              className={`text-center font-nunito font-extrabold text-kids-dark ${config?.fontSize === 'text-lg' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {currentProblem.question}
            </motion.h2>

            {/* Feedback overlay */}
            {feedback && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  'rounded-full px-6 py-2 text-xl font-nunito font-bold',
                  feedback === 'correct' && 'bg-kids-grass text-white',
                  feedback === 'wrong' && 'bg-kids-coral text-white',
                )}
              >
                {feedback === 'correct' ? '✓ Correct!' : `✗ It's ${currentProblem.answer}`}
              </motion.div>
            )}

            {/* Answer Choices */}
            <div className="grid w-full max-w-sm grid-cols-2 gap-3">
              {currentProblem.choices.map((choice, idx) => (
                <motion.button
                  key={choice}
                  className={cn(
                    'rounded-2xl p-4 text-center font-nunito font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky',
                    config?.fontSize === 'text-lg' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl',
                    'text-kids-dark min-h-[72px]',
                    getChoiceStyle(choice),
                  )}
                  onClick={() => handleAnswer(choice)}
                  disabled={phase !== 'playing'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  whileTap={phase === 'playing' ? { scale: 0.95 } : {}}
                >
                  {choice}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Results */}
      <GameResults
        isOpen={showResults}
        stars={stars}
        score={score}
        duration={elapsed}
        gameTitle="Math Challenge"
        gameIcon="🧮"
        onPlayAgain={startGame}
        onBack={() => router.push(`/kids/${profile?.id}/play`)}
      />
    </div>
  );
}
