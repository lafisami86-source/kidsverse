'use client';

import { useState, useCallback, useEffect } from 'react';
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

type PageState = 'select' | 'learning' | 'quiz' | 'results';

interface LessonDef {
  id: string;
  title: string;
  emoji: string;
  range?: number[];
  difficulty: number;
  ageGroups: string[];
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const NUMBER_LESSONS: LessonDef[] = [
  { id: 'n1-5', title: 'Numbers 1-5', emoji: '🔢', range: [1, 2, 3, 4, 5], difficulty: 1, ageGroups: ['toddler', 'early', 'kid'] },
  { id: 'n6-10', title: 'Numbers 6-10', emoji: '🔢', range: [6, 7, 8, 9, 10], difficulty: 1, ageGroups: ['toddler', 'early', 'kid'] },
  { id: 'n11-15', title: 'Numbers 11-15', emoji: '🔢', range: [11, 12, 13, 14, 15], difficulty: 2, ageGroups: ['early', 'kid'] },
  { id: 'n16-20', title: 'Numbers 16-20', emoji: '🔢', range: [16, 17, 18, 19, 20], difficulty: 2, ageGroups: ['early', 'kid'] },
  { id: 'add', title: 'Simple Addition', emoji: '➕', difficulty: 2, ageGroups: ['early', 'kid'] },
  { id: 'sub', title: 'Simple Subtraction', emoji: '➖', difficulty: 2, ageGroups: ['early', 'kid'] },
  { id: 'patterns', title: 'Number Patterns', emoji: '🔗', difficulty: 2, ageGroups: ['early', 'kid'] },
  { id: 'by2', title: 'Count by 2s', emoji: '🦆', difficulty: 3, ageGroups: ['kid'] },
  { id: 'by5', title: 'Count by 5s', emoji: '✋', difficulty: 3, ageGroups: ['kid'] },
  { id: 'by10', title: 'Count by 10s', emoji: '🔟', difficulty: 3, ageGroups: ['kid'] },
];

const COUNTING_OBJECTS = ['🍎', '🌟', '🐟', '🦋', '🌸', '🎈', '🐶', '🐱', '🏀', '🚗'];

const COLOR_THEMES = ['sky', 'grass', 'sun', 'coral', 'lavender', 'mint', 'sky', 'grass', 'sun', 'coral'] as const;

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

function generateAdditionProblems() {
  const problems: { num1: number; num2: number; answer: number; emoji: string }[] = [];
  for (let i = 0; i < 5; i++) {
    const num1 = Math.floor(Math.random() * 8) + 1;
    const num2 = Math.floor(Math.random() * (10 - num1)) + 1;
    problems.push({ num1, num2, answer: num1 + num2, emoji: COUNTING_OBJECTS[Math.floor(Math.random() * COUNTING_OBJECTS.length)] });
  }
  return problems;
}

function generateSubtractionProblems() {
  const problems: { num1: number; num2: number; answer: number; emoji: string }[] = [];
  for (let i = 0; i < 5; i++) {
    const num1 = Math.floor(Math.random() * 8) + 2;
    const num2 = Math.floor(Math.random() * num1) + 1;
    problems.push({ num1, num2, answer: num1 - num2, emoji: COUNTING_OBJECTS[Math.floor(Math.random() * COUNTING_OBJECTS.length)] });
  }
  return problems;
}

function generatePatternProblems() {
  const patterns = [
    { sequence: [2, 4, 6, 8, undefined], answer: 10, step: 2 },
    { sequence: [1, 3, 5, 7, undefined], answer: 9, step: 2 },
    { sequence: [5, 10, 15, 20, undefined], answer: 25, step: 5 },
    { sequence: [10, 8, 6, 4, undefined], answer: 2, step: -2 },
    { sequence: [3, 6, 9, 12, undefined], answer: 15, step: 3 },
  ];
  return shuffleArray(patterns).slice(0, 5).map((p) => ({ ...p }));
}

function generateCountByProblems(step: number) {
  const start = step;
  const problems: { sequence: number[]; answer: number; choices: number[] }[] = [];
  let current = start;
  for (let i = 0; i < 5; i++) {
    const seq: number[] = [];
    for (let j = 0; j < 4; j++) {
      seq.push(current + j * step);
    }
    const correct = current + 4 * step;
    const wrongSet = new Set<number>();
    while (wrongSet.size < 2) {
      const w = correct + (Math.floor(Math.random() * 5) - 2) * step;
      if (w > 0 && w !== correct) wrongSet.add(w);
    }
    problems.push({ sequence: seq, answer: correct, choices: shuffleArray([correct, ...wrongSet]) });
    current = start + Math.floor(Math.random() * 3) * step;
  }
  return problems;
}

function makeChoices(correct: number): number[] {
  const wrongSet = new Set<number>();
  while (wrongSet.size < 2) {
    const w = Math.max(0, correct + Math.floor(Math.random() * 5) - 2);
    if (w !== correct) wrongSet.add(w);
  }
  return shuffleArray([correct, ...wrongSet]);
}

/* ------------------------------------------------------------------ */
/*  Confetti particles                                                 */
/* ------------------------------------------------------------------ */

function ConfettiParticles() {
  const colors = ['#FF6B6B', '#FFD93D', '#7ED957', '#60B5FF', '#C4B5FD', '#F472B6'];
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[i % colors.length],
    delay: Math.random() * 0.5,
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color, left: `${p.x}%`, top: '-20px' }}
          animate={{ y: ['0vh', '110vh'], rotate: [p.rotation, p.rotation + 720], opacity: [1, 1, 0] }}
          transition={{ duration: 2.5, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function NumbersPage() {
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
  const [isCounting, setIsCounting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Record<string, number>>(() =>
    getStoredProgress(getStoredProfile()?.id || '', 'numbers')
  );

  /* Persist completed lessons to localStorage */
  useEffect(() => {
    if (profile && Object.keys(completedLessons).length > 0) {
      try {
        localStorage.setItem(`kv-progress-numbers-${profile.id}`, JSON.stringify(completedLessons));
      } catch {
        // ignore
      }
    }
  }, [completedLessons, profile]);

  const ageGroup = profile ? getAgeGroup(profile.age) : 'kid';
  const visibleLessons = NUMBER_LESSONS.filter((l) => l.ageGroups.includes(ageGroup));

  const [additionProblems] = useState(generateAdditionProblems);
  const [subtractionProblems] = useState(generateSubtractionProblems);
  const [patternProblems] = useState(generatePatternProblems);
  const [by2Problems] = useState(() => generateCountByProblems(2));
  const [by5Problems] = useState(() => generateCountByProblems(5));
  const [by10Problems] = useState(() => generateCountByProblems(10));

  const activeLesson = NUMBER_LESSONS[activeLessonIdx];
  const totalQuestions = 5;

  const startLesson = useCallback(
    (idx: number) => {
      setActiveLessonIdx(idx);
      setCurrentStep(0);
      setScore(0);
      setWrongCount(0);
      setStars(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCounting(false);
      setState(NUMBER_LESSONS[idx].range ? 'learning' : 'quiz');
      playClick();
    },
    [playClick]
  );

  const countWithMe = useCallback(() => {
    if (!activeLesson.range || isCounting) return;
    setIsCounting(true);
    playClick();
    setTimeout(() => setIsCounting(false), activeLesson.range.length * 600 + 500);
  }, [activeLesson, isCounting, playClick]);

  const goToQuizFromCounting = useCallback(() => {
    setState('quiz');
    setCurrentStep(0);
    setScore(0);
    setWrongCount(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    playClick();
  }, [playClick]);

  const handleAnswer = useCallback(
    (answerIdx: number, correctIdx: number) => {
      if (showFeedback) return;
      setSelectedAnswer(answerIdx);
      setShowFeedback(true);

      const isCorrect = answerIdx === correctIdx;
      const newScore = score + (isCorrect ? 1 : 0);
      const newWrong = wrongCount + (isCorrect ? 0 : 1);

      if (isCorrect) playSuccess();
      else playError();

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
        }, 1200);
      } else {
        setScore(newScore);
        setWrongCount(newWrong);
        setTimeout(() => {
          setSelectedAnswer(null);
          setShowFeedback(false);
          setCurrentStep(nextStep);
        }, 1200);
      }
    },
    [showFeedback, score, wrongCount, currentStep, totalQuestions, playSuccess, playError, activeLesson, profile]
  );

  const getQuizQuestion = () => {
    const lessonId = activeLesson.id;
    if (lessonId === 'add') {
      const p = additionProblems[currentStep % additionProblems.length];
      return { display: `${p.num1} + ${p.num2} = ?`, emoji: p.emoji, answer: p.answer, choices: makeChoices(p.answer), visualCount: p.num1 + p.num2 };
    }
    if (lessonId === 'sub') {
      const p = subtractionProblems[currentStep % subtractionProblems.length];
      return { display: `${p.num1} - ${p.num2} = ?`, emoji: p.emoji, answer: p.answer, choices: makeChoices(p.answer), visualCount: p.num1, crossedOut: p.num2 };
    }
    if (lessonId === 'patterns') {
      const p = patternProblems[currentStep % patternProblems.length];
      return { display: `What comes next? ${[...p.sequence.slice(0, 4), ' _ '].join(', ')}`, answer: p.answer, choices: makeChoices(p.answer) };
    }
    if (lessonId === 'by2') {
      const p = by2Problems[currentStep % by2Problems.length];
      return { display: `Count by 2s: ${[...p.sequence, ' _ '].join(', ')}`, answer: p.answer, choices: p.choices };
    }
    if (lessonId === 'by5') {
      const p = by5Problems[currentStep % by5Problems.length];
      return { display: `Count by 5s: ${[...p.sequence, ' _ '].join(', ')}`, answer: p.answer, choices: p.choices };
    }
    if (lessonId === 'by10') {
      const p = by10Problems[currentStep % by10Problems.length];
      return { display: `Count by 10s: ${[...p.sequence, ' _ '].join(', ')}`, answer: p.answer, choices: p.choices };
    }
    return null;
  };

  /* No profile */
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kids-offwhite p-4">
        <KidsCard variant="elevated" color="sun" padding="xl" className="max-w-md text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">👤</motion.div>
          <h2 className="text-2xl font-nunito font-bold text-kids-dark mb-2">No Profile Selected</h2>
          <p className="text-kids-text-secondary mb-6">Please select a profile to start learning numbers!</p>
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
              <h1 className="text-2xl sm:text-3xl font-nunito font-bold text-kids-dark">🔢 Number Fun</h1>
              <p className="text-sm text-kids-text-secondary font-nunito">Hi {profile.name}! Pick a lesson to start!</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {visibleLessons.map((lesson) => {
              const completedStars = completedLessons[lesson.id] || 0;
              const globalIdx = NUMBER_LESSONS.indexOf(lesson);
              return (
                <KidsCard key={lesson.id} variant="interactive" color={COLOR_THEMES[globalIdx % COLOR_THEMES.length]} padding="md" onClick={() => startLesson(globalIdx)} className="flex flex-col items-center text-center">
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

  /* LEARNING STATE */
  if (state === 'learning' && activeLesson.range) {
    const num = activeLesson.range[currentStep];
    const emoji = COUNTING_OBJECTS[currentStep % COUNTING_OBJECTS.length];
    const isLast = currentStep >= activeLesson.range.length - 1;

    return (
      <main className="min-h-screen bg-kids-offwhite">
        {showConfetti && <ConfettiParticles />}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <KidsButton variant="ghost" size="icon" onClick={() => setState('select')} sound="click"><span className="text-2xl">←</span></KidsButton>
            <div className="flex-1">
              <p className="text-sm text-kids-text-secondary font-nunito">{activeLesson.title}</p>
              <div className="w-full bg-kids-lightgray rounded-full h-2 mt-1">
                <motion.div className="bg-kids-sky h-2 rounded-full" animate={{ width: `${((currentStep + 1) / activeLesson.range.length) * 100}%` }} transition={{ duration: 0.4 }} />
              </div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={num} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="bg-white rounded-3xl shadow-kids-lg p-6 sm:p-10 text-center mb-6">
              <motion.div className="text-7xl sm:text-9xl font-nunito font-black text-gradient-sky mb-6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>{num}</motion.div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 min-h-[60px]">
                {Array.from({ length: num }, (_, i) => (
                  <motion.span key={`${num}-${i}`} className={`text-3xl sm:text-4xl ${isCounting ? '' : 'opacity-0'}`} initial={{ scale: 0, y: 20 }} animate={isCounting ? { scale: 1, y: 0, opacity: 1 } : { scale: 0.6, opacity: 0.15 }} transition={{ type: 'spring', stiffness: 400, damping: 15, delay: isCounting ? i * 0.4 : 0 }}>{emoji}</motion.span>
                ))}
              </div>
              <KidsButton variant="primary" size={profile.age <= 6 ? 'toddler' : 'early'} onClick={countWithMe} disabled={isCounting}>
                {isCounting ? '🔔 Counting...' : '🔊 Count with me!'}
              </KidsButton>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between gap-4">
            <KidsButton variant="outline" size="early" onClick={() => setCurrentStep((s) => Math.max(0, s - 1))} disabled={currentStep === 0}>← Back</KidsButton>
            {isLast ? (
              <KidsButton variant="success" size="early" onClick={goToQuizFromCounting}>Take Quiz! 🎯</KidsButton>
            ) : (
              <KidsButton variant="primary" size="early" onClick={() => setCurrentStep((s) => s + 1)}>Next Number →</KidsButton>
            )}
          </div>
        </div>
      </main>
    );
  }

  /* QUIZ STATE */
  if (state === 'quiz') {
    const question = getQuizQuestion();
    if (!question) return null;

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
              <KidsCard variant="elevated" color="sky" padding="xl" className="text-center mb-6">
                <p className="text-lg sm:text-xl font-nunito font-bold text-kids-dark mb-4">{question.display}</p>
                {question.emoji && (
                  <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                    {Array.from({ length: (question.visualCount as number) || 0 }, (_, i) => (
                      <motion.span key={i} className="text-2xl sm:text-3xl" initial={{ scale: 0 }} animate={{ scale: 1, opacity: question.crossedOut && i >= ((question.visualCount as number) - (question.crossedOut as number)) ? 0.25 : 1 }} transition={{ delay: i * 0.05, type: 'spring', stiffness: 500, damping: 20 }}>{question.emoji}</motion.span>
                    ))}
                  </div>
                )}
              </KidsCard>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                {question.choices.map((choice, idx) => {
                  const isCorrect = choice === question.answer;
                  const isSelected = selectedAnswer === idx;
                  let borderClass = 'border-3 border-kids-lightgray hover:border-kids-sky';
                  if (showFeedback) {
                    if (isCorrect) borderClass = 'border-3 border-kids-grass bg-green-50';
                    else if (isSelected && !isCorrect) borderClass = 'border-3 border-kids-coral bg-red-50';
                  }
                  return (
                    <motion.button key={idx} className={`rounded-2xl p-4 sm:p-6 text-xl sm:text-2xl font-nunito font-bold bg-white shadow-kids ${borderClass} transition-colors`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(idx, question.choices.indexOf(question.answer))} disabled={showFeedback}>
                      {choice}
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
        <KidsCard variant="elevated" color={stars >= 2 ? 'sun' : 'sky'} padding="xl" className="text-center">
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
