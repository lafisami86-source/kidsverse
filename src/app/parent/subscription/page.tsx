'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Check,
  Star,
  Sparkles,
  Users,
  BookOpen,
  Gamepad2,
  BookText,
  Palette,
  Video,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

interface PlanFeature {
  label: string;
  icon: React.ElementType;
  free: string;
  premium: string;
  freeIncluded: boolean;
  premiumIncluded: boolean;
}

const features: PlanFeature[] = [
  {
    label: 'Child Profiles',
    icon: Users,
    free: '2 profiles',
    premium: '5 profiles',
    freeIncluded: true,
    premiumIncluded: true,
  },
  {
    label: 'Learning Modules',
    icon: BookOpen,
    free: 'Basic only',
    premium: 'All modules',
    freeIncluded: true,
    premiumIncluded: true,
  },
  {
    label: 'Educational Games',
    icon: Gamepad2,
    free: '1 game',
    premium: 'All games',
    freeIncluded: true,
    premiumIncluded: true,
  },
  {
    label: 'Interactive Stories',
    icon: BookText,
    free: '3 stories',
    premium: 'Unlimited',
    freeIncluded: true,
    premiumIncluded: true,
  },
  {
    label: 'Creative Studio',
    icon: Palette,
    free: 'Basic tools',
    premium: 'Full creative suite',
    freeIncluded: true,
    premiumIncluded: true,
  },
  {
    label: 'Video Library',
    icon: Video,
    free: '—',
    premium: 'Full access',
    freeIncluded: false,
    premiumIncluded: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const crownVariants = {
  animate: {
    rotate: [0, -6, 6, -4, 4, 0],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

const sparkleFloat = (i: number) => ({
  animate: {
    y: [0, -12, 0],
    opacity: [0.4, 1, 0.4],
    scale: [0.8, 1.2, 0.8],
    rotate: [0, 180, 360],
    transition: {
      duration: 2.4,
      repeat: Infinity,
      delay: i * 0.5,
      ease: 'easeInOut',
    },
  },
});

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SparkleDot({ index }: { index: number }) {
  const offsets = [
    'top-0 right-8',
    'top-4 -left-3',
    'bottom-2 right-4',
    '-top-2 left-1/2',
  ];

  return (
    <motion.span
      className={`absolute ${offsets[index % offsets.length]} pointer-events-none`}
      {...sparkleFloat(index)}
    >
      <Sparkles className="size-3 text-kids-sun" />
    </motion.span>
  );
}

function CurrentPlanCard() {
  return (
    <motion.div variants={itemVariants}>
      <div className="bg-gradient-to-r from-kids-sky/10 via-kids-lavender/10 to-kids-mint/10 border border-kids-sky/20 rounded-2xl shadow-kids p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-kids-sky/20">
              <Shield className="size-5 text-kids-sky" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-nunito">Current Plan</p>
              <h2 className="text-lg font-bold text-foreground font-nunito leading-tight">
                Explorer (Free)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-nunito">Billing cycle</p>
              <p className="text-sm font-semibold text-foreground font-nunito">
                Free forever
              </p>
            </div>
            <Badge className="bg-kids-mint/20 text-green-700 border-kids-mint/30 font-nunito text-xs">
              <Zap className="size-3 mr-1" />
              Active
            </Badge>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-kids-sky/10">
          <p className="text-sm text-muted-foreground font-nunito">
            You&apos;re using <span className="font-semibold text-foreground">1 of 2 profiles</span>.
            Upgrade to Explorer Pro to unlock more profiles, games, stories, and the full video library.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function PlanCardSkeleton({
  name,
  subtitle,
  price,
  description,
  features: planFeatures,
  isPremium,
  isCurrentPlan,
}: {
  name: string;
  subtitle: string;
  price: string;
  description: string;
  features: PlanFeature[];
  isPremium: boolean;
  isCurrentPlan: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`
          relative flex flex-col h-full rounded-2xl p-6 border-2 font-nunito
          ${
            isPremium
              ? 'bg-gradient-to-br from-white via-kids-sun/5 to-kids-peach/5 border-kids-sun shadow-kids-glow-sun'
              : 'bg-white border-muted shadow-kids'
          }
          transition-shadow duration-300
          ${isHovered && isPremium ? 'shadow-kids-glow-sun' : ''}
        `}
        whileHover={isPremium ? { scale: 1.02 } : { scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Premium crown + sparkles */}
        {isPremium && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 relative">
            {Array.from({ length: 4 }).map((_, i) => (
              <SparkleDot key={i} index={i} />
            ))}
            <motion.div
              className="relative z-10 flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-kids-sun to-kids-peach shadow-kids-lg"
              variants={crownVariants}
              animate="animate"
            >
              <Crown className="size-5 text-white" />
            </motion.div>
          </div>
        )}

        {/* Most Popular ribbon */}
        {isPremium && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-kids-sun to-kids-peach text-white border-0 font-nunito text-[10px] px-2.5 py-0.5">
              <Star className="size-3 mr-1" />
              Most Popular
            </Badge>
          </div>
        )}

        {/* Header */}
        <div className={isPremium ? 'mt-4' : ''}>
          <h3
            className={`text-xl font-bold font-nunito leading-tight ${
              isPremium ? 'text-kids-sun' : 'text-foreground'
            }`}
          >
            {name}
          </h3>
          <p className="text-sm text-muted-foreground font-nunito mt-0.5">{subtitle}</p>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-1">
          <span
            className={`text-3xl font-extrabold font-nunito leading-none ${
              isPremium ? 'text-foreground' : 'text-foreground'
            }`}
          >
            {price}
          </span>
          {isPremium && (
            <span className="text-sm text-muted-foreground font-nunito">/mo</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground font-nunito mt-1.5">{description}</p>

        {/* Divider */}
        <div className="my-5 border-t border-muted/60" />

        {/* Feature list */}
        <ul className="flex flex-col gap-3 flex-1">
          {planFeatures.map((feat) => {
            const included = isPremium ? feat.premiumIncluded : feat.freeIncluded;
            const value = isPremium ? feat.premium : feat.free;
            const Icon = feat.icon;

            return (
              <motion.li
                key={feat.label}
                className="flex items-start gap-2.5"
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
              >
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                    included
                      ? 'bg-kids-grass/15 text-kids-grass'
                      : 'bg-muted text-muted-foreground/50'
                  }`}
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground font-nunito flex items-center gap-1.5">
                    <Icon className="size-3.5 text-muted-foreground" />
                    {feat.label}
                  </span>
                  <span className="text-xs text-muted-foreground font-nunito">
                    {included ? value : 'Not included'}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>

        {/* CTA */}
        <div className="mt-6 pt-5 border-t border-muted/60">
          {isCurrentPlan ? (
            <Badge className="w-full justify-center py-2.5 bg-muted/60 text-muted-foreground border-muted font-nunito text-sm rounded-xl">
              <Check className="size-4 mr-1.5" />
              Current Plan
            </Badge>
          ) : (
            <Button
              className={`
                w-full py-5 rounded-xl font-nunito font-bold text-sm
                bg-gradient-to-r from-kids-sun to-kids-peach
                text-white border-0
                shadow-kids
                hover:shadow-kids-hover hover:brightness-105
                transition-all duration-200
              `}
            >
              Upgrade Now
              <ArrowRight className="size-4 ml-1" />
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function SubscriptionPage() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-background via-background to-kids-sky/5 font-nunito">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-nunito tracking-tight">
            Subscription Management
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground font-nunito max-w-xl mx-auto">
            Choose the plan that best fits your family. Upgrade anytime to unlock the full
            KidsVerse experience.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Current plan banner */}
          <CurrentPlanCard />

          {/* Plan comparison */}
          <div>
            <motion.h2
              className="text-lg font-bold text-foreground font-nunito mb-4"
              variants={itemVariants}
            >
              Compare Plans
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PlanCardSkeleton
                name="Explorer"
                subtitle="Get started for free"
                price="$0"
                description="Perfect for trying out KidsVerse with your little ones."
                features={features}
                isPremium={false}
                isCurrentPlan={true}
              />

              <PlanCardSkeleton
                name="Explorer Pro"
                subtitle="Unlimited fun & learning"
                price="$9.99"
                description="Unlock everything — games, stories, video library, and more."
                features={features}
                isPremium={true}
                isCurrentPlan={false}
              />
            </div>
          </div>

          {/* FAQ / reassurance strip */}
          <motion.div
            className="text-center pt-4 pb-2"
            variants={itemVariants}
          >
            <p className="text-xs text-muted-foreground font-nunito leading-relaxed max-w-md mx-auto">
              All plans include a 7-day free trial of Explorer Pro features.
              Cancel anytime — no questions asked.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
