'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Users, Award, Clock, Plus, CreditCard, Play,
  Sparkles, BookOpen, Gamepad2, Palette, ChevronRight,
} from 'lucide-react';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsBadge } from '@/components/kids/kids-badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ChildProfileData {
  id: string;
  name: string;
  age: number;
  avatar: string;
  ageGroup: string;
  screenTimeLimit: number;
  contentFilter: string;
  _count?: { badges: number; gameScores: number };
  createdAt: string;
}

interface RecentActivity {
  type: 'badge' | 'game' | 'lesson';
  label: string;
  icon: string;
  time: string;
}

const AGE_GROUP_LABELS: Record<string, string> = {
  toddler: 'Toddler (2-3)',
  early: 'Early (4-6)',
  kid: 'Kid (7-10)',
};

const AGE_GROUP_COLORS: Record<string, 'mint' | 'sun' | 'sky'> = {
  toddler: 'mint',
  early: 'sun',
  kid: 'sky',
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function ParentDashboard() {
  const { data: session } = useSession();
  const [profiles, setProfiles] = useState<ChildProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  const fetchProfiles = useCallback(async () => {
    try {
      // Load localStorage profiles first
      let localProfiles: ChildProfileData[] = [];
      try {
        const raw = localStorage.getItem('kidsverse_profiles');
        if (raw) localProfiles = JSON.parse(raw) as ChildProfileData[];
      } catch { /* ignore */ }

      // Try API
      let apiProfiles: ChildProfileData[] = [];
      try {
        const res = await fetch('/api/child-profiles');
        if (res.ok) {
          const data = await res.json();
          apiProfiles = data.profiles || [];
        }
      } catch { /* API failed — use localStorage */ }

      // Merge: API profiles take precedence
      const apiIds = new Set(apiProfiles.map((p) => p.id));
      const uniqueLocal = localProfiles.filter((p) => !apiIds.has(p.id));
      const merged = [...apiProfiles, ...uniqueLocal];

      // Save merged to localStorage
      try {
        localStorage.setItem('kidsverse_profiles', JSON.stringify(merged));
      } catch { /* ignore */ }

      setProfiles(merged);
    } catch {
      // Final fallback: localStorage only
      try {
        const raw = localStorage.getItem('kidsverse_profiles');
        if (raw) setProfiles(JSON.parse(raw) as ChildProfileData[]);
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    if (!profiles.length) return;
    const generated: RecentActivity[] = [];
    profiles.forEach((p) => {
      if (p._count?.badges) {
        generated.push({
          type: 'badge',
          label: `${p.name} earned a new badge`,
          icon: '🏆',
          time: '2 hours ago',
        });
      }
      if (p._count?.gameScores) {
        generated.push({
          type: 'game',
          label: `${p.name} completed a game`,
          icon: '🎮',
          time: 'Yesterday',
        });
      }
      generated.push({
        type: 'lesson',
        label: `${p.name} practiced a lesson`,
        icon: '📚',
        time: '2 days ago',
      });
    });
    setActivities(generated.slice(0, 5));
  }, [profiles]);

  const totalBadges = profiles.reduce((sum, p) => sum + (p._count?.badges || 0), 0);
  const totalGames = profiles.reduce((sum, p) => sum + (p._count?.gameScores || 0), 0);
  const parentName = session?.user?.name || 'Parent';

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-8 w-52 rounded-2xl" />
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 sm:h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-40 sm:h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
      {/* Welcome Section — Compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-nunito font-black text-kids-dark">
            Welcome back, {parentName}! 👋
          </h1>
          <p className="text-sm text-kids-text-secondary font-nunito mt-0.5">
            Here&apos;s what your kids have been up to.
          </p>
        </div>
      </motion.div>

      {/* Quick Stats — 3 columns on all sizes, compact */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          {
            label: 'Profiles',
            value: profiles.length,
            icon: <Users className="size-5 sm:size-6 text-kids-sky" />,
            bgColor: 'bg-kids-sky/10',
          },
          {
            label: 'Badges',
            value: totalBadges,
            icon: <Award className="size-5 sm:size-6 text-kids-sun" />,
            bgColor: 'bg-kids-sun/10',
          },
          {
            label: 'Games',
            value: totalGames,
            icon: <Clock className="size-5 sm:size-6 text-kids-grass" />,
            bgColor: 'bg-kids-grass/10',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <KidsCard variant="default" padding="sm" color="white">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`flex items-center justify-center size-9 sm:size-11 rounded-xl ${stat.bgColor} shrink-0`}>
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-nunito font-black text-kids-dark leading-tight">{stat.value}</p>
                  <p className="text-xs text-kids-text-secondary font-nunito">{stat.label}</p>
                </div>
              </div>
            </KidsCard>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions — Compact inline */}
      <div className="flex gap-2">
        <motion.a
          href="/parent/profiles"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-kids-sky text-white rounded-xl font-nunito font-bold text-sm shadow-kids hover:bg-kids-blue transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus className="size-4" />
          Add Profile
        </motion.a>
        <motion.a
          href="/parent/subscription"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-kids-lightgray text-kids-text-secondary rounded-xl font-nunito font-bold text-sm hover:border-kids-sky hover:text-kids-sky transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <CreditCard className="size-4" />
          Subscription
        </motion.a>
      </div>

      {/* Child Profile Cards */}
      {profiles.length > 0 ? (
        <section>
          <h2 className="text-lg sm:text-xl font-nunito font-bold text-kids-dark mb-3 flex items-center gap-2">
            <Sparkles className="size-4 sm:size-5 text-kids-sun" />
            Child Profiles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {profiles.map((profile, i) => (
              <motion.div
                key={profile.id}
                custom={i + 3}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <KidsCard variant="interactive" padding="md" color="white">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl sm:text-4xl shrink-0" aria-hidden="true">{profile.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-nunito font-black text-kids-dark truncate">
                        {profile.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <KidsBadge
                          variant={AGE_GROUP_COLORS[profile.ageGroup] || 'muted'}
                          size="sm"
                        >
                          {AGE_GROUP_LABELS[profile.ageGroup] || profile.ageGroup}
                        </KidsBadge>
                        <span className="text-xs text-kids-text-muted font-nunito">
                          Age {profile.age}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 text-xs text-kids-text-secondary font-nunito">
                      <span className="flex items-center gap-1">
                        <Award className="size-3.5 text-kids-sun" />
                        {profile._count?.badges || 0} badges
                      </span>
                      <span className="flex items-center gap-1">
                        <Gamepad2 className="size-3.5 text-kids-grass" />
                        {profile._count?.gameScores || 0} games
                      </span>
                    </div>
                    <motion.a
                      href={`/kids/${profile.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-kids-grass text-white rounded-xl font-nunito font-bold text-xs shadow-kids hover:brightness-110 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="size-3" />
                      Play
                    </motion.a>
                  </div>
                </KidsCard>
              </motion.div>
            ))}
          </div>
        </section>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <KidsCard variant="default" padding="lg" color="white" className="text-center">
            <div className="text-4xl mb-3">🌟</div>
            <h2 className="text-lg font-nunito font-bold text-kids-dark mb-1.5">
              No Profiles Yet
            </h2>
            <p className="text-sm text-kids-text-secondary font-nunito mb-4 max-w-sm mx-auto">
              Create your first child profile to get started with fun learning activities!
            </p>
            <motion.a
              href="/parent/profiles"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-kids-sky text-white rounded-xl font-nunito font-bold shadow-kids hover:bg-kids-blue transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="size-4" />
              Create First Profile
            </motion.a>
          </KidsCard>
        </motion.div>
      )}

      {/* Recent Activity + Learning Categories side by side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Recent Activity — takes 3 cols on desktop */}
        {activities.length > 0 && (
          <section className="lg:col-span-3">
            <h2 className="text-lg sm:text-xl font-nunito font-bold text-kids-dark mb-3 flex items-center gap-2">
              <BookOpen className="size-4 sm:size-5 text-kids-lavender" />
              Recent Activity
            </h2>
            <KidsCard variant="default" padding="none" color="white">
              <div className="divide-y divide-kids-lightgray">
                {activities.map((activity, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <span className="text-lg sm:text-xl" aria-hidden="true">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-nunito font-bold text-kids-dark truncate">
                        {activity.label}
                      </p>
                    </div>
                    <span className="text-xs text-kids-text-muted font-nunito whitespace-nowrap">
                      {activity.time}
                    </span>
                  </motion.div>
                ))}
              </div>
            </KidsCard>
          </section>
        )}

        {/* Learning Categories — takes 2 cols on desktop */}
        <section className={activities.length > 0 ? 'lg:col-span-2' : ''}>
          <h2 className="text-lg sm:text-xl font-nunito font-bold text-kids-dark mb-3 flex items-center gap-2">
            <Palette className="size-4 sm:size-5 text-kids-coral" />
            Learning Categories
          </h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: 'ABC', emoji: '🔤', color: 'sky' as const },
              { label: '123', emoji: '🔢', color: 'grass' as const },
              { label: 'Colors', emoji: '🎨', color: 'coral' as const },
              { label: 'Science', emoji: '🔬', color: 'lavender' as const },
            ].map((cat, i) => (
              <motion.div
                key={cat.label}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <KidsCard variant="interactive" padding="sm" color={cat.color} className="text-center">
                  <div className="text-2xl sm:text-3xl" aria-hidden="true">{cat.emoji}</div>
                  <p className="text-xs sm:text-sm font-nunito font-bold text-kids-dark mt-1">{cat.label}</p>
                </KidsCard>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
