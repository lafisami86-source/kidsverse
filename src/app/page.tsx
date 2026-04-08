'use client';

import { motion } from 'framer-motion';
import {
  KidsButton,
  KidsCard,
  KidsBadge,
  KidsProgressBar,
  KidsModal,
  StarBadge,
  SectionCard,
  AudioToggle,
} from '@/components/kids';
import { useState } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50">
      <AudioToggle position="top-right" size="lg" showLabel />

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
            <KidsButton variant="rainbow" size="early" sound="pop">
              Start Learning 🚀
            </KidsButton>
            <KidsButton variant="outline" size="early" sound="click">
              Parent Login 👨‍👩‍👧
            </KidsButton>
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

      {/* Design System Showcase */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl sm:text-3xl font-nunito font-bold text-kids-dark text-center mb-8">
          Design System Components
        </h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Buttons Showcase */}
          <motion.div variants={item}>
            <KidsCard variant="elevated" title="🎨 KidsButton" description="Child-friendly button with sound feedback and animations">
              <div className="flex flex-wrap gap-3">
                <KidsButton variant="primary" size="sm">Primary</KidsButton>
                <KidsButton variant="success" size="sm">Success</KidsButton>
                <KidsButton variant="accent" size="sm">Accent</KidsButton>
                <KidsButton variant="danger" size="sm">Danger</KidsButton>
                <KidsButton variant="outline" size="sm">Outline</KidsButton>
                <KidsButton variant="ghost" size="sm">Ghost</KidsButton>
                <KidsButton variant="special" size="sm">Special</KidsButton>
                <KidsButton variant="rainbow" size="sm">Rainbow</KidsButton>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <KidsButton variant="primary" size="toddler">Toddler</KidsButton>
                <KidsButton variant="success" size="early">Early</KidsButton>
                <KidsButton variant="accent" size="kid">Kid</KidsButton>
              </div>
            </KidsCard>
          </motion.div>

          {/* Badges Showcase */}
          <motion.div variants={item}>
            <KidsCard variant="elevated" title="⭐ KidsBadge" description="Achievement badges with animated entrance">
              <div className="flex flex-wrap gap-3">
                <KidsBadge variant="default">Default</KidsBadge>
                <KidsBadge variant="success">Success</KidsBadge>
                <KidsBadge variant="gold" icon="🏆">Gold</KidsBadge>
                <KidsBadge variant="danger">Danger</KidsBadge>
                <KidsBadge variant="purple" icon="✨">Purple</KidsBadge>
                <KidsBadge variant="pink">Pink</KidsBadge>
                <KidsBadge variant="mint">Mint</KidsBadge>
                <KidsBadge variant="outline">Outline</KidsBadge>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 items-center">
                <KidsBadge variant="gold" isAchievement icon="🌟" glow earned>
                  First Steps
                </KidsBadge>
                <KidsBadge variant="purple" isAchievement icon="🔤" glow earned>
                  Letter Learner
                </KidsBadge>
                <KidsBadge variant="muted" earned={false}>
                  Locked
                </KidsBadge>
              </div>
            </KidsCard>
          </motion.div>

          {/* Progress Bars Showcase */}
          <motion.div variants={item}>
            <KidsCard variant="elevated" title="📊 KidsProgressBar" description="Animated progress bars with star milestones">
              <div className="space-y-5">
                <div>
                  <KidsProgressBar value={25} showLabel showStars color="auto" label="Getting started" />
                </div>
                <div>
                  <KidsProgressBar value={60} showLabel showStars color="sky" label="Halfway there!" />
                </div>
                <div>
                  <KidsProgressBar value={100} showLabel showStars color="grass" label="All done! 🎉" />
                </div>
                <div className="flex gap-4">
                  <KidsProgressBar value={75} size="sm" color="coral" />
                  <KidsProgressBar value={50} size="md" color="lavender" />
                  <KidsProgressBar value={90} size="lg" color="rainbow" />
                </div>
              </div>
            </KidsCard>
          </motion.div>

          {/* Star Badges Showcase */}
          <motion.div variants={item}>
            <KidsCard variant="elevated" title="🌟 StarBadge" description="Star ratings with animations">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <StarBadge count={1} size={32} />
                  <StarBadge count={2} size={32} />
                  <StarBadge count={3} size={32} />
                  <StarBadge count={4} size={32} />
                  <StarBadge count={5} size={32} />
                </div>
                <div className="flex items-center gap-6">
                  <StarBadge count={3} size={40} interactive />
                  <StarBadge count={5} size={48} interactive />
                </div>
              </div>
            </KidsCard>
          </motion.div>

          {/* Cards Showcase */}
          <motion.div variants={item}>
            <KidsCard variant="elevated" title="🃏 KidsCard" description="Animated cards with interactive variants">
              <div className="grid grid-cols-2 gap-3">
                <KidsCard variant="default" color="sky" padding="sm" icon="🌊">
                  <span className="text-xs font-nunito">Default Card</span>
                </KidsCard>
                <KidsCard variant="elevated" color="grass" padding="sm" icon="🌿">
                  <span className="text-xs font-nunito">Elevated Card</span>
                </KidsCard>
                <KidsCard variant="featured" color="sun" padding="sm" icon="☀️">
                  <span className="text-xs font-nunito">Featured Card</span>
                </KidsCard>
                <KidsCard variant="interactive" color="coral" padding="sm" icon="🔥" onClick={() => {}}>
                  <span className="text-xs font-nunito">Interactive Card</span>
                </KidsCard>
              </div>
            </KidsCard>
          </motion.div>

          {/* Modal Showcase */}
          <motion.div variants={item}>
            <KidsCard variant="elevated" title="💬 KidsModal" description="Animated dialog with focus trap and ESC close">
              <p className="text-sm text-kids-text-secondary mb-4">
                Click the button to see the modal in action. It features spring animations,
                focus trapping, and child-safe overlay tap protection.
              </p>
              <KidsButton variant="special" size="early" onClick={() => setShowModal(true)}>
                Open Modal ✨
              </KidsButton>
            </KidsCard>
          </motion.div>
        </motion.div>
      </section>

      {/* Audio Toggle Demo */}
      <section className="max-w-5xl mx-auto px-4 py-8 pb-16 text-center">
        <p className="text-sm text-kids-text-secondary font-nunito">
          🔊 Try the audio toggle in the top-right corner — all interactive elements have optional sound feedback!
        </p>
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

      {/* Modal */}
      <KidsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="🎉 Great Job!"
        description="You earned a new achievement!"
        size="md"
        closeButtonSize="lg"
      >
        <div className="text-center py-4">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏆
          </motion.div>
          <StarBadge count={5} size={48} />
          <p className="mt-4 text-kids-text-secondary font-nunito">
            You completed the alphabet module! Keep up the amazing work!
          </p>
        </div>
        <KidsButton variant="rainbow" size="early" onClick={() => setShowModal(false)} className="w-full mt-4">
          Continue Learning! 📚
        </KidsButton>
      </KidsModal>
    </div>
  );
}
