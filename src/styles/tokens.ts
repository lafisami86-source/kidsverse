/**
 * KidsVerse Design Tokens
 * Child-friendly design system constants
 */

export const COLORS = {
  sky: '#60B5FF',
  grass: '#7ED957',
  sun: '#FFD93D',
  coral: '#FF6B6B',
  lavender: '#C4B5FD',
  mint: '#6EE7B7',
  peach: '#FBBF7A',
  pink: '#F472B6',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  white: '#FFFFFF',
  offWhite: '#F8FAFC',
  lightGray: '#F1F5F9',
  dark: '#1E293B',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

export const GRADIENTS = {
  sky: `linear-gradient(135deg, ${COLORS.sky} 0%, ${COLORS.blue} 100%)`,
  grass: `linear-gradient(135deg, ${COLORS.grass} 0%, ${COLORS.mint} 100%)`,
  sun: `linear-gradient(135deg, ${COLORS.sun} 0%, ${COLORS.peach} 100%)`,
  coral: `linear-gradient(135deg, ${COLORS.coral} 0%, ${COLORS.pink} 100%)`,
  lavender: `linear-gradient(135deg, ${COLORS.lavender} 0%, ${COLORS.purple} 100%)`,
  rainbow: `linear-gradient(135deg, ${COLORS.coral} 0%, ${COLORS.sun} 25%, ${COLORS.grass} 50%, ${COLORS.sky} 75%, ${COLORS.lavender} 100%)`,
  warm: `linear-gradient(135deg, ${COLORS.peach} 0%, ${COLORS.coral} 100%)`,
  cool: `linear-gradient(135deg, ${COLORS.sky} 0%, ${COLORS.lavender} 100%)`,
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const FONT_SIZES = {
  baby: '1.25rem', // 20px
  toddler: '1.5rem', // 24px
  kid: '1.125rem', // 18px
  heading: {
    sm: '1.5rem', // 24px
    md: '2rem', // 32px
    lg: '2.5rem', // 40px
    xl: '3rem', // 48px
    '2xl': '3.5rem', // 56px
  },
  body: {
    sm: '0.875rem', // 14px
    md: '1rem', // 16px
    lg: '1.125rem', // 18px
  },
} as const;

export const BORDER_RADIUS = {
  sm: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.5rem', // 24px
  '2xl': '2rem', // 32px
  full: '9999px',
} as const;

export const SHADOWS = {
  card: '0 4px 20px rgba(0, 0, 0, 0.08)',
  cardHover: '0 6px 25px rgba(0, 0, 0, 0.15)',
  elevated: '0 8px 30px rgba(0, 0, 0, 0.12)',
  button: '0 2px 10px rgba(0, 0, 0, 0.1)',
  buttonHover: '0 4px 15px rgba(0, 0, 0, 0.15)',
  modal: '0 20px 60px rgba(0, 0, 0, 0.2)',
} as const;

export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    entrance: 600,
  },
  easing: {
    default: [0.4, 0, 0.2, 1] as const,
    bounce: [0.68, -0.55, 0.265, 1.55] as const,
    smooth: [0.25, 0.1, 0.25, 1] as const,
  },
} as const;

export const TAP_TARGETS = {
  toddler: 80, // pixels - minimum for ages 2-4
  early: 60, // pixels - minimum for ages 5-7
  kid: 44, // pixels - minimum for ages 8-10 (WCAG minimum)
} as const;

export const SCREEN_TIME = {
  defaultLimit: 60, // minutes per day
  maxLimit: 180, // maximum allowed
  warningThreshold: 0.8, // warn at 80% of limit
} as const;

export const MAX_CHILD_PROFILES = 5;
export const MAX_FREE_PROFILES = 2;
