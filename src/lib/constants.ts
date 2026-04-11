/**
 * KidsVerse Application Constants
 */

export const APP_NAME = 'KidsVerse';
export const APP_DESCRIPTION = 'A safe, fun, and educational platform for children ages 2–10';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const AGE_RANGES = {
  toddler: { min: 2, max: 4, label: 'Toddlers (2–4)' },
  early: { min: 5, max: 7, label: 'Early Learners (5–7)' },
  kid: { min: 8, max: 10, label: 'Kids (8–10)' },
} as const;

export const AVATAR_OPTIONS = [
  '🐾', '🦁', '🐻', '🦊', '🐰', '🐼', '🐨', '🦄',
  '🐲', '🦋', '🐸', '🐧', '🦉', '🐝', '🐬', '🦜',
] as const;

export const CONTENT_CATEGORIES = [
  'all',
  'alphabet',
  'numbers',
  'colors',
  'shapes',
  'science',
  'stories',
  'songs',
  'art',
  'games',
] as const;

export const VIDEO_CATEGORIES = [
  { id: 'songs', label: 'Songs & Music', icon: '🎵' },
  { id: 'science', label: 'Science & Nature', icon: '🔬' },
  { id: 'art', label: 'Art & Craft', icon: '🎨' },
  { id: 'stories', label: 'Stories & Tales', icon: '📖' },
] as const;

export const STORY_CATEGORIES = [
  { id: 'adventure', label: 'Adventure', icon: '🗺️' },
  { id: 'animals', label: 'Animals', icon: '🦁' },
  { id: 'bedtime', label: 'Bedtime', icon: '🌙' },
  { id: 'learning', label: 'Learning', icon: '📚' },
  { id: 'funny', label: 'Funny', icon: '😄' },
] as const;

export const BADGE_TYPES = [
  { id: 'first-lesson', label: 'First Steps', icon: '🌟', description: 'Complete your first lesson' },
  { id: 'alphabet-master', label: 'Letter Learner', icon: '🔤', description: 'Complete all alphabet lessons' },
  { id: 'number-ninja', label: 'Number Ninja', icon: '🔢', description: 'Complete all number lessons' },
  { id: 'color-explorer', label: 'Color Explorer', icon: '🎨', description: 'Complete all color lessons' },
  { id: 'science-star', label: 'Science Star', icon: '🔬', description: 'Complete all science lessons' },
  { id: 'memory-champion', label: 'Memory Champion', icon: '🃏', description: 'Get a perfect score in Memory Match' },
  { id: 'puzzle-pro', label: 'Puzzle Pro', icon: '🧩', description: 'Complete all puzzle levels' },
  { id: 'spelling-bee', label: 'Spelling Bee', icon: '🐝', description: 'Get a perfect score in Spelling Bee' },
  { id: 'math-whiz', label: 'Math Whiz', icon: '🧮', description: 'Get a perfect score in Math Challenge' },
  { id: 'bookworm', label: 'Bookworm', icon: '📚', description: 'Read 5 stories' },
  { id: 'artist', label: 'Little Artist', icon: '🖼️', description: 'Create 3 drawings' },
  { id: 'streak-7', label: '7-Day Streak', icon: '🔥', description: 'Use the app 7 days in a row' },
] as const;

export const MAX_FREE_PROFILES = 2;
export const MAX_CHILD_PROFILES = 5;

export const SESSION_STRATEGIES = {
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // 1 day
} as const;
