'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Gamepad2,
  BookOpenText,
  Palette,
  Tv,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenTime } from '@/hooks/use-screen-time';
import { useTheme } from '@/hooks/use-theme';
import { AudioToggle } from '@/components/kids/audio-button';
import { KidsBadge } from '@/components/kids/kids-badge';
import { KidsModal } from '@/components/kids/kids-modal';
import { KidsButton } from '@/components/kids/kids-button';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  ageGroup: string;
  screenTimeLimit: number;
}

interface ChildContextValue {
  profile: ChildProfile | null;
  loading: boolean;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

export const ChildContext = createContext<ChildContextValue>({
  profile: null,
  loading: true,
});

export const useChildProfile = () => useContext(ChildContext);

/* ------------------------------------------------------------------ */
/*  Navigation tabs                                                    */
/* ------------------------------------------------------------------ */

interface NavTab {
  label: string;
  icon: string;
  href: string;
  pathSegment: string;
  activeColor: string;
  bgActive: string;
}

/* ------------------------------------------------------------------ */
/*  Layout Component                                                   */
/* ------------------------------------------------------------------ */

export default function KidsLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const profileId = params.profileId as string;
  const pathname = usePathname();
  const router = useRouter();

  /* ---- state ---- */
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [warningOpen, setWarningOpen] = useState(false);
  const [urgentOpen, setUrgentOpen] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);

  /* ---- fetch profile ---- */
  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        // Load from localStorage first (works on Vercel serverless)
        let localProfiles: ChildProfile[] = [];
        try {
          const raw = localStorage.getItem('kidsverse_profiles');
          if (raw) localProfiles = JSON.parse(raw) as ChildProfile[];
        } catch { /* ignore */ }

        // Try API too
        let apiProfiles: ChildProfile[] = [];
        try {
          const res = await fetch('/api/child-profiles');
          if (res.ok) {
            const data = await res.json();
            apiProfiles = data.profiles ?? [];
          }
        } catch { /* API failed */ }

        // Merge
        const apiIds = new Set(apiProfiles.map((p) => p.id));
        const uniqueLocal = localProfiles.filter((p) => !apiIds.has(p.id));
        const merged = [...apiProfiles, ...uniqueLocal];

        const found = merged.find((p: ChildProfile) => p.id === profileId);
        if (!cancelled && found) {
          setProfile({
            id: found.id,
            name: found.name,
            age: found.age,
            avatar: found.avatar || '\uD83D\uDC3E',
            ageGroup: found.ageGroup,
            screenTimeLimit: found.screenTimeLimit || 60,
          });
        } else if (!cancelled) {
          // Profile not found — use fallback with the profileId from URL
          setProfile({
            id: profileId,
            name: 'Friend',
            age: 5,
            avatar: '\uD83D\uDC81',
            ageGroup: 'early',
            screenTimeLimit: 60,
          });
        }
      } catch {
        if (!cancelled) {
          setProfile({
            id: profileId,
            name: 'Buddy',
            age: 5,
            avatar: '\uD83D\uDC81',
            ageGroup: 'early',
            screenTimeLimit: 60,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProfile();
    return () => { cancelled = true; };
  }, [profileId]);

  /* ---- theme ---- */
  const { theme, toggleTheme, isDark } = useTheme();

  /* ---- screen time ---- */
  const st = useScreenTime({
    profileId: profileId || 'unknown',
    limitMinutes: profile?.screenTimeLimit ?? 60,
  });

  const minutesRemaining = st.minutesRemaining;
  const warningLevel = st.warningLevel;
  const formattedRemaining = st.formattedRemaining;
  const isTimeUp = st.isTimeUp;

  /* ---- screen time warnings ---- */
  useEffect(() => {
    if (warningLevel === 'warning' && !warningDismissed) {
      setWarningOpen(true);
    }
  }, [warningLevel, warningDismissed]);

  useEffect(() => {
    if (warningLevel === 'urgent') {
      setUrgentOpen(true);
    }
  }, [warningLevel]);

  const handleContinuePlaying = useCallback(() => {
    setWarningOpen(false);
    setWarningDismissed(true);
  }, []);

  const handleBackToProfiles = useCallback(() => {
    router.push('/kids');
  }, [router]);

  /* ---- navigation ---- */
  const basePath = `/kids/${profileId}`;
  const navTabs: NavTab[] = [
    {
      label: 'Learn',
      icon: '\uD83D\uDCDA',
      href: `${basePath}/learn`,
      pathSegment: '/learn',
      activeColor: 'text-kids-sky',
      bgActive: 'bg-kids-sky/10',
    },
    {
      label: 'Play',
      icon: '\uD83C\uDFAE',
      href: `${basePath}/play`,
      pathSegment: '/play',
      activeColor: 'text-kids-grass',
      bgActive: 'bg-kids-grass/10',
    },
    {
      label: 'Stories',
      icon: '\uD83D\uDCD6',
      href: `${basePath}/stories`,
      pathSegment: '/stories',
      activeColor: 'text-kids-lavender',
      bgActive: 'bg-kids-lavender/10',
    },
    {
      label: 'Create',
      icon: '\uD83C\uDFA8',
      href: `${basePath}/create`,
      pathSegment: '/create',
      activeColor: 'text-kids-coral',
      bgActive: 'bg-kids-coral/10',
    },
    {
      label: 'Watch',
      icon: '\uD83D\uDCFA',
      href: `${basePath}/watch`,
      pathSegment: '/watch',
      activeColor: 'text-kids-sun',
      bgActive: 'bg-kids-sun/10',
    },
  ];

  const activeTabIdx = navTabs.findIndex((t) => pathname.endsWith(t.pathSegment));

  /* ---- loading state ---- */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kids-offwhite dark:bg-gray-900">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.span
            className="text-6xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            \uD83C\uDF1F
          </motion.span>
          <p className="font-nunito text-lg font-bold text-kids-dark dark:text-white">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <ChildContext.Provider value={{ profile, loading }}>
      <div className="min-h-screen bg-kids-offwhite dark:bg-gray-900">
        {/* ================================================================ */}
        {/*  TOP BAR                                                         */}
        {/* ================================================================ */}
        <header className="sticky top-0 z-40 w-full">
          <div className="mx-auto max-w-4xl">
            <div className="flex h-16 items-center justify-between rounded-b-2xl bg-white px-4 shadow-kids sm:px-6 dark:bg-gray-800">
              {/* Left: Avatar + Name */}
              <button
                type="button"
                onClick={() => router.push('/kids')}
                className="flex items-center gap-2 rounded-2xl px-2 py-1 transition-colors hover:bg-kids-lightgray focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky"
                aria-label={`Back to profile selector. Current profile: ${profile?.name ?? 'Unknown'}`}
              >
                <motion.span
                  className="text-2xl sm:text-3xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                  aria-hidden="true"
                >
                  {profile?.avatar ?? '\uD83D\uDC3E'}
                </motion.span>
                <span className="hidden max-w-[100px] truncate text-sm font-nunito font-bold text-kids-dark dark:text-white sm:inline-block sm:max-w-[140px]">
                  {profile?.name ?? 'Friend'}
                </span>
                <ArrowLeft className="size-4 text-kids-text-secondary dark:text-gray-400 sm:hidden" aria-hidden="true" />
              </button>

              {/* Center: Logo */}
              <h1 className="font-nunito text-lg font-extrabold text-gradient-rainbow sm:text-xl select-none">
                KidsVerse
              </h1>

              {/* Right: Screen Time + Audio */}
              <div className="flex items-center gap-2 sm:gap-3">
                <KidsBadge
                  variant={minutesRemaining <= 10 ? 'danger' : minutesRemaining <= 20 ? 'gold' : 'default'}
                  size="sm"
                  icon={<Clock className="size-3" aria-hidden="true" />}
                >
                  <span className="text-xs font-nunito">{formattedRemaining}</span>
                </KidsBadge>
                <AudioToggle size="md" position="none" />
              </div>
            </div>
          </div>
        </header>

        {/* ================================================================ */}
        {/*  MAIN CONTENT                                                    */}
        {/* ================================================================ */}
        <main className="mx-auto max-w-4xl px-4 pb-28 pt-4 sm:px-6">
          {children}
        </main>

        {/* ================================================================ */}
        {/*  BOTTOM NAVIGATION                                               */}
        {/* ================================================================ */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
          aria-label="Main navigation"
        >
          <div className="mx-auto max-w-4xl">
            <div className="flex h-[70px] items-center justify-around rounded-t-2xl bg-white px-2 shadow-kids sm:px-4 dark:bg-gray-800">
              {navTabs.map((tab, idx) => {
                const isActive = idx === activeTabIdx;
                return (
                  <button
                    key={tab.pathSegment}
                    type="button"
                    onClick={() => router.push(tab.href)}
                    className={cn(
                      'relative flex min-h-[52px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky sm:min-w-[64px] sm:gap-1',
                      isActive ? tab.bgActive : 'hover:bg-kids-lightgray/60',
                    )}
                    aria-label={tab.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <motion.span
                      className={cn(
                        'text-2xl sm:text-3xl',
                        isActive ? tab.activeColor : 'text-kids-text-secondary',
                      )}
                      animate={
                        isActive
                          ? { y: [0, -4, 0] }
                          : { y: 0 }
                      }
                      transition={
                        isActive
                          ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                          : { duration: 0.2 }
                      }
                      whileTap={{ scale: 0.85 }}
                      aria-hidden="true"
                    >
                      {tab.icon}
                    </motion.span>
                    <span
                      className={cn(
                        'text-[10px] font-nunito font-bold leading-none sm:text-xs',
                        isActive ? tab.activeColor : 'text-kids-text-secondary',
                      )}
                    >
                      {tab.label}
                    </span>
                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.span
                        className={cn(
                          'absolute -top-0.5 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full',
                          tab.activeColor.replace('text-', 'bg-'),
                        )}
                        layoutId="nav-indicator"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      />
                    )}
                  </button>
                );
              })}

              {/* Theme toggle button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex min-h-[52px] min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 transition-colors hover:bg-kids-lightgray/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky sm:min-w-[56px] sm:gap-1"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <motion.span
                  className="text-2xl sm:text-3xl"
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  aria-hidden="true"
                >
                  {isDark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
                </motion.span>
                <span className="text-[10px] font-nunito font-bold leading-none text-kids-text-secondary sm:text-xs">
                  {isDark ? 'Light' : 'Dark'}
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* ================================================================ */}
        {/*  SCREEN TIME — WARNING MODAL                                     */}
        {/* ================================================================ */}
        <KidsModal
          isOpen={warningOpen}
          onClose={handleContinuePlaying}
          title="Time for a Break? \uD83D\uDD50"
          description="You\u2019ve been playing for a while! Maybe stretch your legs?"
          size="sm"
          footer={
            <>
              <KidsButton variant="outline" onClick={handleContinuePlaying}>
                Take a Break
              </KidsButton>
              <KidsButton variant="success" onClick={handleContinuePlaying}>
                Continue Playing
              </KidsButton>
            </>
          }
        >
          <div className="flex flex-col items-center gap-4 py-2">
            <motion.span
              className="text-5xl"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              \uD83C\uDFC3
            </motion.span>
            <p className="text-center text-sm text-kids-text-secondary">
              {formattedRemaining} of screen time remaining
            </p>
          </div>
        </KidsModal>

        {/* ================================================================ */}
        {/*  SCREEN TIME — URGENT MODAL                                      */}
        {/* ================================================================ */}
        <KidsModal
          isOpen={urgentOpen}
          onClose={handleBackToProfiles}
          title="Time\u2019s Up! \u23F0"
          description="Your screen time is all done for today. Great job learning!"
          size="sm"
          showCloseButton={false}
          closeOnOverlayClick={false}
          footer={
            <KidsButton
              variant="rainbow"
              onClick={handleBackToProfiles}
              size="early"
              className="w-full"
            >
              Back to Profiles
            </KidsButton>
          }
        >
          <div className="flex flex-col items-center gap-4 py-2">
            <motion.span
              className="text-5xl"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              \u2B50
            </motion.span>
            <p className="text-center text-sm text-kids-text-secondary">
              Come back tomorrow for more fun!
            </p>
          </div>
        </KidsModal>
      </div>
    </ChildContext.Provider>
  );
}
