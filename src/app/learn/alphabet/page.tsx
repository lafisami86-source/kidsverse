'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Volume2, Eraser, RotateCcw, PartyPopper } from 'lucide-react';
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

interface LetterData {
  letter: string;
  word: string;
  emoji: string;
  color: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'kv-active-profile';
const PROGRESS_KEY = 'kv-learn-progress';
const ALPHABET_KEY = 'kv-alphabet-progress';

const LETTERS: LetterData[] = [
  { letter: 'A', word: 'Apple',     emoji: '🍎', color: 'text-kids-coral' },
  { letter: 'B', word: 'Bee',       emoji: '🐝', color: 'text-kids-sun' },
  { letter: 'C', word: 'Cat',       emoji: '🐱', color: 'text-kids-grass' },
  { letter: 'D', word: 'Dog',       emoji: '🐶', color: 'text-kids-sun' },
  { letter: 'E', word: 'Elephant',  emoji: '🐘', color: 'text-kids-text-secondary' },
  { letter: 'F', word: 'Fox',       emoji: '🦊', color: 'text-kids-coral' },
  { letter: 'G', word: 'Grapes',    emoji: '🍇', color: 'text-kids-grass' },
  { letter: 'H', word: 'House',     emoji: '🏠', color: 'text-kids-sun' },
  { letter: 'I', word: 'Ice Cream', emoji: '🍦', color: 'text-kids-pink' },
  { letter: 'J', word: 'Juggler',   emoji: '🤹', color: 'text-kids-sun' },
  { letter: 'K', word: 'Kite',      emoji: '🪁', color: 'text-kids-lavender' },
  { letter: 'L', word: 'Lion',      emoji: '🦁', color: 'text-kids-sun' },
  { letter: 'M', word: 'Moon',      emoji: '🌙', color: 'text-kids-lavender' },
  { letter: 'N', word: 'Nest',      emoji: '🎈', color: 'text-kids-sun' },
  { letter: 'O', word: 'Octopus',   emoji: '🐙', color: 'text-kids-coral' },
  { letter: 'P', word: 'Panda',     emoji: '🐼', color: 'text-kids-text-secondary' },
  { letter: 'Q', word: 'Queen',     emoji: '👑', color: 'text-kids-pink' },
  { letter: 'R', word: 'Rainbow',   emoji: '🌈', color: 'text-kids-sky' },
  { letter: 'S', word: 'Star',      emoji: '⭐', color: 'text-kids-sun' },
  { letter: 'T', word: 'Turtle',    emoji: '🐢', color: 'text-kids-grass' },
  { letter: 'U', word: 'Umbrella',  emoji: '☂️', color: 'text-kids-sky' },
  { letter: 'V', word: 'Violin',    emoji: '🎻', color: 'text-kids-coral' },
  { letter: 'W', word: 'Whale',     emoji: '🐋', color: 'text-kids-sky' },
  { letter: 'X', word: 'Xylophone', emoji: '✖️', color: 'text-kids-lavender' },
  { letter: 'Y', word: 'Yo-yo',     emoji: '🪀', color: 'text-kids-coral' },
  { letter: 'Z', word: 'Zebra',     emoji: '🦓', color: 'text-kids-text-secondary' },
];

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

function getPracticedLetters(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(ALPHABET_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function savePracticedLetters(letters: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ALPHABET_KEY, JSON.stringify(Array.from(letters)));

    // Also update global learn-progress
    const raw = localStorage.getItem(PROGRESS_KEY);
    const global = raw ? JSON.parse(raw) : {};
    global['alphabet'] = { completed: letters.size, practiced: Array.from(letters) };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(global));
  } catch {
    // Silent
  }
}

function speakText(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
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
/*  Tracing Canvas Component                                           */
/* ------------------------------------------------------------------ */

interface TraceCanvasProps {
  letter: string;
  practiced: boolean;
  onPractice: () => void;
  isToddler: boolean;
}

function TraceCanvas({ letter, practiced, onPractice, isToddler }: TraceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasDrawnRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const CANVAS_SIZE = isToddler ? 280 : 220;
  const LINE_WIDTH = isToddler ? 10 : 7;

  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const startDraw = useCallback(
    (clientX: number, clientY: number) => {
      const pos = getCanvasPoint(clientX, clientY);
      if (!pos) return;
      isDrawingRef.current = true;
      lastPosRef.current = pos;

      // Draw a dot at start position
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, LINE_WIDTH / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(96, 181, 255, 0.8)';
        ctx.fill();
      }
    },
    [getCanvasPoint, LINE_WIDTH],
  );

  const moveDraw = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDrawingRef.current || !lastPosRef.current) return;
      const pos = getCanvasPoint(clientX, clientY);
      if (!pos) return;
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = 'rgba(96, 181, 255, 0.8)';
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      lastPosRef.current = pos;

      if (!hasDrawnRef.current) {
        hasDrawnRef.current = true;
        onPractice();
      }
    },
    [getCanvasPoint, LINE_WIDTH, onPractice],
  );

  const endDraw = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGuideLetter(ctx, canvas.width, canvas.height, letter);
    hasDrawnRef.current = false;
  }, [letter]);

  // Draw guide letter and dashed center lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dashed center lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 6]);

    // Horizontal center
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Vertical center
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.setLineDash([]);

    // Guide letter
    drawGuideLetter(ctx, canvas.width, canvas.height, letter);
  }, [letter]);

  // Mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      startDraw(e.clientX, e.clientY);
    };
    const handleMouseMove = (e: MouseEvent) => {
      moveDraw(e.clientX, e.clientY);
    };
    const handleMouseUp = () => endDraw();
    const handleMouseLeave = () => endDraw();

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [startDraw, moveDraw, endDraw]);

  // Touch events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      startDraw(touch.clientX, touch.clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      moveDraw(touch.clientX, touch.clientY);
    };
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      endDraw();
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [startDraw, moveDraw, endDraw]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2">
      <div className="relative rounded-2xl border-2 border-dashed border-kids-sky/30 overflow-hidden bg-kids-lightgray/30">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="touch-none cursor-crosshair"
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
          aria-label={`Trace the letter ${letter}`}
          role="img"
        />
        {practiced && (
          <motion.div
            className="absolute top-2 right-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <span className="text-lg" aria-hidden="true">✅</span>
          </motion.div>
        )}
      </div>
      <KidsButton
        variant="outline"
        size="sm"
        onClick={clearCanvas}
        leftIcon={<Eraser className="size-4" aria-hidden="true" />}
      >
        Clear
      </KidsButton>
    </div>
  );
}

function drawGuideLetter(ctx: CanvasRenderingContext2D, w: number, h: number, letter: string) {
  const fontSize = Math.floor(w * 0.65);
  ctx.font = `bold ${fontSize}px Nunito, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(203, 213, 225, 0.5)';
  ctx.fillText(letter, w / 2, h / 2 + fontSize * 0.05);
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const letterEntry = {
  initial: { opacity: 0, scale: 0.3, rotate: -15 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.8, y: -30, transition: { duration: 0.2 } },
};

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function AlphabetPage() {
  const router = useRouter();
  const { play: playPop } = useAudio({ frequency: 600, type: 'triangle' });
  const { play: playSuccess } = useAudio({ frequency: 1200, type: 'sine', duration: 300 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [practicedSet, setPracticedSet] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasSeenCelebration, setHasSeenCelebration] = useState(false);

  /* ---- Load from localStorage ---- */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      setProfile(getStoredProfile());
      setPracticedSet(getPracticedLetters());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---- Age config ---- */
  const ageConfig = useAgeGroup(profile?.age ?? 5);
  const isToddler = ageConfig.ageGroup === 'toddler';
  const isKid = ageConfig.ageGroup === 'kid';

  /* ---- Adaptive sizing ---- */
  const selectorLetterSize = isToddler ? 'text-xl sm:text-2xl' : isKid ? 'text-base sm:text-lg' : 'text-lg sm:text-xl';
  const displayLetterSize = isToddler ? 'text-[100px] sm:text-[140px]' : isKid ? 'text-[72px] sm:text-[96px]' : 'text-[88px] sm:text-[120px]';
  const emojiSize = isToddler ? 'text-6xl sm:text-7xl' : isKid ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl';
  const buttonSize = isToddler ? ('toddler' as const) : isKid ? ('kid' as const) : ('early' as const);
  const selectorItemSize = isToddler ? 'min-w-[52px] min-h-[52px] sm:min-w-[60px] sm:min-h-[60px]' : 'min-w-[42px] min-h-[42px] sm:min-w-[48px] sm:min-h-[48px]';

  /* ---- Derived state ---- */
  const currentLetter = LETTERS[selectedIdx];
  const practicedCount = practicedSet.size;
  const allDone = practicedCount >= 26;

  /* ---- Mark a letter as practiced ---- */
  const markPracticed = useCallback(
    (letter: string) => {
      setPracticedSet((prev) => {
        if (prev.has(letter)) return prev;
        const next = new Set(prev);
        next.add(letter);
        savePracticedLetters(next);
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

  /* ---- Scroll selected letter into view ---- */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const activeEl = container.querySelector(`[data-letter="${LETTERS[selectedIdx].letter}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedIdx]);

  /* ---- Handlers ---- */
  const handleSelectLetter = useCallback(
    (idx: number) => {
      playPop();
      setSelectedIdx(idx);
    },
    [playPop],
  );

  const handlePrev = useCallback(() => {
    if (selectedIdx > 0) {
      playPop();
      setSelectedIdx((prev) => prev - 1);
    }
  }, [selectedIdx, playPop]);

  const handleNext = useCallback(() => {
    if (selectedIdx < 25) {
      playPop();
      setSelectedIdx((prev) => prev + 1);
    }
  }, [selectedIdx, playPop]);

  const handleGoBack = useCallback(() => {
    playPop();
    router.push('/learn');
  }, [playPop, router]);

  const handleHearLetter = useCallback(() => {
    playPop();
    speakText(`${currentLetter.letter}. ${currentLetter.letter} is for ${currentLetter.word}`);
  }, [playPop, currentLetter]);

  const handleCloseCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  const handleRestart = useCallback(() => {
    setPracticedSet(new Set());
    savePracticedLetters(new Set());
    setHasSeenCelebration(false);
    setShowCelebration(false);
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
            🔤
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
            🔤
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
            <KidsBadge variant="sky" size="sm" icon={<span aria-hidden="true">🔤</span>}>
              {practicedCount}/26
            </KidsBadge>
            <motion.span className="text-2xl" aria-hidden="true">
              {profile.avatar}
            </motion.span>
          </div>
        </div>
      </header>

      {/* ---- Main Content ---- */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-6 flex flex-col gap-5">

        {/* ---- Letter Selector (scrollable row) ---- */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory"
            style={{ scrollbarWidth: 'thin' }}
            role="tablist"
            aria-label="Select a letter"
          >
            {LETTERS.map((item, idx) => {
              const isPracticed = practicedSet.has(item.letter);
              const isActive = idx === selectedIdx;

              return (
                <motion.button
                  key={item.letter}
                  type="button"
                  data-letter={item.letter}
                  role="tab"
                  aria-selected={isActive}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleSelectLetter(idx)}
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center rounded-xl border-2 font-nunito font-extrabold transition-colors snap-center focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky',
                    selectorLetterSize,
                    selectorItemSize,
                    isActive
                      ? 'bg-kids-sky text-white border-kids-sky shadow-kids'
                      : isPracticed
                        ? 'bg-kids-grass/15 text-kids-grass border-kids-grass/40'
                        : 'bg-white text-kids-dark border-kids-lightgray hover:border-kids-sky/40',
                  )}
                >
                  {item.letter}
                  {isPracticed && !isActive && (
                    <span className="absolute -top-1 -right-1 text-[10px]" aria-hidden="true">✓</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ---- Progress bar ---- */}
        <KidsProgressBar
          value={practicedCount}
          min={0}
          max={26}
          size="sm"
          color="rainbow"
          showLabel
          label={`Letters Practiced`}
        />

        {/* ---- Letter Display Card ---- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLetter.letter}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-4"
          >
            <KidsCard
              variant="elevated"
              color="white"
              padding="xl"
              className="w-full text-center relative overflow-hidden"
            >
              {/* Decorative background emojis */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
                <div className="absolute top-3 left-3 text-4xl rotate-[-15deg]">{currentLetter.emoji}</div>
                <div className="absolute bottom-3 right-3 text-4xl rotate-[15deg]">{currentLetter.emoji}</div>
                <div className="absolute top-6 right-10 text-2xl">{currentLetter.emoji}</div>
                <div className="absolute bottom-8 left-10 text-2xl">{currentLetter.emoji}</div>
              </div>

              {/* Navigation row */}
              <div className="relative flex items-center justify-between mb-2">
                <KidsButton
                  variant="ghost"
                  size="icon-sm"
                  onClick={handlePrev}
                  disabled={selectedIdx === 0}
                  sound="pop"
                  aria-label="Previous letter"
                >
                  <ChevronLeft className="size-5" />
                </KidsButton>

                <span className="text-xs font-nunito font-bold text-kids-text-secondary">
                  {selectedIdx + 1} of 26
                </span>

                <KidsButton
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleNext}
                  disabled={selectedIdx === 25}
                  sound="pop"
                  aria-label="Next letter"
                >
                  <ChevronRight className="size-5" />
                </KidsButton>
              </div>

              {/* The big letter */}
              <motion.div
                className={cn('font-nunito font-extrabold leading-none select-none', displayLetterSize, currentLetter.color)}
                variants={letterEntry}
                initial="initial"
                animate="animate"
              >
                {currentLetter.letter}
              </motion.div>

              {/* Emoji + Word */}
              <motion.div
                className="mt-2 flex flex-col items-center gap-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <span className={emojiSize} aria-hidden="true">
                  {currentLetter.emoji}
                </span>
                <p className="text-base sm:text-lg font-nunito font-bold text-kids-text-secondary">
                  {isToddler ? '' : `${currentLetter.letter} is for`}
                </p>
                <p className="text-xl sm:text-2xl font-nunito font-extrabold text-kids-dark">
                  {currentLetter.word}
                </p>
              </motion.div>

              {/* Hear it button */}
              <motion.div
                className="mt-5 flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <KidsButton
                  variant="primary"
                  size={buttonSize}
                  onClick={handleHearLetter}
                  leftIcon={<Volume2 className="size-5" aria-hidden="true" />}
                >
                  {isToddler ? '🔊 Hear It' : 'Hear Letter'}
                </KidsButton>
              </motion.div>

              {/* Practiced indicator */}
              {practicedSet.has(currentLetter.letter) && (
                <motion.div
                  className="mt-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <KidsBadge variant="success" size="sm">
                    ✓ Practiced!
                  </KidsBadge>
                </motion.div>
              )}
            </KidsCard>

            {/* ---- Trace Section ---- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full flex flex-col items-center gap-3"
            >
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-nunito font-bold text-kids-dark flex items-center justify-center gap-2">
                  <span>✏️</span>
                  Trace the Letter
                </h3>
                <p className="text-xs text-kids-text-secondary mt-1">
                  Draw on the canvas below to practice!
                </p>
              </div>
              <TraceCanvas
                letter={currentLetter.letter}
                practiced={practicedSet.has(currentLetter.letter)}
                onPractice={() => markPracticed(currentLetter.letter)}
                isToddler={isToddler}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ---- Celebration Modal ---- */}
      <KidsModal
        isOpen={showCelebration}
        onClose={handleCloseCelebration}
        title="🎉 Alphabet Champion!"
        description="You've practiced all 26 letters! Amazing work!"
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
              {practicedCount} / 26 Letters
            </p>
            <p className="text-sm text-kids-text-secondary">
              You traced every single letter of the alphabet!
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1 max-w-xs">
            {LETTERS.map((l) => (
              <span
                key={l.letter}
                className="text-lg font-nunito font-bold text-kids-grass"
                aria-hidden="true"
              >
                {l.letter}
              </span>
            ))}
          </div>
        </div>
      </KidsModal>
    </div>
  );
}
