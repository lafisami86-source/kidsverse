'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsBadge } from '@/components/kids/kids-badge';
import { KidsButton } from '@/components/kids/kids-button';
import { StarBadge } from '@/components/kids/star-badge';
import { useAudio } from '@/hooks/use-audio';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ActiveProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  ageGroup: string;
  screenTimeLimit: number;
}

type PageState = 'select' | 'quiz' | 'results';

interface ColorDef {
  name: string;
  hex: string;
  emoji: string;
  objects: string[];
}

interface ColorLessonDef {
  id: string;
  title: string;
  emoji: string;
  difficulty: number;
  ageGroups: string[];
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const COLORS: ColorDef[] = [
  { name: 'Red', hex: '#FF6B6B', emoji: '🔴', objects: ['🍎', '🌹', '🚗'] },
  { name: 'Orange', hex: '#FBBF7A', emoji: '🟠', objects: ['🍊', '🥕', '🐝'] },
  { name: 'Yellow', hex: '#FFD93D', emoji: '🟡', objects: ['🌞', '🍌', '⭐'] },
  { name: 'Green', hex: '#7ED957', emoji: '🟢', objects: ['🐸', '🌿', '🍎'] },
  { name: 'Blue', hex: '#60B5FF', emoji: '🔵', objects: ['🐳', '🌊', '🫐'] },
  { name: 'Purple', hex: '#C4B5FD', emoji: '🟣', objects: ['🍇', '🦄', '💜'] },
  { name: 'Pink', hex: '#F472B6', emoji: '🩷', objects: ['🌸', '🦩', '🎀'] },
  { name: 'Brown', hex: '#92400E', emoji: '🟤', objects: ['🐻', '🍫', '🌰'] },
  { name: 'Black', hex: '#1E293B', emoji: '⚫', objects: ['🌙', '🕷️', '🐯'] },
  { name: 'White', hex: '#FFFFFF', emoji: '⚪', objects: ['☁️', '🥚', '☃️'] },
];

const COLOR_MIXING = [
  { color1: 'Red', color2: 'Yellow', result: 'Orange' },
  { color1: 'Red', color2: 'Blue', result: 'Purple' },
  { color1: 'Blue', color2: 'Yellow', result: 'Green' },
  { color1: 'White', color2: 'Red', result: 'Pink' },
  { color1: 'White', color2: 'Black', result: 'Gray' },
  { color1: 'Red', color2: 'White', result: 'Pink' },
];

const COLOR_LESSONS: ColorLessonDef[] = [
  { id: 'primary', title: 'Primary Colors', emoji: '🎨', difficulty: 1, ageGroups: ['toddler', 'early', 'kid'] },
  { id: 'secondary', title: 'Secondary Colors', emoji: '🌈', difficulty: 1, ageGroups: ['toddler', 'early', 'kid'] },
  { id: 'warm', title: 'Warm Colors', emoji: '🔥', difficulty: 1, ageGroups: ['toddler', 'early', 'kid'] },
  { id: 'cool', title: 'Cool Colors', emoji: '❄️', difficulty: 1, ageGroups: ['toddler', 'early', 'kid'] },
  { id: 'mixing', title: 'Color Mixing', emoji: '🧪', difficulty: 2, ageGroups: ['early', 'kid'] },
  { id: 'lightdark', title: 'Light & Dark', emoji: '💡', difficulty: 2, ageGroups: ['early', 'kid'] },
  { id: 'patterns', title: 'Color Patterns', emoji: '🔗', difficulty: 2, ageGroups: ['early', 'kid'] },
  { id: 'art', title: 'Color Art Challenge', emoji: '🖌️', difficulty: 3, ageGroups: ['kid'] },
];

const CARD_COLORS = ['sky', 'coral', 'sun', 'lavender', 'grass', 'mint', 'sky', 'coral'] as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStoredProfile(): ActiveProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('kv-active-profile');
    return raw ? (JSON.parse(raw) as ActiveProfile) : null;
  } catch {
    return null;
  }
}

function getStoredProgress(profileId: string, key: string): Record<string, number> {
  if (typeof window === 'undefined' || !profileId) return {};
  try {
    const raw = localStorage.getItem(`kv-progress-${key}-${profileId}`);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function getAgeGroup(age: number): string {
  if (age <= 3) return 'toddler';
  if (age <= 6) return 'early';
  return 'kid';
}

function calculateStars(wrong: number): number {
  if (wrong === 0) return 3;
  if (wrong === 1) return 2;
  if (wrong === 2) return 1;
  return 0;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getColorByName(name: string): ColorDef | undefined {
  return COLORS.find((c) => c.name === name);
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function speakText(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
  }
}

/* ------------------------------------------------------------------ */
/*  Question generators                                                */
/* ------------------------------------------------------------------ */

interface Question {
  display: string;
  options: string[];
  correctIdx: number;
  colorHex?: string;
  mixColor1Hex?: string;
  mixColor2Hex?: string;
  resultColorHex?: string;
  compareColor1Hex?: string;
  compareColor2Hex?: string;
}

function generateIdentifyQuestions(colorSet: ColorDef[]): Question[] {
  const shuffled = shuffleArray(colorSet);
  const questions: Question[] = [];
  for (let i = 0; i < Math.min(5, shuffled.length); i++) {
    const target = shuffled[i];
    const wrongOptions = shuffleArray(COLORS.filter((c) => c.name !== target.name)).slice(0, 3).map((c) => c.name);
    const options = shuffleArray([target.name, ...wrongOptions]);
    questions.push({ display: `What color is this? ${target.objects[Math.floor(Math.random() * target.objects.length)]}`, options, correctIdx: options.indexOf(target.name), colorHex: target.hex });
  }
  return questions;
}

function generateMixingQuestions(): Question[] {
  const shuffled = shuffleArray(COLOR_MIXING);
  const questions: Question[] = [];
  for (let i = 0; i < Math.min(5, shuffled.length); i++) {
    const mix = shuffled[i];
    const c1 = getColorByName(mix.color1);
    const c2 = getColorByName(mix.color2);
    const result = getColorByName(mix.result) || { hex: '#9CA3AF' };
    const wrongNames = shuffleArray(COLORS.filter((c) => c.name !== mix.result)).slice(0, 2).map((c) => c.name);
    const options = shuffleArray([mix.result, ...wrongNames]);
    questions.push({ display: `Mix ${mix.color1} + ${mix.color2} = ?`, options, correctIdx: options.indexOf(mix.result), mixColor1Hex: c1?.hex, mixColor2Hex: c2?.hex, resultColorHex: result.hex });
  }
  return questions;
}

function generateLightDarkQuestions(): Question[] {
  const eligible = COLORS.filter((c) => c.name !== 'White' && c.name !== 'Black');
  const shuffled = shuffleArray(eligible);
  const questions: Question[] = [];
  for (let i = 0; i < Math.min(5, shuffled.length); i++) {
    const c = shuffled[i];
    const isLighter = Math.random() > 0.5;
    const options = shuffleArray([c.name, `Light ${c.name}`, `Dark ${c.name}`]);
    questions.push({
      display: `${isLighter ? 'Which one is lighter?' : 'Which one is darker?'} (${c.name})`,
      options,
      correctIdx: isLighter ? options.indexOf(`Light ${c.name}`) : options.indexOf(`Dark ${c.name}`),
      compareColor1Hex: lightenColor(c.hex, 80),
      compareColor2Hex: darkenColor(c.hex, 60),
    });
  }
  return questions;
}

function generatePatternQuestions(): Question[] {
  const patterns = [
    { colors: ['Red', 'Blue', 'Red', 'Blue'], answer: 'Red', options: ['Red', 'Green', 'Yellow'] },
    { colors: ['Red', 'Yellow', 'Blue', 'Red'], answer: 'Yellow', options: ['Yellow', 'Green', 'Purple'] },
    { colors: ['Pink', 'Pink', 'Blue', 'Blue'], answer: 'Pink', options: ['Pink', 'Red', 'Blue'] },
    { colors: ['Green', 'Orange', 'Green', 'Orange'], answer: 'Green', options: ['Green', 'Yellow', 'Red'] },
    { colors: ['Purple', 'Pink', 'Purple', 'Pink'], answer: 'Purple', options: ['Purple', 'Blue', 'Red'] },
  ];
  return shuffleArray(patterns).slice(0, 5).map((p) => {
    const opts = shuffleArray(p.options);
    return { display: `What comes next? ${p.colors.join(', ')}, _`, options: opts, correctIdx: opts.indexOf(p.answer) };
  });
}

function generateArtQuestions(): Question[] {
  const eligible = COLORS.filter((c) => c.name !== 'White' && c.name !== 'Black');
  const questions: Question[] = [];
  for (let i = 0; i < 5; i++) {
    const c = eligible[Math.floor(Math.random() * eligible.length)];
    const obj = c.objects[Math.floor(Math.random() * c.objects.length)];
    const wrongColors = shuffleArray(eligible.filter((x) => x.name !== c.name)).slice(0, 3);
    const options = shuffleArray([c.name, ...wrongColors.map((x) => x.name)]);
    questions.push({ display: `What color is ${obj}?`, options, correctIdx: options.indexOf(c.name), colorHex: c.hex });
  }
  return questions;
}

function getQuestionsForLesson(lessonId: string): Question[] {
  switch (lessonId) {
    case 'primary': return generateIdentifyQuestions(COLORS.filter((c) => ['Red', 'Yellow', 'Blue'].includes(c.name)));
    case 'secondary': return generateIdentifyQuestions(COLORS.filter((c) => ['Orange', 'Green', 'Purple'].includes(c.name)));
    case 'warm': return generateIdentifyQuestions(COLORS.filter((c) => ['Red', 'Orange', 'Yellow', 'Pink'].includes(c.name)));
    case 'cool': return generateIdentifyQuestions(COLORS.filter((c) => ['Blue', 'Green', 'Purple'].includes(c.name)));
    case 'mixing': return generateMixingQuestions();
    case 'lightdark': return generateLightDarkQuestions();
    case 'patterns': return generatePatternQuestions();
    case 'art': return generateArtQuestions();
    default: return generateIdentifyQuestions(shuffleArray(COLORS).slice(0, 5));
  }
}

/* ------------------------------------------------------------------ */
/*  Confetti                                                           */
/* ------------------------------------------------------------------ */

function ConfettiParticles() {
  const colors = ['#FF6B6B', '#FFD93D', '#7ED957', '#60B5FF', '#C4B5FD', '#F472B6'];
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i, x: Math.random() * 100, color: colors[i % colors.length], delay: Math.random() * 0.5, size: Math.random() * 8 + 4, rotation: Math.random() * 360,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-sm" style={{ width: p.size, height: p.size, backgroundColor: p.color, left: `${p.x}%`, top: '-20px' }} animate={{ y: ['0vh', '110vh'], rotate: [p.rotation, p.rotation + 720], opacity: [1, 1, 0] }} transition={{ duration: 2.5, delay: p.delay, ease: 'easeOut' }} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ColorsPage() {
  const router = useRouter();
  const { play: playClick } = useAudio({ frequency: 800, type: 'sine' });
  const { play: playSuccess } = useAudio({ frequency: 1200, type: 'sine' });
  const { play: playError } = useAudio({ frequency: 300, type: 'square', duration: 200 });

  const [profile] = useState<ActiveProfile | null>(() => getStoredProfile());
  const [state, setState] = useState<PageState>('select');
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [stars, setStars] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Record<string, number>>(() =>
    getStoredProgress(getStoredProfile()?.id || '', 'colors')
  );

  const totalQuestions = 5;

  /* Persist completed lessons */
  useEffect(() => {
    if (profile && Object.keys(completedLessons).length > 0) {
      try {
        localStorage.setItem(`kv-progress-colors-${profile.id}`, JSON.stringify(completedLessons));
      } catch {
        // ignore
      }
    }
  }, [completedLessons, profile]);

  const ageGroup = profile ? getAgeGroup(profile.age) : 'kid';
  const visibleLessons = COLOR_LESSONS.filter((l) => l.ageGroups.includes(ageGroup));
  const activeLesson = COLOR_LESSONS[activeLessonIdx];

  const startLesson = useCallback(
    (idx: number) => {
      setActiveLessonIdx(idx);
      setCurrentStep(0);
      setScore(0);
      setWrongCount(0);
      setStars(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setQuestions(getQuestionsForLesson(COLOR_LESSONS[idx].id));
      setState('quiz');
      playClick();
    },
    [playClick]
  );

  const handleAnswer = useCallback(
    (answerIdx: number) => {
      if (showFeedback || !questions[currentStep]) return;
      setSelectedAnswer(answerIdx);
      setShowFeedback(true);

      const q = questions[currentStep];
      const isCorrect = answerIdx === q.correctIdx;
      const newScore = score + (isCorrect ? 1 : 0);
      const newWrong = wrongCount + (isCorrect ? 0 : 1);

      if (isCorrect) { playSuccess(); speakText('Correct!'); }
      else { playError(); speakText('Try again!'); }

      const nextStep = currentStep + 1;

      if (nextStep >= totalQuestions) {
        setTimeout(() => {
          const earned = calculateStars(newWrong);
          setScore(newScore);
          setWrongCount(newWrong);
          setStars(earned);
          setState('results');
          setShowConfetti(earned >= 2);
          if (profile) {
            setCompletedLessons((prev) => {
              const best = prev[activeLesson.id];
              if (best !== undefined && best >= earned) return prev;
              return { ...prev, [activeLesson.id]: earned };
            });
          }
          setTimeout(() => setShowConfetti(false), 3000);
        }, 1500);
      } else {
        setScore(newScore);
        setWrongCount(newWrong);
        setTimeout(() => {
          setSelectedAnswer(null);
          setShowFeedback(false);
          setCurrentStep(nextStep);
        }, 1500);
      }
    },
    [showFeedback, questions, currentStep, score, wrongCount, totalQuestions, playSuccess, playError, activeLesson, profile]
  );

  /* No profile */
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kids-offwhite p-4">
        <KidsCard variant="elevated" color="coral" padding="xl" className="max-w-md text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">👤</motion.div>
          <h2 className="text-2xl font-nunito font-bold text-kids-dark mb-2">No Profile Selected</h2>
          <p className="text-kids-text-secondary mb-6">Please select a profile to start learning colors!</p>
          <KidsButton variant="primary" size="early" onClick={() => router.push('/kids')}>Go to Profiles</KidsButton>
        </KidsCard>
      </div>
    );
  }

  /* SELECT STATE */
  if (state === 'select') {
    return (
      <main className="min-h-screen bg-kids-offwhite">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <KidsButton variant="ghost" size="icon" onClick={() => router.push('/learn')} sound="click"><span className="text-2xl">←</span></KidsButton>
            <div>
              <h1 className="text-2xl sm:text-3xl font-nunito font-bold text-kids-dark">🎨 Color World</h1>
              <p className="text-sm text-kids-text-secondary font-nunito">Hi {profile.name}! Explore the world of colors!</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {visibleLessons.map((lesson) => {
              const completedStars = completedLessons[lesson.id] || 0;
              const globalIdx = COLOR_LESSONS.indexOf(lesson);
              return (
                <KidsCard key={lesson.id} variant="interactive" color={CARD_COLORS[globalIdx % CARD_COLORS.length]} padding="md" onClick={() => startLesson(globalIdx)} className="flex flex-col items-center text-center">
                  <span className="text-4xl mb-2">{lesson.emoji}</span>
                  <h3 className="text-sm sm:text-base font-nunito font-bold text-kids-dark mb-1">{lesson.title}</h3>
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: 3 }, (_, i) => (
                      <span key={i} className={`text-xs ${i < lesson.difficulty ? 'text-kids-sun' : 'text-kids-lightgray'}`}>★</span>
                    ))}
                  </div>
                  {completedStars > 0 && <StarBadge count={completedStars} max={3} size={18} animate={false} />}
                </KidsCard>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  /* QUIZ STATE */
  if (state === 'quiz' && questions.length > 0) {
    const question = questions[currentStep % questions.length];

    return (
      <main className="min-h-screen bg-kids-offwhite">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <KidsButton variant="ghost" size="icon" onClick={() => setState('select')} sound="click"><span className="text-2xl">←</span></KidsButton>
            <div className="flex-1">
              <p className="text-sm text-kids-text-secondary font-nunito">{activeLesson.title} — Quiz</p>
              <div className="w-full bg-kids-lightgray rounded-full h-2 mt-1">
                <motion.div className="bg-kids-grass h-2 rounded-full" animate={{ width: `${(currentStep / totalQuestions) * 100}%` }} transition={{ duration: 0.4 }} />
              </div>
            </div>
            <KidsBadge variant="default" size="md">{score}/{currentStep}</KidsBadge>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <KidsCard variant="elevated" padding="xl" className="text-center mb-6">
                {question.mixColor1Hex && question.mixColor2Hex && (
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <motion.div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-kids" style={{ backgroundColor: question.mixColor1Hex }} animate={showFeedback ? { scale: [1, 1.1, 1], x: [0, 10, 0] } : { scale: 1 }} transition={{ duration: 0.5 }} />
                    <motion.span className="text-3xl font-bold text-kids-dark" animate={showFeedback ? { scale: [1, 1.3, 1] } : {}}>+</motion.span>
                    <motion.div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-kids" style={{ backgroundColor: question.mixColor2Hex }} animate={showFeedback ? { scale: [1, 1.1, 1], x: [0, -10, 0] } : { scale: 1 }} transition={{ duration: 0.5 }} />
                    <motion.span className="text-3xl font-bold text-kids-dark">=</motion.span>
                    <motion.div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-kids" style={{ backgroundColor: showFeedback ? question.resultColorHex : '#E2E8F0' }} animate={showFeedback ? { scale: [0, 1.2, 1] } : { scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }} />
                  </div>
                )}
                {question.compareColor1Hex && question.compareColor2Hex && (
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <motion.div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-kids" style={{ backgroundColor: question.compareColor1Hex }} whileHover={{ scale: 1.05 }} />
                    <span className="text-2xl font-bold text-kids-text-muted">vs</span>
                    <motion.div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-kids" style={{ backgroundColor: question.compareColor2Hex }} whileHover={{ scale: 1.05 }} />
                  </div>
                )}
                {question.colorHex && !question.mixColor1Hex && !question.compareColor1Hex && (
                  <motion.div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full shadow-kids-lg mx-auto mb-6" style={{ backgroundColor: question.colorHex, border: question.colorHex === '#FFFFFF' ? '3px solid #E2E8F0' : 'none' }} animate={showFeedback ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} />
                )}
                <p className="text-lg sm:text-xl font-nunito font-bold text-kids-dark">{question.display}</p>
              </KidsCard>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {question.options.map((option, idx) => {
                  const isCorrect = idx === question.correctIdx;
                  const isSelected = selectedAnswer === idx;
                  let bgClass = 'bg-white';
                  if (showFeedback) {
                    if (isCorrect) bgClass = 'bg-green-50';
                    else if (isSelected && !isCorrect) bgClass = 'bg-red-50';
                  }
                  return (
                    <motion.button key={idx} className={`rounded-2xl p-4 sm:p-6 shadow-kids border-3 border-kids-lightgray hover:border-kids-sky transition-colors ${bgClass}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(idx)} disabled={showFeedback}>
                      <span className="text-base sm:text-lg font-nunito font-bold text-kids-dark block">{option}</span>
                      {showFeedback && isCorrect && <motion.span className="block text-sm text-kids-grass mt-1" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓ Correct!</motion.span>}
                      {showFeedback && isSelected && !isCorrect && <motion.span className="block text-sm text-kids-coral mt-1" initial={{ scale: 0 }} animate={{ scale: 1 }}>Try again!</motion.span>}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    );
  }

  /* RESULTS STATE */
  return (
    <main className="min-h-screen bg-kids-offwhite flex items-center justify-center">
      {showConfetti && <ConfettiParticles />}
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-full max-w-md px-4">
        <KidsCard variant="elevated" color={stars >= 2 ? 'sun' : 'coral'} padding="xl" className="text-center">
          <motion.div className="text-7xl mb-4" animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            {stars === 3 ? '🏆' : stars === 2 ? '🎉' : stars === 1 ? '👍' : '💪'}
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-nunito font-bold text-kids-dark mb-2">
            {stars === 3 ? 'Amazing!' : stars === 2 ? 'Great Job!' : stars === 1 ? 'Good Try!' : 'Keep Practicing!'}
          </h2>
          <p className="text-kids-text-secondary mb-4 font-nunito">You got {score} out of {totalQuestions} correct!</p>
          <div className="flex justify-center mb-6"><StarBadge count={stars} max={3} size={40} animate /></div>
          <div className="flex flex-col gap-3">
            <KidsButton variant="primary" size="early" onClick={() => startLesson(activeLessonIdx)}>Try Again 🔄</KidsButton>
            <KidsButton variant="outline" size="early" onClick={() => setState('select')}>All Lessons 📚</KidsButton>
          </div>
        </KidsCard>
      </motion.div>
    </main>
  );
}
