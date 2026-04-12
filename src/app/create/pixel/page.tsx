'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Undo2, Trash2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = [
  '#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF',
  '#9B59B6', '#FF69B4', '#1E293B', '#FFFFFF', '#95A5A6',
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#8E44AD',
  '#1ABC9C', '#D35400', '#C0392B', '#ECF0F1', '#2C3E50',
];

const GRID_SIZES = [
  { label: '8x8', size: 8 },
  { label: '12x12', size: 12 },
  { label: '16x16', size: 16 },
];

export default function PixelArt() {
  const router = useRouter();
  const [gridSize, setGridSize] = useState(12);
  const [color, setColor] = useState('#FF6B6B');
  const [tool, setTool] = useState<'paint' | 'eraser'>('paint');
  const [pixels, setPixels] = useState<string[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[][][]>([]);
  const [mounted, setMounted] = useState(false);

  const initGrid = useCallback((size: number, fill = '#FFFFFF') => {
    const grid = Array.from({ length: size }, () => Array(size).fill(fill));
    setPixels(grid);
    setHistory([grid.map((row) => [...row])]);
  }, []);

  React.useEffect(() => {
    setMounted(true);
    initGrid(12);
  }, []);

  const saveState = useCallback((grid: string[][]) => {
    setHistory((prev) => [...prev.slice(-30), grid.map((row) => [...row])]);
  }, []);

  const paintPixel = useCallback(
    (row: number, col: number) => {
      if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return;
      const newColor = tool === 'eraser' ? '#FFFFFF' : color;
      setPixels((prev) => {
        if (prev[row][col] === newColor) return prev;
        const next = prev.map((r) => [...r]);
        next[row][col] = newColor;
        return next;
      });
    },
    [color, tool, gridSize],
  );

  const handlePointerDown = useCallback(
    (row: number, col: number) => {
      setIsDrawing(true);
      paintPixel(row, col);
    },
    [paintPixel],
  );

  const handlePointerEnter = useCallback(
    (row: number, col: number) => {
      if (isDrawing) paintPixel(row, col);
    },
    [isDrawing, paintPixel],
  );

  const handlePointerUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setPixels((current) => {
        saveState(current);
        return current;
      });
    }
  }, [isDrawing, saveState]);

  const undo = useCallback(() => {
    if (history.length <= 1) return;
    const prev = history[history.length - 2];
    setPixels(prev.map((row) => [...row]));
    setHistory((h) => h.slice(0, -1));
  }, [history]);

  const clearGrid = useCallback(() => {
    initGrid(gridSize);
  }, [gridSize, initGrid]);

  const changeGridSize = useCallback(
    (size: number) => {
      setGridSize(size);
      initGrid(size);
    },
    [initGrid],
  );

  const savePixelArt = useCallback(() => {
    const canvas = document.createElement('canvas');
    const scale = 20;
    canvas.width = gridSize * scale;
    canvas.height = gridSize * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    pixels.forEach((row, ri) =>
      row.forEach((color, ci) => {
        ctx.fillStyle = color;
        ctx.fillRect(ci * scale, ri * scale, scale, scale);
      }),
    );
    const link = document.createElement('a');
    link.download = `kidsverse-pixel-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [pixels, gridSize]);

  if (!mounted || pixels.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kids-offwhite">
        <motion.div className="text-6xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🟦</motion.div>
      </div>
    );
  }

  const cellSize = Math.min(Math.floor(350 / gridSize), 32);

  return (
    <div className="flex h-screen flex-col bg-kids-offwhite" onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white shadow-kids">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 h-14">
          <button type="button" onClick={() => router.push('/create')} className="flex items-center gap-2 rounded-2xl px-2 py-1 hover:bg-kids-lightgray transition-colors" aria-label="Back">
            <ArrowLeft className="size-5 text-kids-text-secondary" />
          </button>
          <h1 className="font-nunito text-lg font-extrabold text-kids-dark">Pixel Art</h1>
          <div className="flex items-center gap-2">
            <button type="button" onClick={savePixelArt} className="flex h-9 w-9 items-center justify-center rounded-xl bg-kids-grass/10 transition-all hover:bg-kids-grass/20 active:scale-90" aria-label="Save pixel art">
              <Download className="size-4 text-kids-grass" />
            </button>
            <button type="button" onClick={undo} disabled={history.length <= 1} className="flex h-9 w-9 items-center justify-center rounded-xl bg-kids-lightgray/60 transition-all hover:bg-kids-lightgray active:scale-90 disabled:opacity-30" aria-label="Undo">
              <Undo2 className="size-4 text-kids-dark" />
            </button>
            <button type="button" onClick={clearGrid} className="flex h-9 w-9 items-center justify-center rounded-xl bg-kids-coral/10 transition-all hover:bg-kids-coral/20 active:scale-90" aria-label="Clear">
              <Trash2 className="size-4 text-kids-coral" />
            </button>
          </div>
        </div>
      </header>

      {/* Grid size selector */}
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-b border-kids-lightgray/50">
        {GRID_SIZES.map((g) => (
          <button
            key={g.label}
            type="button"
            onClick={() => changeGridSize(g.size)}
            className={cn(
              'px-3 py-1 rounded-lg font-nunito font-bold text-xs transition-all active:scale-90',
              gridSize === g.size ? 'bg-kids-sky text-white' : 'bg-kids-lightgray/60 text-kids-text-secondary',
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Pixel Grid */}
      <div className="flex-1 flex items-center justify-center px-4 py-3">
        <div
          className="grid bg-gray-200 rounded-lg overflow-hidden shadow-kids-lg"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
            gap: '1px',
          }}
        >
          {pixels.map((row, ri) =>
            row.map((cellColor, ci) => (
              <div
                key={`${ri}-${ci}`}
                className="cursor-pointer transition-none touch-none"
                style={{ backgroundColor: cellColor, width: cellSize, height: cellSize }}
                onPointerDown={(e) => { e.preventDefault(); handlePointerDown(ri, ci); }}
                onPointerEnter={() => handlePointerEnter(ri, ci)}
              />
            )),
          )}
        </div>
      </div>

      {/* Tools & Colors */}
      <div className="sticky bottom-0 bg-white border-t border-kids-lightgray shadow-sm pb-[env(safe-area-inset-bottom)]">
        {/* Tool selector */}
        <div className="flex items-center justify-center gap-3 px-4 pt-3 pb-2">
          <button
            type="button"
            onClick={() => setTool('paint')}
            className={cn(
              'px-4 py-1.5 rounded-xl font-nunito font-bold text-sm transition-all',
              tool === 'paint' ? 'bg-kids-sky text-white shadow-kids' : 'bg-kids-lightgray/60 text-kids-text-secondary',
            )}
          >
            ✏️ Paint
          </button>
          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={cn(
              'px-4 py-1.5 rounded-xl font-nunito font-bold text-sm transition-all',
              tool === 'eraser' ? 'bg-kids-sky text-white shadow-kids' : 'bg-kids-lightgray/60 text-kids-text-secondary',
            )}
          >
            ⬜ Eraser
          </button>
        </div>

        {/* Color palette */}
        <div className="flex items-center justify-center gap-1.5 px-3 pb-3 overflow-x-auto flex-wrap max-h-20">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setColor(c); setTool('paint'); }}
              className={cn(
                'h-7 w-7 flex-shrink-0 rounded-lg border-2 transition-all active:scale-90',
                color === c && tool === 'paint' ? 'border-kids-dark scale-110 shadow-md' : 'border-transparent',
              )}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
