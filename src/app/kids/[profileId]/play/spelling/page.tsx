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
import { SPELLING_WORDS_EARLY, SPELLING_WORDS_KID, calculateStars, formatGameTime } from '@/types/games';
import type { SpellingWord } from '@/types/games';
import GameResults from '@/components/kids/game-results';

// ─── Constants ───────────────────────────────────────────────────────────

const TOTAL_WORDS = 10;
const LETTER_COLORS = [
  'bg-kids-sky text-white',
  'bg-kids-grass text-white',
  'bg-kids-coral text-white',
  'bg-kids-lavender text-white',
  'bg-kids-sun text-kids-dark',
  'bg-kids-mint text-white',
  'bg-kids-purple text-white',
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

function speakWord(word: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.8;
  utterance.pitch = 1.1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

// ─── Component ───────────────────────────────────────────────────────────

export default function SpellingGame() {
  const { profile } = useChildProfile();
  const router = useRouter();
  const config = useAgeGroup(profile?.age ?? 5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audioTap = useAudio({ frequency: 600, type: 'triangle', duration: 80 });
  const audioCorrect = useAudio({ frequency: 1200, type: 'sine', duration: 250 });
  const audioWrong = useAudio({ frequency: 300, type: 'square', duration: 150 });

  const [phase, setPhase] = useState<'idle' | 'playing' | 'completed'>('idle');
  const [words, setWords] = useState<SpellingWord[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [placedLetters, setPlacedLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [wrongWords, setWrongWords] = useState(0);
  const [usedBackspace, setUsedBackspace] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [stars, setStars] = useState<0 | 1 | 2 | 3>(0);
  const [showResults, setShowResults] = useState(false);
  const [wordResult, setWordResult] = useState<'correct' | 'wrong' | null>(null);

  const currentWord = words[currentIdx] ?? null;

  // Extract stable values for callbacks
  const profileId = profile?.id;
  const profileAge = profile?.age;

  // Available letters (scrambled correct + distractors)
  const availableLetters = useMemo(() => {
    if (!currentWord) return [];
    const used = new Set(placedLetters);
    const allLetters = [...currentWord.letters, ...currentWord.distractors];
    return shuffleArray(allLetters.filter((l) => !used.has(l)));
  }, [currentWord, placedLetters]);

  // Start game
  const startGame = useCallback(() => {
    const wordList = profileAge && profileAge <= 7 ? SPELLING_WORDS_EARLY : SPELLING_WORDS_KID;
    const shuffled = shuffleArray([...wordList]).slice(0, TOTAL_WORDS);
    setWords(shuffled);
    setCurrentIdx(0);
    setPlacedLetters([]);
    setScore(0);
    setCorrectWords(0);
    setWrongWords(0);
    setUsedBackspace(false);
    setElapsed(0);
    setStars(0);
    setShowResults(false);
    setWordResult(null);
    setPhase('playing');

    // Speak first word
    setTimeout(() => speakWord(shuffled[0].word), 500);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, [profileAge]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    };
  }, []);

  // Save score
  const saveSpellingScore = useCallback(() => {
    if (!profileId) return;
    const record = {
      id: `local-${Date.now()}`,
      childId: profileId,
      gameType: 'spelling' as const,
      score,
      level: profileAge && profileAge <= 7 ? 2 : 3,
      duration: elapsed,
      completedAt: new Date().toISOString(),
    };
    try {
      const key = `kv-game-scores-${profileId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      if (!existing.spelling || score > (existing.spelling?.score ?? 0)) {
        existing.spelling = record;
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch { /* ignore */ }
    fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId: profileId, gameType: 'spelling', score, level: record.level, duration: elapsed }),
    }).catch(() => {});
  }, [profileId, profileAge, score, elapsed]);

  // Handle letter tap
  const handleLetterTap = useCallback(
    (letter: string) => {
      if (phase !== 'playing' || !currentWord) return;
      if (placedLetters.length >= currentWord.word.length) return;

      audioTap.play();
      setUsedBackspace(false);
      setPlacedLetters((prev) => [...prev, letter]);

      // Check if word is complete
      const newPlaced = [...placedLetters, letter];
      if (newPlaced.length === currentWord.word.length) {
        const spelled = newPlaced.join('');
        if (spelled === currentWord.word) {
          // Correct!
          audioCorrect.play();
          setWordResult('correct');
          const wordScore = currentWord.word.length * 10 + 20;
          const bonus = !usedBackspace ? 10 : 0;
          setScore((prev) => prev + wordScore + bonus);
          setCorrectWords((prev) => prev + 1);
        } else {
          // Wrong
          audioWrong.play();
          setWordResult('wrong');
          setWrongWords((prev) => prev + 1);
        }

        // Advance after delay
        setTimeout(() => {
          const nextIdx = currentIdx + 1;
          if (nextIdx >= words.length) {
            if (timerRef.current) clearInterval(timerRef.current);
            const earnedStars = calculateStars(
              correctWords + (spelled === currentWord.word ? 1 : 0),
              words.length,
              wrongWords + (spelled !== currentWord.word ? 1 : 0),
            );
            setStars(earnedStars);
            setPhase('completed');
            setTimeout(() => setShowResults(true), 400);
            saveSpellingScore();
          } else {
            setCurrentIdx(nextIdx);
            setPlacedLetters([]);
            setUsedBackspace(false);
            setWordResult(null);
            speakWord(words[nextIdx].word);
          }
        }, 1500);
      }
    },
    [phase, currentWord, placedLetters, usedBackspace, currentIdx, words, correctWords, wrongWords, audioTap, audioCorrect, audioWrong, saveSpellingScore],
  );

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (phase !== 'playing' || placedLetters.length === 0) return;
    setUsedBackspace(true);
    setPlacedLetters((prev) => prev.slice(0, -1));
  }, [phase, placedLetters]);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (phase !== 'playing') return;
    setScore((prev) => Math.max(0, prev - 5));
    setWrongWords((prev) => prev + 1);

    const nextIdx = currentIdx + 1;
    if (nextIdx >= words.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      const earnedStars = calculateStars(correctWords, words.length, wrongWords + 1);
      setStars(earnedStars);
      setPhase('completed');
      setTimeout(() => setShowResults(true), 400);
      saveSpellingScore();
    } else {
      setCurrentIdx(nextIdx);
      setPlacedLetters([]);
      setUsedBackspace(false);
      setWordResult(null);
      speakWord(words[nextIdx].word);
    }
  }, [phase, currentIdx, words, correctWords, wrongWords, saveSpellingScore]);

  // Speak current word
  const handleHearWord = useCallback(() => {
    if (currentWord) speakWord(currentWord.word);
  }, [currentWord]);

  // Age check
  if (profile && profile.age <= 4) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <motion.span
          className="text-7xl"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🐝
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

  // Start screen
  if (phase === 'idle') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <motion.span
          className="text-7xl sm:text-8xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          🐝
        </motion.span>
        <motion.h1
          className="text-3xl font-nunito font-extrabold text-kids-dark sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Spelling Bee
        </motion.h1>
        <motion.p
          className="text-center text-kids-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Spell {TOTAL_WORDS} words by tapping the right letters!
          <br />
          Listen to the word and spell it out.
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
          <KidsButton variant="accent" onClick={startGame} size="early">
            Start!
          </KidsButton>
        </motion.div>
      </div>
    );
  }

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
          <KidsBadge variant="default" size="sm">🐝</KidsBadge>
          <span className="text-sm font-nunito font-bold text-kids-dark">
            {currentIdx + 1}/{words.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <KidsBadge variant="gold" size="sm">⭐ {score}</KidsBadge>
          <KidsBadge variant="default" size="sm">✅ {correctWords}</KidsBadge>
          <KidsBadge variant="default" size="sm">⏱ {formatGameTime(elapsed)}</KidsBadge>
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 overflow-hidden rounded-full bg-kids-lightgray">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-kids-coral to-kids-sun"
          animate={{ width: `${(currentIdx / words.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Word Area */}
      <AnimatePresence mode="wait">
        {currentWord && (
          <motion.div
            key={currentIdx}
            className="flex flex-col items-center gap-5 py-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Emoji hint */}
            <motion.span
              className="text-6xl sm:text-7xl"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentWord.hint}
            </motion.span>

            {/* Hear Word button */}
            <KidsButton
              variant="ghost"
              size="sm"
              onClick={handleHearWord}
              leftIcon={<span>🔊</span>}
            >
              Hear Word
            </KidsButton>

            {/* Letter blanks / placed letters */}
            <div className="flex gap-2 sm:gap-3">
              {currentWord.word.split('').map((_, idx) => {
                const placedLetter = placedLetters[idx];
                const isCorrectSlot = wordResult === 'correct';
                const isWrongSlot = wordResult === 'wrong';
                return (
                  <motion.div
                    key={idx}
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl border-3 text-xl font-nunito font-extrabold sm:h-14 sm:w-14 sm:text-2xl',
                      placedLetter
                        ? isCorrectSlot
                          ? 'border-kids-grass bg-kids-grass/20 text-kids-dark'
                          : isWrongSlot
                            ? 'border-kids-coral bg-kids-coral/20 text-kids-coral'
                            : 'border-kids-sky bg-kids-sky/20 text-kids-dark'
                        : 'border-kids-lightgray bg-white text-kids-text-secondary',
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: idx * 0.05 }}
                  >
                    {placedLetter || '_'}
                  </motion.div>
                );
              })}
            </div>

            {/* Word result feedback */}
            {wordResult && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  'rounded-full px-6 py-2 text-lg font-nunito font-bold',
                  wordResult === 'correct' && 'bg-kids-grass text-white',
                  wordResult === 'wrong' && 'bg-kids-coral text-white',
                )}
              >
                {wordResult === 'correct'
                  ? '✓ Correct!'
                  : `✗ The word is "${currentWord.word}"`}
              </motion.div>
            )}

            {/* Available letter tiles */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {availableLetters.map((letter, idx) => (
                <motion.button
                  key={`${letter}-${idx}-${currentIdx}`}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl text-xl font-nunito font-extrabold shadow-kids cursor-pointer transition-all sm:h-14 sm:w-14 sm:text-2xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-coral',
                    LETTER_COLORS[idx % LETTER_COLORS.length],
                  )}
                  onClick={() => handleLetterTap(letter)}
                  disabled={phase !== 'playing' || wordResult !== null}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: idx * 0.03, type: 'spring', stiffness: 400, damping: 20 }}
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {letter}
                </motion.button>
              ))}
            </div>

            {/* Backspace + Skip */}
            <div className="flex gap-3">
              <KidsButton
                variant="outline"
                size="sm"
                onClick={handleBackspace}
                disabled={placedLetters.length === 0 || wordResult !== null}
                leftIcon={<span>⌫</span>}
              >
                Undo
              </KidsButton>
              <KidsButton
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                disabled={wordResult !== null}
                leftIcon={<span>⏭</span>}
              >
                Skip
              </KidsButton>
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
        gameTitle="Spelling Bee"
        gameIcon="🐝"
        onPlayAgain={startGame}
        onBack={() => router.push(`/kids/${profile?.id}/play`)}
      />
    </div>
  );
}
