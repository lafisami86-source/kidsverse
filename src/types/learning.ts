// Learning Types — KidsVerse Learning Modules
// Types, constants, and lesson definitions for the educational platform

export type ModuleId = 'alphabet' | 'numbers' | 'colors' | 'science';
export type AgeGroup = 'toddler' | 'early' | 'kid';

export interface Lesson {
  id: string;
  moduleId: ModuleId;
  title: string;
  description: string;
  /** Difficulty level 1-3 (filtered by age group) */
  difficulty: 1 | 2 | 3;
  /** Which age groups this lesson is suitable for */
  ageGroups: AgeGroup[];
  /** Order within the module */
  order: number;
  /** Whether this lesson requires premium */
  isPremium: boolean;
}

export interface ModuleProgress {
  moduleId: ModuleId;
  totalLessons: number;
  completedLessons: number;
  totalStars: number;
  maxStars: number;
  /** 0-100 percentage */
  percentComplete: number;
  /** Whether at least one lesson is completed */
  isStarted: boolean;
  /** Whether all lessons are completed */
  isComplete: boolean;
}

export interface LessonProgress {
  lessonId: string;
  moduleId: ModuleId;
  isCompleted: boolean;
  stars: number; // 0-3
  score: number; // 0-100
  attempts: number;
  lastPlayed?: string; // ISO date
}

export interface LearningSummary {
  modules: ModuleProgress[];
  totalStars: number;
  totalCompletedLessons: number;
  totalLessons: number;
  streak: number; // days
}

// All module definitions for the app
export const MODULES: {
  id: ModuleId;
  title: string;
  icon: string;
  description: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}[] = [
  {
    id: 'alphabet',
    title: 'Alphabet',
    icon: '🔤',
    description: 'Learn letters A–Z with fun sounds and pictures',
    color: 'sky',
    gradientFrom: 'from-sky-100',
    gradientTo: 'to-blue-200',
  },
  {
    id: 'numbers',
    title: 'Numbers',
    icon: '🔢',
    description: 'Count from 1 to 20 with interactive activities',
    color: 'grass',
    gradientFrom: 'from-green-100',
    gradientTo: 'to-emerald-200',
  },
  {
    id: 'colors',
    title: 'Colors',
    icon: '🎨',
    description: 'Discover colors through mixing and matching',
    color: 'coral',
    gradientFrom: 'from-rose-100',
    gradientTo: 'to-pink-200',
  },
  {
    id: 'science',
    title: 'Science',
    icon: '🔬',
    description: 'Explore nature, animals, and the world around us',
    color: 'lavender',
    gradientFrom: 'from-violet-100',
    gradientTo: 'to-purple-200',
  },
];

// ─── Alphabet Lessons (26 letters) ────────────────────────────────────────────
// Difficulty 1 (A–J): toddler + early + kid
// Difficulty 2 (K–T): early + kid
// Difficulty 3 (U–Z): kid only

const ALPHABET_EASY: AgeGroup[] = ['toddler', 'early', 'kid'];
const ALPHABET_MEDIUM: AgeGroup[] = ['early', 'kid'];
const ALPHABET_HARD: AgeGroup[] = ['kid'];

function makeAlphabetLesson(
  letter: string,
  order: number,
  difficulty: 1 | 2 | 3,
  ageGroups: AgeGroup[],
  isPremium: boolean,
): Lesson {
  return {
    id: `alphabet-${letter.toLowerCase()}`,
    moduleId: 'alphabet',
    title: `Letter ${letter}`,
    description: `Learn the sound and shape of letter ${letter}`,
    difficulty,
    ageGroups,
    order,
    isPremium,
  };
}

export const ALPHABET_LESSONS: Lesson[] = [
  // A–E: Difficulty 1
  makeAlphabetLesson('A', 1, 1, ALPHABET_EASY, false),
  makeAlphabetLesson('B', 2, 1, ALPHABET_EASY, false),
  makeAlphabetLesson('C', 3, 1, ALPHABET_EASY, false),
  makeAlphabetLesson('D', 4, 1, ALPHABET_EASY, false),
  makeAlphabetLesson('E', 5, 1, ALPHABET_EASY, false),
  // F–J: Difficulty 1
  makeAlphabetLesson('F', 6, 1, ALPHABET_EASY, false),
  makeAlphabetLesson('G', 7, 1, ALPHABET_EASY, false),
  makeAlphabetLesson('H', 8, 1, ALPHABET_EASY, false),
  makeAlphabetLesson('I', 9, 1, ALPHABET_EASY, false),
  makeAlphabetLesson('J', 10, 1, ALPHABET_EASY, false),
  // K–O: Difficulty 2 (Premium)
  makeAlphabetLesson('K', 11, 2, ALPHABET_MEDIUM, true),
  makeAlphabetLesson('L', 12, 2, ALPHABET_MEDIUM, true),
  makeAlphabetLesson('M', 13, 2, ALPHABET_MEDIUM, true),
  makeAlphabetLesson('N', 14, 2, ALPHABET_MEDIUM, true),
  makeAlphabetLesson('O', 15, 2, ALPHABET_MEDIUM, true),
  // P–T: Difficulty 2 (Premium)
  makeAlphabetLesson('P', 16, 2, ALPHABET_MEDIUM, true),
  makeAlphabetLesson('Q', 17, 2, ALPHABET_MEDIUM, true),
  makeAlphabetLesson('R', 18, 2, ALPHABET_MEDIUM, true),
  makeAlphabetLesson('S', 19, 2, ALPHABET_MEDIUM, true),
  makeAlphabetLesson('T', 20, 2, ALPHABET_MEDIUM, true),
  // U–Z: Difficulty 3 (Premium)
  makeAlphabetLesson('U', 21, 3, ALPHABET_HARD, true),
  makeAlphabetLesson('V', 22, 3, ALPHABET_HARD, true),
  makeAlphabetLesson('W', 23, 3, ALPHABET_HARD, true),
  makeAlphabetLesson('X', 24, 3, ALPHABET_HARD, true),
  makeAlphabetLesson('Y', 25, 3, ALPHABET_HARD, true),
  makeAlphabetLesson('Z', 26, 3, ALPHABET_HARD, true),
];

// ─── Numbers Lessons (10) ────────────────────────────────────────────────────

export const NUMBERS_LESSONS: Lesson[] = [
  {
    id: 'numbers-1to5',
    moduleId: 'numbers',
    title: 'Numbers 1–5',
    description: 'Count objects from one to five with interactive tap-and-count games',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    order: 1,
    isPremium: false,
  },
  {
    id: 'numbers-6to10',
    moduleId: 'numbers',
    title: 'Numbers 6–10',
    description: 'Continue counting up to ten with fun animal friends',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    order: 2,
    isPremium: false,
  },
  {
    id: 'numbers-11to15',
    moduleId: 'numbers',
    title: 'Numbers 11–15',
    description: 'Explore teen numbers with stacking and building activities',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 3,
    isPremium: true,
  },
  {
    id: 'numbers-16to20',
    moduleId: 'numbers',
    title: 'Numbers 16–20',
    description: 'Count all the way to twenty in a starry sky adventure',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 4,
    isPremium: true,
  },
  {
    id: 'numbers-addition',
    moduleId: 'numbers',
    title: 'Simple Addition',
    description: 'Put groups together and find the total with picture-based problems',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 5,
    isPremium: true,
  },
  {
    id: 'numbers-subtraction',
    moduleId: 'numbers',
    title: 'Simple Subtraction',
    description: 'Take away and see what is left with fun disappearing tricks',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 6,
    isPremium: true,
  },
  {
    id: 'numbers-patterns',
    moduleId: 'numbers',
    title: 'Number Patterns',
    description: 'Spot and continue repeating number sequences',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 7,
    isPremium: true,
  },
  {
    id: 'numbers-by2s',
    moduleId: 'numbers',
    title: 'Counting by 2s',
    description: 'Skip-count by twos on a hopscotch path',
    difficulty: 3,
    ageGroups: ['kid'],
    order: 8,
    isPremium: true,
  },
  {
    id: 'numbers-by5s',
    moduleId: 'numbers',
    title: 'Counting by 5s',
    description: 'Jump by fives on a number line and discover the pattern',
    difficulty: 3,
    ageGroups: ['kid'],
    order: 9,
    isPremium: true,
  },
  {
    id: 'numbers-by10s',
    moduleId: 'numbers',
    title: 'Counting by 10s',
    description: 'Rocket to one hundred by counting with tens',
    difficulty: 3,
    ageGroups: ['kid'],
    order: 10,
    isPremium: true,
  },
];

// ─── Colors Lessons (8) ──────────────────────────────────────────────────────

export const COLORS_LESSONS: Lesson[] = [
  {
    id: 'colors-primary',
    moduleId: 'colors',
    title: 'Primary Colors',
    description: 'Meet red, blue, and yellow — the three colors that make all others',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    order: 1,
    isPremium: true,
  },
  {
    id: 'colors-secondary',
    moduleId: 'colors',
    title: 'Secondary Colors',
    description: 'See what happens when primary colors mix to make orange, green, and purple',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    order: 2,
    isPremium: true,
  },
  {
    id: 'colors-warm',
    moduleId: 'colors',
    title: 'Red, Orange, Yellow',
    description: 'Explore warm colors in nature — sunsets, fire, and autumn leaves',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    order: 3,
    isPremium: true,
  },
  {
    id: 'colors-cool',
    moduleId: 'colors',
    title: 'Green, Blue, Purple',
    description: 'Discover cool colors in the world — ocean, sky, and flowers',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    order: 4,
    isPremium: true,
  },
  {
    id: 'colors-mixing',
    moduleId: 'colors',
    title: 'Color Mixing',
    description: 'Be a color scientist — mix paints to create your own custom colors',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 5,
    isPremium: true,
  },
  {
    id: 'colors-light-dark',
    moduleId: 'colors',
    title: 'Light and Dark',
    description: 'Learn how adding white makes colors lighter and adding black makes them darker',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 6,
    isPremium: true,
  },
  {
    id: 'colors-patterns',
    moduleId: 'colors',
    title: 'Color Patterns',
    description: 'Find and complete patterns using different colors and shapes',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 7,
    isPremium: true,
  },
  {
    id: 'colors-art-challenge',
    moduleId: 'colors',
    title: 'Color Art Challenge',
    description: 'Use everything you know about colors to create a beautiful masterpiece',
    difficulty: 3,
    ageGroups: ['kid'],
    order: 8,
    isPremium: true,
  },
  // ── New premium Colors lessons ──
  {
    id: 'colors-emotions',
    moduleId: 'colors',
    title: 'Colors & Emotions',
    description: 'Discover how different colors make you feel — happy yellow, calm blue, and more!',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    order: 9,
    isPremium: true,
  },
  {
    id: 'colors-nature-palette',
    moduleId: 'colors',
    title: 'Nature\'s Color Palette',
    description: 'Explore the amazing colors found in nature — from rainbows to ocean depths',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 10,
    isPremium: true,
  },
  {
    id: 'colors-complementary',
    moduleId: 'colors',
    title: 'Complementary Colors',
    description: 'Learn which colors look great together and create eye-catching combinations',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 11,
    isPremium: true,
  },
  {
    id: 'colors-world-cultures',
    moduleId: 'colors',
    title: 'Colors in World Cultures',
    description: 'Travel the world and see what different colors mean in various cultures',
    difficulty: 3,
    ageGroups: ['kid'],
    order: 12,
    isPremium: true,
  },
];

// ─── Science Lessons (8) ─────────────────────────────────────────────────────

export const SCIENCE_LESSONS: Lesson[] = [
  {
    id: 'science-body',
    moduleId: 'science',
    title: 'My Body',
    description: 'Learn about your head, shoulders, knees, and toes with a sing-along adventure',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    order: 1,
    isPremium: true,
  },
  {
    id: 'science-animals',
    moduleId: 'science',
    title: 'Animals Around Us',
    description: 'Meet furry, feathery, and scaly friends from farms, forests, and oceans',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    order: 2,
    isPremium: true,
  },
  {
    id: 'science-plants',
    moduleId: 'science',
    title: 'Plants and Flowers',
    description: 'Discover how seeds grow into beautiful flowers and tall trees',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    order: 3,
    isPremium: true,
  },
  {
    id: 'science-weather',
    moduleId: 'science',
    title: 'Weather',
    description: 'Explore sunny days, rainy clouds, snowy mornings, and windy afternoons',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    order: 4,
    isPremium: true,
  },
  {
    id: 'science-senses',
    moduleId: 'science',
    title: 'The 5 Senses',
    description: 'Use your eyes, ears, nose, mouth, and hands to explore the world',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 5,
    isPremium: true,
  },
  {
    id: 'science-habitats',
    moduleId: 'science',
    title: 'Habitats',
    description: 'Travel from the jungle to the desert and see where animals call home',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 6,
    isPremium: true,
  },
  {
    id: 'science-life-cycles',
    moduleId: 'science',
    title: 'Life Cycles',
    description: 'Watch caterpillars become butterflies and tadpoles turn into frogs',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 7,
    isPremium: true,
  },
  {
    id: 'science-solar-system',
    moduleId: 'science',
    title: 'Solar System',
    description: 'Blast off on a tour of the planets, moons, and stars in our galaxy',
    difficulty: 3,
    ageGroups: ['kid'],
    order: 8,
    isPremium: true,
  },
  // ── New premium Science lessons ──
  {
    id: 'science-dinosaurs',
    moduleId: 'science',
    title: 'Dinosaurs',
    description: 'Meet the mighty dinosaurs that roamed the Earth millions of years ago!',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    order: 9,
    isPremium: true,
  },
  {
    id: 'science-space-animals',
    moduleId: 'science',
    title: 'Animals in Space',
    description: 'Discover the amazing animals that traveled to space and what they found there',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 10,
    isPremium: true,
  },
  {
    id: 'science-experiments',
    moduleId: 'science',
    title: 'Easy Science Experiments',
    description: 'Try fun and safe experiments you can do at home with everyday items',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    order: 11,
    isPremium: true,
  },
  {
    id: 'science-earth-layers',
    moduleId: 'science',
    title: 'Layers of the Earth',
    description: 'Journey to the center of the Earth and discover its hidden layers',
    difficulty: 3,
    ageGroups: ['kid'],
    order: 12,
    isPremium: true,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Get lessons for a module, filtered by the given age group.
 * Only lessons whose `ageGroups` array includes `ageGroup` are returned,
 * sorted by their `order` field.
 */
export function getLessonsForModule(
  moduleId: ModuleId,
  ageGroup: AgeGroup,
): Lesson[] {
  return getAllLessons(moduleId).filter((lesson) =>
    lesson.ageGroups.includes(ageGroup),
  );
}

/**
 * Get all lessons for a module (no age-group filtering).
 * Lessons are sorted by their `order` field.
 */
export function getAllLessons(moduleId: ModuleId): Lesson[] {
  switch (moduleId) {
    case 'alphabet':
      return ALPHABET_LESSONS;
    case 'numbers':
      return NUMBERS_LESSONS;
    case 'colors':
      return COLORS_LESSONS;
    case 'science':
      return SCIENCE_LESSONS;
  }
}
