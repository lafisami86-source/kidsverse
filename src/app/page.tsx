'use client';

import { motion } from 'framer-motion';
import {
  KidsButton,
  SectionCard,
} from '@/components/kids';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50">
      {/* Hero Section */}
      <header className="relative overflow-hidden py-12 sm:py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-4xl sm:text-6xl lg:text-7xl font-nunito font-black text-gradient-rainbow leading-tight"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            KidsVerse
          </motion.h1>
          <p className="mt-4 text-lg sm:text-xl text-kids-text-secondary font-nunito max-w-2xl mx-auto">
            A safe, fun, and educational platform for children ages 2–10.
            Learn, play, watch, create, and explore!
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/kids">
              <KidsButton variant="rainbow" size="early" sound="pop">
                Start Learning 🚀
              </KidsButton>
            </Link>
            <Link href="/parent/login">
              <KidsButton variant="outline" size="early" sound="click">
                Parent Login 👨‍👩‍👧
              </KidsButton>
            </Link>
          </div>
        </motion.div>
      </header>

      {/* Section Navigation Cards */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl sm:text-3xl font-nunito font-bold text-kids-dark text-center mb-8">
          Explore KidsVerse
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          <SectionCard
            section="learn"
            icon="📚"
            label="Learn"
            description="Alphabet, numbers, and more"
            colorClass="bg-gradient-to-br from-sky-100 to-blue-200"
            href="/learn"
            delay={0}
          />
          <SectionCard
            section="play"
            icon="🎮"
            label="Play"
            description="Fun educational games"
            colorClass="bg-gradient-to-br from-green-100 to-emerald-200"
            href="/play"
            delay={0.1}
          />
          <SectionCard
            section="watch"
            icon="📺"
            label="Watch"
            description="Curated kid-safe videos"
            colorClass="bg-gradient-to-br from-rose-100 to-pink-200"
            href="/watch"
            delay={0.2}
          />
          <SectionCard
            section="create"
            icon="🎨"
            label="Create"
            description="Draw and color"
            colorClass="bg-gradient-to-br from-amber-100 to-yellow-200"
            href="/create"
            delay={0.3}
          />
          <SectionCard
            section="stories"
            icon="📖"
            label="Stories"
            description="Animated storybooks"
            colorClass="bg-gradient-to-br from-violet-100 to-purple-200"
            href="/stories"
            delay={0.4}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-kids-dark text-white py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-nunito font-bold text-xl">KidsVerse</p>
          <p className="text-sm text-white/60 mt-2">
            A safe, fun, and educational platform for children ages 2–10.
          </p>
          <p className="text-xs text-white/40 mt-4">
            COPPA Compliant · WCAG 2.1 AA · No third-party ads
          </p>
        </div>
      </footer>
    </div>
  );
}
