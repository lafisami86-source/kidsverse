// Game Types — KidsVerse Games & Challenges
// Types, constants, and game definitions for the games section

export type GameType = 'memory' | 'math' | 'puzzle' | 'spelling' | 'word-search' | 'quiz' | 'trivia' | 'pattern';
export type GameDifficulty = 1 | 2 | 3;

export interface Game {
  id: GameType;
  title: string;
  icon: string;
  description: string;
  color: 'sky' | 'grass' | 'coral' | 'lavender' | 'sun' | 'mint';
  gradientFrom: string;
  gradientTo: string;
  difficulty: GameDifficulty;
  ageGroups: ('toddler' | 'early' | 'kid')[];
  badgeId: string;
  isPremium: boolean;
}

export interface GameScoreRecord {
  id: string;
  childId: string;
  gameType: GameType;
  score: number;
  level: number;
  duration: number; // seconds
  completedAt: string;
}

export interface GameState {
  status: 'idle' | 'playing' | 'completed';
  score: number;
  level: number;
  stars: 0 | 1 | 2 | 3;
  moves: number;
  startTime: number | null;
  elapsed: number; // seconds
}

// ─── Game Definitions ────────────────────────────────────────────────────

export const GAMES: Game[] = [
  {
    id: 'memory',
    title: 'Memory Match',
    icon: '🃏',
    description: 'Flip cards and find matching pairs!',
    color: 'sky',
    gradientFrom: 'from-sky-100',
    gradientTo: 'to-blue-200',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    badgeId: 'memory-champion',
    isPremium: false,
  },
  {
    id: 'math',
    title: 'Math Challenge',
    icon: '🧮',
    description: 'Solve fun math problems!',
    color: 'grass',
    gradientFrom: 'from-green-100',
    gradientTo: 'to-emerald-200',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    badgeId: 'math-whiz',
    isPremium: false,
  },
  {
    id: 'puzzle',
    title: 'Puzzle Builder',
    icon: '🧩',
    description: 'Build puzzles piece by piece!',
    color: 'lavender',
    gradientFrom: 'from-violet-100',
    gradientTo: 'to-purple-200',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    badgeId: 'puzzle-pro',
    isPremium: false,
  },
  {
    id: 'spelling',
    title: 'Spelling Bee',
    icon: '🐝',
    description: 'Learn to spell new words!',
    color: 'coral',
    gradientFrom: 'from-rose-100',
    gradientTo: 'to-pink-200',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    badgeId: 'spelling-bee',
    isPremium: false,
  },
  // ── Premium Games ──
  {
    id: 'word-search',
    title: 'Word Search',
    icon: '🔍',
    description: 'Find hidden words in a grid!',
    color: 'sun',
    gradientFrom: 'from-yellow-100',
    gradientTo: 'to-amber-200',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    badgeId: 'word-hunter',
    isPremium: true,
  },
  {
    id: 'quiz',
    title: 'Science Quiz',
    icon: '🧪',
    description: 'Test your science knowledge!',
    color: 'mint',
    gradientFrom: 'from-teal-100',
    gradientTo: 'to-emerald-200',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    badgeId: 'science-star',
    isPremium: true,
  },
  {
    id: 'trivia',
    title: 'Brain Trivia',
    icon: '🧠',
    description: 'Fun facts challenge!',
    color: 'lavender',
    gradientFrom: 'from-violet-100',
    gradientTo: 'to-purple-200',
    difficulty: 3,
    ageGroups: ['kid'],
    badgeId: 'trivia-master',
    isPremium: true,
  },
  {
    id: 'pattern',
    title: 'Pattern Master',
    icon: '🔷',
    description: 'Complete the sequence!',
    color: 'sky',
    gradientFrom: 'from-sky-100',
    gradientTo: 'to-blue-200',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    badgeId: 'pattern-pro',
    isPremium: true,
  },
];

// ─── Memory Game Data ────────────────────────────────────────────────────

export const MEMORY_EMOJIS = [
  '🐶', '🐱', '🐻', '🦊', '🐰', '🐼', '🐨', '🦁',
  '🐸', '🐧', '🦋', '🐝', '🐬', '🦄', '🐲', '🦉',
  '🐘', '🦒', '🐝', '🦜', '🐢', '🐙', '🦈', '🐙',
] as const;

/** Grid config per difficulty level */
export const MEMORY_GRID: Record<GameDifficulty, { cols: number; pairs: number }> = {
  1: { cols: 3, pairs: 3 },   // 3×2 = 6 cards (toddlers)
  2: { cols: 4, pairs: 6 },   // 4×3 = 12 cards (early)
  3: { cols: 4, pairs: 8 },   // 4×4 = 16 cards (kids)
};

// ─── Math Game Data ──────────────────────────────────────────────────────

export const MATH_OPERATIONS = ['+', '-', '×'] as const;
export type MathOperation = (typeof MATH_OPERATIONS)[number];

export interface MathProblem {
  question: string;
  answer: number;
  choices: number[];
  visualEmoji?: string;
  operation: MathOperation;
}

// ─── Puzzle Game Data ────────────────────────────────────────────────────

export const PUZZLE_SCENES = [
  { id: 'farm', title: 'Farm', emoji: '🌾', pieces: ['🌾', '🐄', '🐔', '🌻', '🐷', '🚜', '🌞', '📦', '🏡'] },
  { id: 'ocean', title: 'Ocean', emoji: '🌊', pieces: ['🌊', '🐬', '🐠', '🐙', '🐚', '🦀', '⛵', '☀️', '🏝️'] },
  { id: 'space', title: 'Space', emoji: '🚀', pieces: ['🚀', '⭐', '🌙', '🪐', '👽', '🛸', '☄️', '🌍', '🛰️'] },
  { id: 'forest', title: 'Forest', emoji: '🌲', pieces: ['🌲', '🦊', '🍄', '🐿️', '🌸', '🦉', '🍃', '🪵', '🌻'] },
  { id: 'garden', title: 'Garden', emoji: '🌺', pieces: ['🌺', '🦋', '🐝', '🌻', '🌿', '🐛', '🌈', '💐', '🪴'] },
  { id: 'city', title: 'City', emoji: '🏙️', pieces: ['🏙️', '🚗', '🏫', '🏥', '🌳', '🐕', '🏠', '🚌', '🏢'] },
] as const;

// ─── Spelling Game Data ──────────────────────────────────────────────────

export interface SpellingWord {
  word: string;
  hint: string;
  letters: string[];
  distractors: string[];
}

export const SPELLING_WORDS_TODDLER: SpellingWord[] = [
  { word: 'CAT', hint: '🐱', letters: ['C', 'A', 'T'], distractors: ['O'] },
  { word: 'DOG', hint: '🐶', letters: ['D', 'O', 'G'], distractors: ['X'] },
  { word: 'SUN', hint: '☀️', letters: ['S', 'U', 'N'], distractors: ['M'] },
  { word: 'HAT', hint: '🎩', letters: ['H', 'A', 'T'], distractors: ['B'] },
  { word: 'RED', hint: '🔴', letters: ['R', 'E', 'D'], distractors: ['P'] },
  { word: 'BIG', hint: '🐘', letters: ['B', 'I', 'G'], distractors: ['F'] },
];

export const SPELLING_WORDS_EARLY: SpellingWord[] = [
  { word: 'CAT', hint: '🐱', letters: ['C', 'A', 'T'], distractors: ['O'] },
  { word: 'DOG', hint: '🐶', letters: ['D', 'O', 'G'], distractors: ['X'] },
  { word: 'SUN', hint: '☀️', letters: ['S', 'U', 'N'], distractors: ['M'] },
  { word: 'HAT', hint: '🎩', letters: ['H', 'A', 'T'], distractors: ['B'] },
  { word: 'RED', hint: '🔴', letters: ['R', 'E', 'D'], distractors: ['P'] },
  { word: 'BIG', hint: '🐘', letters: ['B', 'I', 'G'], distractors: ['F'] },
  { word: 'RUN', hint: '🏃', letters: ['R', 'U', 'N'], distractors: ['T'] },
  { word: 'CUP', hint: '🥤', letters: ['C', 'U', 'P'], distractors: ['O'] },
  { word: 'PEN', hint: '🖊️', letters: ['P', 'E', 'N'], distractors: ['K'] },
  { word: 'BUS', hint: '🚌', letters: ['B', 'U', 'S'], distractors: ['D'] },
  { word: 'FOX', hint: '🦊', letters: ['F', 'O', 'X'], distractors: ['A'] },
  { word: 'HEN', hint: '🐔', letters: ['H', 'E', 'N'], distractors: ['G'] },
];

export const SPELLING_WORDS_KID: SpellingWord[] = [
  { word: 'APPLE', hint: '🍎', letters: ['A', 'P', 'P', 'L', 'E'], distractors: ['O', 'R'] },
  { word: 'HOUSE', hint: '🏠', letters: ['H', 'O', 'U', 'S', 'E'], distractors: ['N', 'T'] },
  { word: 'HAPPY', hint: '😊', letters: ['H', 'A', 'P', 'P', 'Y'], distractors: ['E', 'R'] },
  { word: 'WATER', hint: '💧', letters: ['W', 'A', 'T', 'E', 'R'], distractors: ['S', 'D'] },
  { word: 'MUSIC', hint: '🎵', letters: ['M', 'U', 'S', 'I', 'C'], distractors: ['N', 'P'] },
  { word: 'GREEN', hint: '💚', letters: ['G', 'R', 'E', 'E', 'N'], distractors: ['A', 'B'] },
  { word: 'PLANT', hint: '🌱', letters: ['P', 'L', 'A', 'N', 'T'], distractors: ['E', 'S'] },
  { word: 'TIGER', hint: '🐯', letters: ['T', 'I', 'G', 'E', 'R'], distractors: ['A', 'O'] },
  { word: 'BREAD', hint: '🍞', letters: ['B', 'R', 'E', 'A', 'D'], distractors: ['S', 'P'] },
  { word: 'CLOUD', hint: '☁️', letters: ['C', 'L', 'O', 'U', 'D'], distractors: ['R', 'N'] },
  { word: 'SMILE', hint: '😄', letters: ['S', 'M', 'I', 'L', 'E'], distractors: ['A', 'T'] },
  { word: 'DANCE', hint: '💃', letters: ['D', 'A', 'N', 'C', 'E'], distractors: ['R', 'S'] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────

/**
 * Get games filtered by age group and max difficulty.
 */
export function getGamesForAgeGroup(
  ageGroup: 'toddler' | 'early' | 'kid',
  maxDifficulty: number,
): Game[] {
  return GAMES.filter(
    (g) => g.ageGroups.includes(ageGroup) && g.difficulty <= maxDifficulty,
  );
}

/**
 * Calculate star rating based on performance metrics.
 */
export function calculateStars(
  correct: number,
  total: number,
  extraMoves: number,
): 0 | 1 | 2 | 3 {
  const accuracy = correct / total;
  if (accuracy >= 0.9 && extraMoves <= 2) return 3;
  if (accuracy >= 0.7 && extraMoves <= 5) return 2;
  if (accuracy >= 0.5) return 1;
  return 0;
}

/**
 * Format seconds into MM:SS string.
 */
export function formatGameTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
