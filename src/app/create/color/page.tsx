'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = [
  '#FF6B6B', '#FF8E53', '#FFD93D', '#6BCB77', '#4D96FF',
  '#9B59B6', '#FF69B4', '#1E293B', '#E74C3C', '#3498DB',
  '#2ECC71', '#F39C12', '#8E44AD', '#FFFFFF', '#95A5A6',
];

/* Simple SVG coloring pages — each region has an id and can be filled */
interface ColoringPage {
  id: string;
  title: string;
  emoji: string;
  svgContent: React.ReactNode;
}

const COLORING_PAGES: ColoringPage[] = [
  {
    id: 'butterfly',
    title: 'Butterfly',
    emoji: '🦋',
    svgContent: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <rect id="bg-butterfly" fill="#FFFFFF" x="0" y="0" width="200" height="200" />
        {/* Left wing top */}
        <path id="lwt" d="M100,80 Q60,20 30,60 Q10,90 50,100 Q80,105 100,80" fill="#E8E8E8" stroke="#333" strokeWidth="2" />
        {/* Left wing bottom */}
        <path id="lwb" d="M100,120 Q70,130 40,150 Q20,170 50,170 Q80,165 100,120" fill="#E8E8E8" stroke="#333" strokeWidth="2" />
        {/* Right wing top */}
        <path id="rwt" d="M100,80 Q140,20 170,60 Q190,90 150,100 Q120,105 100,80" fill="#E8E8E8" stroke="#333" strokeWidth="2" />
        {/* Right wing bottom */}
        <path id="rwb" d="M100,120 Q130,130 160,150 Q180,170 150,170 Q120,165 100,120" fill="#E8E8E8" stroke="#333" strokeWidth="2" />
        {/* Body */}
        <ellipse id="body" cx="100" cy="110" rx="6" ry="40" fill="#DDD" stroke="#333" strokeWidth="2" />
        {/* Head */}
        <circle id="head" cx="100" cy="65" r="10" fill="#DDD" stroke="#333" strokeWidth="2" />
        {/* Antennae */}
        <path d="M96,58 Q80,30 75,25" fill="none" stroke="#333" strokeWidth="2" />
        <circle id="ant-l" cx="75" cy="25" r="3" fill="#DDD" stroke="#333" strokeWidth="2" />
        <path d="M104,58 Q120,30 125,25" fill="none" stroke="#333" strokeWidth="2" />
        <circle id="ant-r" cx="125" cy="25" r="3" fill="#DDD" stroke="#333" strokeWidth="2" />
        {/* Wing spots */}
        <circle id="spot1" cx="55" cy="65" r="8" fill="#F0F0F0" stroke="#333" strokeWidth="1" />
        <circle id="spot2" cx="145" cy="65" r="8" fill="#F0F0F0" stroke="#333" strokeWidth="1" />
        <circle id="spot3" cx="65" cy="145" r="6" fill="#F0F0F0" stroke="#333" strokeWidth="1" />
        <circle id="spot4" cx="135" cy="145" r="6" fill="#F0F0F0" stroke="#333" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'house',
    title: 'House',
    emoji: '🏠',
    svgContent: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <rect id="bg-house" fill="#FFFFFF" x="0" y="0" width="200" height="200" />
        {/* Sky */}
        <rect id="sky" fill="#E8F4FD" x="0" y="0" width="200" height="120" />
        {/* Ground */}
        <rect id="ground" fill="#C8E6C9" x="0" y="140" width="200" height="60" />
        {/* Sun */}
        <circle id="sun" cx="170" cy="35" r="20" fill="#FFF9C4" stroke="#FFD93D" strokeWidth="2" />
        {/* Roof */}
        <polygon id="roof" points="100,30 30,100 170,100" fill="#E0E0E0" stroke="#333" strokeWidth="2" />
        {/* Wall */}
        <rect id="wall" x="45" y="100" width="110" height="70" fill="#F5F5F5" stroke="#333" strokeWidth="2" />
        {/* Door */}
        <rect id="door" x="82" y="125" width="36" height="45" rx="3" fill="#D7CCC8" stroke="#333" strokeWidth="2" />
        <circle id="knob" cx="110" cy="150" r="3" fill="#FFD93D" stroke="#333" strokeWidth="1" />
        {/* Window left */}
        <rect id="win-l" x="55" y="110" width="20" height="20" rx="2" fill="#B3E5FC" stroke="#333" strokeWidth="2" />
        <line x1="65" y1="110" x2="65" y2="130" stroke="#333" strokeWidth="1" />
        <line x1="55" y1="120" x2="75" y2="120" stroke="#333" strokeWidth="1" />
        {/* Window right */}
        <rect id="win-r" x="125" y="110" width="20" height="20" rx="2" fill="#B3E5FC" stroke="#333" strokeWidth="2" />
        <line x1="135" y1="110" x2="135" y2="130" stroke="#333" strokeWidth="1" />
        <line x1="125" y1="120" x2="145" y2="120" stroke="#333" strokeWidth="1" />
        {/* Chimney */}
        <rect id="chimney" x="130" y="45" width="20" height="35" fill="#BCAAA4" stroke="#333" strokeWidth="2" />
        {/* Cloud */}
        <ellipse id="cloud" cx="40" cy="40" rx="25" ry="12" fill="#FFFFFF" stroke="#BDBDBD" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'fish',
    title: 'Fish',
    emoji: '🐟',
    svgContent: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <rect id="bg-fish" fill="#E3F2FD" x="0" y="0" width="200" height="200" />
        {/* Bubbles */}
        <circle id="bub1" cx="45" cy="60" r="5" fill="#BBDEFB" stroke="#90CAF9" strokeWidth="1" />
        <circle id="bub2" cx="35" cy="45" r="3" fill="#BBDEFB" stroke="#90CAF9" strokeWidth="1" />
        <circle id="bub3" cx="55" cy="40" r="4" fill="#BBDEFB" stroke="#90CAF9" strokeWidth="1" />
        {/* Water waves */}
        <path id="wave1" d="M0,160 Q25,150 50,160 Q75,170 100,160 Q125,150 150,160 Q175,170 200,160 L200,200 L0,200 Z" fill="#B3E5FC" />
        <path id="wave2" d="M0,175 Q25,165 50,175 Q75,185 100,175 Q125,165 150,175 Q175,185 200,175 L200,200 L0,200 Z" fill="#81D4FA" />
        {/* Tail */}
        <path id="tail" d="M40,100 Q15,75 20,100 Q15,125 40,100" fill="#E0E0E0" stroke="#333" strokeWidth="2" />
        {/* Body */}
        <ellipse id="fish-body" cx="95" cy="100" rx="60" ry="35" fill="#F5F5F5" stroke="#333" strokeWidth="2" />
        {/* Fin top */}
        <path id="fin-top" d="M80,65 Q90,40 110,65" fill="#E0E0E0" stroke="#333" strokeWidth="2" />
        {/* Fin bottom */}
        <path id="fin-bot" d="M85,135 Q95,160 110,135" fill="#E0E0E0" stroke="#333" strokeWidth="2" />
        {/* Eye */}
        <circle id="eye-white" cx="120" cy="90" r="10" fill="#FFFFFF" stroke="#333" strokeWidth="2" />
        <circle id="eye-pupil" cx="123" cy="90" r="5" fill="#333" />
        {/* Mouth */}
        <path id="mouth" d="M150,100 Q155,105 150,110" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        {/* Scales */}
        <circle id="scale1" cx="80" cy="95" r="8" fill="none" stroke="#CCC" strokeWidth="1" />
        <circle id="scale2" cx="95" cy="105" r="8" fill="none" stroke="#CCC" strokeWidth="1" />
        <circle id="scale3" cx="110" cy="95" r="8" fill="none" stroke="#CCC" strokeWidth="1" />
        <circle id="scale4" cx="75" cy="110" r="8" fill="none" stroke="#CCC" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'flower',
    title: 'Flower',
    emoji: '🌸',
    svgContent: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <rect id="bg-flower" fill="#F1F8E9" x="0" y="0" width="200" height="200" />
        {/* Pot */}
        <path id="pot" d="M70,150 L75,190 L125,190 L130,150 Z" fill="#D7CCC8" stroke="#333" strokeWidth="2" />
        <rect id="pot-rim" x="65" y="145" width="70" height="10" rx="3" fill="#BCAAA4" stroke="#333" strokeWidth="2" />
        {/* Stem */}
        <rect id="stem" x="97" y="70" width="6" height="80" fill="#81C784" stroke="#333" strokeWidth="1" />
        {/* Leaf left */}
        <path id="leaf-l" d="M97,120 Q70,105 60,120 Q70,130 97,120" fill="#A5D6A7" stroke="#333" strokeWidth="2" />
        {/* Leaf right */}
        <path id="leaf-r" d="M103,130 Q130,115 140,130 Q130,140 103,130" fill="#A5D6A7" stroke="#333" strokeWidth="2" />
        {/* Petals */}
        <ellipse id="petal-t" cx="100" cy="35" rx="15" ry="25" fill="#F8BBD0" stroke="#333" strokeWidth="2" />
        <ellipse id="petal-r" cx="140" cy="55" rx="15" ry="25" fill="#F8BBD0" stroke="#333" strokeWidth="2" transform="rotate(45 140 55)" />
        <ellipse id="petal-b" cx="100" cy="80" rx="15" ry="25" fill="#F8BBD0" stroke="#333" strokeWidth="2" />
        <ellipse id="petal-l" cx="60" cy="55" rx="15" ry="25" fill="#F8BBD0" stroke="#333" strokeWidth="2" transform="rotate(-45 60 55)" />
        {/* Center */}
        <circle id="center" cx="100" cy="57" r="15" fill="#FFF9C4" stroke="#333" strokeWidth="2" />
      </svg>
    ),
  },
];

export default function ColorPages() {
  const router = useRouter();
  const [color, setColor] = useState('#FF6B6B');
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [tool, setTool] = useState<'fill' | 'eraser'>('fill');
  const svgRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  const currentPage = COLORING_PAGES[currentPageIdx];

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const target = e.target as SVGElement;
      if (tool === 'eraser') {
        if (target.id && target.id.startsWith('bg-')) return;
        if (target.tagName !== 'svg' && target.id) {
          target.setAttribute('fill', '#FFFFFF');
        }
        return;
      }
      if (target.tagName === 'svg') return;
      if (target.tagName === 'line' || target.tagName === 'circle' && target.id.includes('eye-pupil')) return;
      target.setAttribute('fill', color);
    },
    [color, tool],
  );

  const handleNextPage = useCallback(() => {
    setCurrentPageIdx((i) => (i + 1) % COLORING_PAGES.length);
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPageIdx((i) => (i - 1 + COLORING_PAGES.length) % COLORING_PAGES.length);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kids-offwhite">
        <motion.div className="text-6xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🖍️</motion.div>
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
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentPage.emoji}</span>
            <h1 className="font-nunito text-lg font-extrabold text-kids-dark">{currentPage.title}</h1>
          </div>
          <span className="text-xs font-nunito font-bold text-kids-text-secondary">{currentPageIdx + 1}/{COLORING_PAGES.length}</span>
        </div>
      </header>

      {/* SVG Canvas */}
      <div className="flex-1 flex items-center justify-center px-4 py-3">
        <motion.div
          key={currentPage.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm aspect-square rounded-2xl bg-white shadow-kids-lg overflow-hidden cursor-pointer"
        >
          <svg
            ref={svgRef}
            viewBox="0 0 200 200"
            className="w-full h-full"
            onClick={handleSvgClick}
          >
            {React.cloneElement(currentPage.svgContent as React.ReactElement)}
          </svg>
        </motion.div>
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-center gap-4 px-4 py-1">
        <button type="button" onClick={handlePrevPage} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-kids active:scale-90 transition-all" aria-label="Previous page">
          <ChevronLeft className="size-5 text-kids-dark" />
        </button>
        <div className="flex gap-1.5">
          {COLORING_PAGES.map((_, i) => (
            <div key={i} className={cn('w-2 h-2 rounded-full transition-all', i === currentPageIdx ? 'bg-kids-coral scale-125' : 'bg-kids-lightgray')} />
          ))}
        </div>
        <button type="button" onClick={handleNextPage} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-kids active:scale-90 transition-all" aria-label="Next page">
          <ChevronRight className="size-5 text-kids-dark" />
        </button>
      </div>

      {/* Tools & Colors */}
      <div className="sticky bottom-0 bg-white border-t border-kids-lightgray shadow-sm pb-[env(safe-area-inset-bottom)]">
        {/* Tool selector */}
        <div className="flex items-center justify-center gap-3 px-4 pt-3 pb-2">
          <button
            type="button"
            onClick={() => setTool('fill')}
            className={cn(
              'px-4 py-1.5 rounded-xl font-nunito font-bold text-sm transition-all',
              tool === 'fill' ? 'bg-kids-coral text-white shadow-kids' : 'bg-kids-lightgray/60 text-kids-text-secondary',
            )}
          >
            🪣 Fill
          </button>
          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={cn(
              'px-4 py-1.5 rounded-xl font-nunito font-bold text-sm transition-all',
              tool === 'eraser' ? 'bg-kids-coral text-white shadow-kids' : 'bg-kids-lightgray/60 text-kids-text-secondary',
            )}
          >
            ⬜ Eraser
          </button>
        </div>

        {/* Color palette */}
        <div className="flex items-center justify-center gap-2 px-4 pb-3 overflow-x-auto">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setColor(c); setTool('fill'); }}
              className={cn(
                'h-8 w-8 flex-shrink-0 rounded-full border-2 transition-all active:scale-90',
                color === c && tool === 'fill' ? 'border-kids-dark scale-110 shadow-md' : 'border-transparent',
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
