'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Sparkles, Crown } from 'lucide-react';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsBadge } from '@/components/kids/kids-badge';
import { KidsButton } from '@/components/kids/kids-button';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PremiumLockProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  features?: string[];
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 22 },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const lockBounce = {
  y: [0, -8, 0],
  rotate: [0, -10, 10, 0],
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
};

const sparkleDrift = {
  y: [0, -12, 0],
  opacity: [0.3, 1, 0.3],
  transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
};

/* ------------------------------------------------------------------ */
/*  Feature list item                                                  */
/* ------------------------------------------------------------------ */

function FeatureItem({ text, icon }: { text: string; icon: string }) {
  return (
    <motion.li
      className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-2.5"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
    >
      <span className="text-xl flex-shrink-0" aria-hidden="true">{icon}</span>
      <span className="font-nunito font-bold text-sm text-kids-dark">{text}</span>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/*  PremiumLock Component                                              */
/* ------------------------------------------------------------------ */

export function PremiumLock({
  isOpen,
  onClose,
  title = 'This is a Premium activity!',
  features = [
    'Unlimited games & activities',
    'All stories and videos',
    'Track progress & earn badges',
  ],
}: PremiumLockProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Decorative sparkles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <motion.span
              className="absolute left-[15%] top-[20%] text-2xl"
              animate={sparkleDrift}
              style={{ transition: { ...sparkleDrift.transition, delay: 0 } }}
            >
              ✨
            </motion.span>
            <motion.span
              className="absolute right-[18%] top-[15%] text-xl"
              animate={sparkleDrift}
              style={{ transition: { ...sparkleDrift.transition, delay: 0.6 } }}
            >
              ⭐
            </motion.span>
            <motion.span
              className="absolute left-[25%] bottom-[25%] text-lg"
              animate={sparkleDrift}
              style={{ transition: { ...sparkleDrift.transition, delay: 1.2 } }}
            >
              🌟
            </motion.span>
            <motion.span
              className="absolute right-[20%] bottom-[30%] text-2xl"
              animate={sparkleDrift}
              style={{ transition: { ...sparkleDrift.transition, delay: 0.8 } }}
            >
              ✨
            </motion.span>
          </div>

          {/* Modal card */}
          <motion.div
            className="relative z-10 w-full max-w-sm"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-2 -right-2 z-20 flex size-8 items-center justify-center rounded-full bg-white shadow-kids text-kids-text-secondary hover:text-kids-dark hover:bg-kids-lightgray transition-colors"
              aria-label="Close premium dialog"
            >
              <X className="size-4" />
            </button>

            <KidsCard
              variant="elevated"
              color="lavender"
              padding="lg"
              className="flex flex-col items-center text-center gap-4"
            >
              {/* Animated lock icon */}
              <motion.div
                className="relative"
                animate={lockBounce}
              >
                <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-kids-lavender to-kids-purple shadow-kids-lg">
                  <Lock className="size-9 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full bg-kids-sun"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Crown className="size-4 text-white" />
                </motion.div>
              </motion.div>

              {/* Title */}
              <div className="flex flex-col items-center gap-1.5">
                <KidsBadge variant="purple" size="md">
                  <Sparkles className="size-3.5" />
                  Premium
                </KidsBadge>
                <h2 className="text-xl font-nunito font-extrabold text-kids-dark">
                  {title}
                </h2>
                <p className="text-sm text-kids-text-secondary leading-relaxed">
                  Unlock this and many more fun activities with KidsVerse Premium!
                </p>
              </div>

              {/* Features list */}
              <ul className="w-full flex flex-col gap-2 text-left">
                {features.map((feature, i) => (
                  <FeatureItem
                    key={i}
                    text={feature}
                    icon={i === 0 ? '🎮' : i === 1 ? '📖' : '🏅'}
                  />
                ))}
              </ul>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 w-full mt-1">
                <KidsButton
                  variant="special"
                  size="early"
                  className="w-full"
                  onClick={() => {
                    onClose();
                    window.location.href = '/parent/subscription';
                  }}
                  leftIcon={<span aria-hidden="true">{'👑'}</span>}
                >
                  Upgrade Now
                </KidsButton>
                <KidsButton
                  variant="outline"
                  size="early"
                  className="w-full"
                  onClick={onClose}
                  leftIcon={<span aria-hidden="true">{'👨‍👩‍👧'}</span>}
                >
                  Ask Parent
                </KidsButton>
              </div>
            </KidsCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
