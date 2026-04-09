'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutDashboard, Users, CreditCard, Settings, Menu, X, Shield } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/parent', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/parent/profiles', label: 'Profiles', icon: Users },
  { href: '/parent/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/parent/settings', label: 'Settings', icon: Settings },
];

// Public routes that don't require authentication
const PUBLIC_PATHS = ['/parent/login', '/parent/register'];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p));

  useEffect(() => {
    // Only redirect to login if NOT on a public path
    if (status === 'unauthenticated' && !isPublicPath) {
      router.push('/parent/login');
    }
  }, [status, router, isPublicPath]);

  // For public pages (login/register), just render children directly
  if (isPublicPath) {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kids-offwhite">
        <motion.div
          className="text-4xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          🌈
        </motion.div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-kids-offwhite flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-kids-lightgray shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-kids-lightgray transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <button
              onClick={() => router.push('/parent')}
              className="text-2xl font-nunito font-black text-gradient-rainbow"
            >
              KidsVerse
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-kids-text-secondary font-nunito hidden sm:block">
              {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/parent/login' })}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-kids-text-secondary hover:text-kids-coral hover:bg-kids-coral/10 transition-colors font-nunito"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar — Desktop */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-kids-lightgray flex-col">
          <nav className="flex-1 py-4 px-3" aria-label="Parent navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 font-nunito font-bold text-sm transition-colors ${
                    isActive
                      ? 'bg-kids-sky/10 text-kids-sky'
                      : 'text-kids-text-secondary hover:bg-kids-lightgray hover:text-kids-dark'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div className="p-4 border-t border-kids-lightgray">
            <div className="flex items-center gap-2 text-xs text-kids-text-muted font-nunito">
              <Shield className="size-4" />
              <span>COPPA Compliant</span>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-kids-lightgray z-50 lg:hidden"
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                exit={{ x: -256 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <nav className="py-4 px-3" aria-label="Parent navigation">
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 font-nunito font-bold text-sm transition-colors ${
                          isActive
                            ? 'bg-kids-sky/10 text-kids-sky'
                            : 'text-kids-text-secondary hover:bg-kids-lightgray hover:text-kids-dark'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <item.icon className="size-5" />
                        {item.label}
                      </a>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Bottom Nav — Mobile */}
      <nav className="lg:hidden bg-white border-t border-kids-lightgray flex items-center justify-around py-2 safe-bottom" aria-label="Quick navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-nunito font-bold transition-colors ${
                isActive ? 'text-kids-sky' : 'text-kids-text-muted'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
