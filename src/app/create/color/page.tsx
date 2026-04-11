// Coloring Pages
// TODO: Implement coloring pages with selectable images and fill tools

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function ColorPages() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-kids-offwhite">
      {/* Top bar */}
      <header className="sticky top-0 z-40 w-full">
        <div className="mx-auto max-w-2xl">
          <div className="flex h-14 items-center justify-between rounded-b-2xl bg-white px-4 shadow-kids sm:px-6">
            <button type="button" onClick={() => router.push('/create')} className="flex items-center gap-2 rounded-2xl px-2 py-1 transition-colors hover:bg-kids-lightgray" aria-label="Back to Creative Studio">
              <ArrowLeft className="size-5 text-kids-text-secondary" />
            </button>
            <h1 className="font-nunito text-lg font-extrabold text-gradient-rainbow select-none">KidsVerse</h1>
            <span className="text-2xl">🖍️</span>
          </div>
        </div>
      </header>

      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4">
        <motion.span
          className="text-7xl sm:text-8xl"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          🖍️
        </motion.span>
        <motion.h1
          className="text-3xl font-nunito font-extrabold text-kids-dark sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Coloring
        </motion.h1>
        <motion.p
          className="text-center text-kids-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Color beautiful pictures!
          <br />
          Coming soon...
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            type="button"
            onClick={() => router.push('/create')}
            className="rounded-2xl bg-white px-6 py-3 font-nunito font-bold text-kids-dark shadow-kids transition-all hover:scale-105 hover:shadow-kids-hover active:scale-95"
          >
            Back to Studio
          </button>
        </motion.div>
      </main>
    </div>
  );
}
