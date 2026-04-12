'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Undo2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAMP_CATEGORIES = [
  { label: 'Animals', emoji: '🐾', stamps: ['🐶', '🐱', '🐻', '🦊', '🐰', '🐼', '🐨', '🦁', '🐸', '🐧', '🦋', '🐝', '🐙', '🦄', '🐉', '🦉', '🐬', '🐘', '🦒'] },
  { label: 'Nature', emoji: '🌿', stamps: ['🌸', '🌻', '🌺', '🍀', '🌈', '⭐', '🌙', '☀️', '🌳', '🏔️', '🌊', '❄️', '🔥', '🍃', '🌾'] },
  { label: 'Food', emoji: '🍕', stamps: ['🍎', '🍕', '🍩', '🍦', '🎂', '🍪', '🧁', '🍫', '🍊', '🍇', '🍓', '🥕', '🌽', '🍰'] },
  { label: 'Fun', emoji: '🎉', stamps: ['❤️', '⭐', '🎉', '🎈', '🎁', '👑', '💎', '🎵', '🏆', '🚀', '✨', '🎯', '🎪', '🏰', '👑'] },
];

const STAMP_SIZES = [
  { label: 'S', size: 28 },
  { label: 'M', size: 44 },
  { label: 'L', size: 64 },
];

const BG_COLORS = ['#FFFFFF', '#FFF9C4', '#F1F8E9', '#E3F2FD', '#FCE4EC', '#E8F5E9', '#FFF3E0', '#F3E5F5'];

interface PlacedStamp {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

export default function StampArt() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedStamp, setSelectedStamp] = useState('🐶');
  const [stampSize, setStampSize] = useState(44);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [stamps, setStamps] = useState<PlacedStamp[]>([]);
  const [history, setHistory] = useState<PlacedStamp[][]>([[]]);
  const [activeCategory, setActiveCategory] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleCanvasTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      let x: number, y: number;
      if ('touches' in e) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = (e as React.MouseEvent).clientX - rect.left;
        y = (e as React.MouseEvent).clientY - rect.top;
      }
      const newStamp: PlacedStamp = {
        id: Date.now(),
        emoji: selectedStamp,
        x: x - stampSize / 2,
        y: y - stampSize / 2,
        size: stampSize,
      };
      setStamps((prev) => {
        const next = [...prev, newStamp];
        setHistory((h) => [...h.slice(-20), next]);
        return next;
      });
    },
    [selectedStamp, stampSize],
  );

  const undo = useCallback(() => {
    if (history.length <= 1) return;
    const prev = history[history.length - 2];
    setStamps(prev);
    setHistory((h) => h.slice(0, -1));
  }, [history]);

  const clearCanvas = useCallback(() => {
    setStamps([]);
    setHistory([[]]);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kids-offwhite">
        <motion.div className="text-6xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🌺</motion.div>
      </div>
    );
  }

  const activeStamps = STAMP_CATEGORIES[activeCategory].stamps;

  return (
    <div className="flex h-screen flex-col bg-kids-offwhite">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white shadow-kids">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 h-14">
          <button type="button" onClick={() => router.push('/create')} className="flex items-center gap-2 rounded-2xl px-2 py-1 hover:bg-kids-lightgray transition-colors" aria-label="Back">
            <ArrowLeft className="size-5 text-kids-text-secondary" />
          </button>
          <h1 className="font-nunito text-lg font-extrabold text-kids-dark">Stamp Art</h1>
          <div className="flex items-center gap-2">
            <button type="button" onClick={undo} disabled={history.length <= 1} className="flex h-9 w-9 items-center justify-center rounded-xl bg-kids-lightgray/60 transition-all hover:bg-kids-lightgray active:scale-90 disabled:opacity-30" aria-label="Undo">
              <Undo2 className="size-4 text-kids-dark" />
            </button>
            <button type="button" onClick={clearCanvas} className="flex h-9 w-9 items-center justify-center rounded-xl bg-kids-coral/10 transition-all hover:bg-kids-coral/20 active:scale-90" aria-label="Clear">
              <Trash2 className="size-4 text-kids-coral" />
            </button>
          </div>
        </div>
      </header>

      {/* Selected stamp preview + size */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-kids-lightgray/50">
        <span className="text-2xl">{selectedStamp}</span>
        <div className="flex gap-2">
          {STAMP_SIZES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setStampSize(s.size)}
              className={cn(
                'px-2.5 py-1 rounded-lg font-nunito font-bold text-xs transition-all active:scale-90',
                stampSize === s.size ? 'bg-kids-grass text-white' : 'bg-kids-lightgray/60 text-kids-text-secondary',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          {BG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setBgColor(c)}
              className={cn(
                'h-6 w-6 rounded-full border-2 transition-all',
                bgColor === c ? 'border-kids-dark scale-110' : 'border-kids-lightgray',
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative mx-auto w-full max-w-2xl cursor-crosshair touch-none overflow-hidden"
        style={{ backgroundColor: bgColor }}
        onClick={handleCanvasTap}
        onTouchStart={handleCanvasTap}
      >
        {stamps.map((stamp) => (
          <motion.span
            key={stamp.id}
            className="absolute select-none pointer-events-none"
            style={{ left: stamp.x, top: stamp.y, fontSize: stamp.size, lineHeight: 1 }}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {stamp.emoji}
          </motion.span>
        ))}
      </div>

      {/* Stamp tray */}
      <div className="sticky bottom-0 bg-white border-t border-kids-lightgray shadow-sm pb-[env(safe-area-inset-bottom)]">
        {/* Category tabs */}
        <div className="flex gap-1 px-3 pt-2 overflow-x-auto">
          {STAMP_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => setActiveCategory(idx)}
              className={cn(
                'flex-shrink-0 px-3 py-1 rounded-xl font-nunito font-bold text-xs transition-all',
                activeCategory === idx ? 'bg-kids-grass text-white' : 'bg-kids-lightgray/60 text-kids-text-secondary',
              )}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Stamps grid */}
        <div className="grid grid-cols-8 gap-1 px-3 py-2">
          {activeStamps.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedStamp(s)}
              className={cn(
                'flex items-center justify-center aspect-square rounded-xl transition-all active:scale-90 text-xl sm:text-2xl',
                selectedStamp === s ? 'bg-kids-grass/20 ring-2 ring-kids-grass' : 'bg-kids-lightgray/40',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
