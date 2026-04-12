'use client';

import { useSyncExternalStore, useCallback, useEffect } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Theme = 'light' | 'dark';

interface UseThemeReturn {
  /** The current active theme */
  theme: Theme;
  /** Toggle between light and dark */
  toggleTheme: () => void;
  /** Convenience boolean — true when dark mode is active */
  isDark: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'kv-theme';
const DARK_CLASS = 'dark';
const THEME_EVENT = 'kv-theme-change';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function dispatchThemeChange(): void {
  window.dispatchEvent(new Event(THEME_EVENT));
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

function useTheme(): UseThemeReturn {
  /* ---- Subscribe to theme changes (cross-tab via "storage", same-tab via custom event) ---- */
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener(THEME_EVENT, onStoreChange);
    window.addEventListener('storage', onStoreChange);
    return () => {
      window.removeEventListener(THEME_EVENT, onStoreChange);
      window.removeEventListener('storage', onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback((): Theme => readStoredTheme(), []);
  const getServerSnapshot = useCallback((): Theme => 'light', []);

  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  /* ---- Sync the `dark` class on <html> whenever theme changes ---- */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add(DARK_CLASS);
    } else {
      root.classList.remove(DARK_CLASS);
    }
  }, [theme]);

  /* ---- Toggle handler ---- */
  const toggleTheme = useCallback(() => {
    const current = readStoredTheme();
    const next: Theme = current === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore write errors
    }
    dispatchThemeChange();
  }, []);

  return { theme, toggleTheme, isDark: theme === 'dark' };
}

export { useTheme };
