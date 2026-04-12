'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Undo2, Trash2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = [
  '#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF',
  '#9B59B6', '#FF69B4', '#1E293B', '#FFFFFF', '#95A5A6',
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#8E44AD',
];

const BRUSH_SIZES = [
  { label: 'S', size: 4 },
  { label: 'M', size: 8 },
  { label: 'L', size: 16 },
  { label: 'XL', size: 28 },
];

export default function DrawCanvas() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(8);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(2, 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      saveState();
    }
  }, [mounted]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setHistory((prev) => [...prev.slice(-20), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  }, []);

  const getPos = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      if ('touches' in e) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      }
      return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
    },
    [],
  );

  const startDraw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    },
    [getPos],
  );

  const draw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const pos = getPos(e);
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    },
    [isDrawing, getPos, brushSize, color, tool],
  );

  const endDraw = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  }, [isDrawing, saveState]);

  const undo = useCallback(() => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const prev = history[history.length - 2];
    ctx.putImageData(prev, 0, 0);
    setHistory((h) => h.slice(0, -1));
  }, [history]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
    saveState();
  }, [saveState]);

  const saveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `kidsverse-drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kids-offwhite">
        <motion.div className="text-6xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🖌️</motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-kids-offwhite">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white shadow-kids">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 h-14">
          <button type="button" onClick={() => router.push('/create')} className="flex items-center gap-2 rounded-2xl px-2 py-1 hover:bg-kids-lightgray transition-colors" aria-label="Back">
            <ArrowLeft className="size-5 text-kids-text-secondary" />
          </button>
          <h1 className="font-nunito text-lg font-extrabold text-kids-dark">Free Draw</h1>
          <div className="flex items-center gap-2">
            <button type="button" onClick={saveCanvas} className="flex h-9 w-9 items-center justify-center rounded-xl bg-kids-grass/10 transition-all hover:bg-kids-grass/20 active:scale-90" aria-label="Save drawing">
              <Download className="size-4 text-kids-grass" />
            </button>
            <button type="button" onClick={undo} disabled={history.length <= 1} className="flex h-9 w-9 items-center justify-center rounded-xl bg-kids-lightgray/60 transition-all hover:bg-kids-lightgray active:scale-90 disabled:opacity-30" aria-label="Undo">
              <Undo2 className="size-4 text-kids-dark" />
            </button>
            <button type="button" onClick={clearCanvas} className="flex h-9 w-9 items-center justify-center rounded-xl bg-kids-coral/10 transition-all hover:bg-kids-coral/20 active:scale-90" aria-label="Clear">
              <Trash2 className="size-4 text-kids-coral" />
            </button>
          </div>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative mx-auto w-full max-w-2xl px-2 py-2">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-2xl shadow-kids-lg cursor-crosshair touch-none bg-white"
          style={{ minHeight: '300px' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      {/* Tools */}
      <div className="sticky bottom-0 bg-white border-t border-kids-lightgray shadow-sm pb-[env(safe-area-inset-bottom)]">
        {/* Tool selector */}
        <div className="flex items-center justify-center gap-3 px-4 pt-3 pb-2">
          <button
            type="button"
            onClick={() => setTool('brush')}
            className={cn(
              'px-4 py-1.5 rounded-xl font-nunito font-bold text-sm transition-all',
              tool === 'brush' ? 'bg-kids-sky text-white shadow-kids' : 'bg-kids-lightgray/60 text-kids-text-secondary',
            )}
          >
            🖌️ Brush
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
        <div className="flex items-center justify-center gap-2 px-4 pb-2 overflow-x-auto">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setColor(c); setTool('brush'); }}
              className={cn(
                'h-8 w-8 flex-shrink-0 rounded-full border-2 transition-all active:scale-90',
                color === c && tool === 'brush' ? 'border-kids-dark scale-110 shadow-md' : 'border-transparent',
              )}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>

        {/* Brush size */}
        <div className="flex items-center justify-center gap-3 px-4 pb-3">
          {BRUSH_SIZES.map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => setBrushSize(b.size)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl font-nunito font-bold text-xs transition-all active:scale-90',
                brushSize === b.size ? 'bg-kids-grass text-white shadow-kids' : 'bg-kids-lightgray/60 text-kids-text-secondary',
              )}
              aria-label={`Brush size ${b.label}`}
            >
              <span className="rounded-full bg-current" style={{ width: b.size, height: b.size }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
