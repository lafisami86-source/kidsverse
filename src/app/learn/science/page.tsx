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

interface FactCard {
  title: string;
  emoji: string;
  fact: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface ScienceLessonDef {
  id: string;
  title: string;
  emoji: string;
  difficulty: number;
  ageGroups: string[];
  cards: FactCard[];
  quiz: QuizQuestion[];
}

/* ------------------------------------------------------------------ */
/*  Static data — ALL 8 LESSONS                                        */
/* ------------------------------------------------------------------ */

const SCIENCE_LESSONS: ScienceLessonDef[] = [
  {
    id: 'body',
    title: 'My Body',
    emoji: '🧍',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    cards: [
      { title: 'My Head', emoji: '🗣️', fact: 'Your head has your brain, eyes, ears, nose, and mouth. Your brain helps you think and learn new things every day!' },
      { title: 'My Hands', emoji: '🤚', fact: 'Your hands have 5 fingers each. You use them to hold things, draw pictures, wave hello, and build with blocks!' },
      { title: 'My Feet', emoji: '🦶', fact: 'Your feet help you stand, walk, run, and jump. You have 5 toes on each foot to help you balance!' },
      { title: 'My Heart', emoji: '❤️', fact: 'Your heart pumps blood through your body. It beats about 100,000 times every single day, even when you sleep!' },
    ],
    quiz: [
      { question: 'What helps you think?', options: ['🧠 Brain', '🦶 Feet', '🤚 Hands'], answer: 0 },
      { question: 'How many fingers on one hand?', options: ['3', '5', '10'], answer: 1 },
      { question: 'What pumps blood in your body?', options: ['🦴 Bones', '❤️ Heart', '🫁 Lungs'], answer: 1 },
    ],
  },
  {
    id: 'animals',
    title: 'Animals Around Us',
    emoji: '🐾',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    cards: [
      { title: 'Dogs', emoji: '🐕', fact: "Dogs are loyal friends! They can hear sounds we cannot. A dog's nose is so powerful it can smell things from very far away!" },
      { title: 'Cats', emoji: '🐈', fact: 'Cats are amazing jumpers! They can jump up to 6 times their own length. Cats sleep about 13 to 16 hours every day!' },
      { title: 'Birds', emoji: '🐦', fact: 'Birds have hollow bones that help them fly! They use their feathers to stay warm and to fly through the sky.' },
      { title: 'Fish', emoji: '🐟', fact: 'Fish breathe underwater using gills! There are over 30,000 different kinds of fish living in oceans, rivers, and lakes.' },
    ],
    quiz: [
      { question: 'Which animal can hear sounds we cannot?', options: ['🐕 Dogs', '🐈 Cats', '🐦 Birds'], answer: 0 },
      { question: 'How much do cats sleep each day?', options: ['2 hours', '8 hours', '13-16 hours'], answer: 2 },
      { question: 'What helps birds fly?', options: ['Heavy bones', 'Hollow bones', 'No bones'], answer: 1 },
    ],
  },
  {
    id: 'plants',
    title: 'Plants & Flowers',
    emoji: '🌱',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    cards: [
      { title: 'Seeds', emoji: '🌰', fact: 'Every plant starts from a tiny seed! A seed needs water, sunlight, and soil to grow into a big, beautiful plant.' },
      { title: 'Roots', emoji: '🌿', fact: 'Roots grow underground and drink up water and nutrients from the soil. They also help hold the plant firmly in place!' },
      { title: 'Leaves', emoji: '🍃', fact: 'Leaves are like little kitchens for plants! They use sunlight to make food in a process called photosynthesis.' },
      { title: 'Flowers', emoji: '🌸', fact: 'Flowers are beautiful and they help plants make new seeds! Bees and butterflies visit flowers to drink sweet nectar.' },
    ],
    quiz: [
      { question: 'What does a seed need to grow?', options: ['Just water', 'Water, sunlight, and soil', 'Only sunlight'], answer: 1 },
      { question: 'What do roots do underground?', options: ['Make flowers', 'Drink water and nutrients', 'Catch sunlight'], answer: 1 },
      { question: 'What process do leaves use to make food?', options: ['Cooking', 'Photosynthesis', 'Sleeping'], answer: 1 },
    ],
  },
  {
    id: 'weather',
    title: 'Weather',
    emoji: '🌤️',
    difficulty: 1,
    ageGroups: ['toddler', 'early', 'kid'],
    cards: [
      { title: 'The Sun', emoji: '☀️', fact: 'The sun gives us light and warmth! It is a giant star and is so big that about 1 million Earths could fit inside it!' },
      { title: 'Rain', emoji: '🌧️', fact: 'Rain comes from clouds. Water from oceans and lakes evaporates, rises up, and falls back down as raindrops!' },
      { title: 'Snow', emoji: '❄️', fact: 'Snow is made of tiny ice crystals! Every snowflake has 6 sides, and no two snowflakes are exactly alike!' },
      { title: 'Wind', emoji: '💨', fact: 'Wind is moving air! You cannot see wind, but you can feel it on your face and see it moving leaves and kites.' },
    ],
    quiz: [
      { question: 'What does the sun give us?', options: ['Snow and ice', 'Light and warmth', 'Wind and rain'], answer: 1 },
      { question: 'What shape do snowflakes have?', options: ['5 sides', '6 sides', '8 sides'], answer: 1 },
      { question: 'Wind is made of what?', options: ['Water', 'Moving air', 'Sunlight'], answer: 1 },
    ],
  },
  {
    id: 'senses',
    title: 'The 5 Senses',
    emoji: '👁️',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    cards: [
      { title: 'Sight', emoji: '👁️', fact: 'Your eyes help you see the world! They can see millions of colors. Your eyes work together with your brain to understand what you see.' },
      { title: 'Hearing', emoji: '👂', fact: 'Your ears help you hear sounds! Music, birds singing, and your friends talking — your ears can hear all of these!' },
      { title: 'Smell', emoji: '👃', fact: 'Your nose helps you smell! You can smell yummy cookies baking, pretty flowers, and fresh rain. Your nose can remember thousands of smells!' },
      { title: 'Taste', emoji: '👅', fact: 'Your tongue helps you taste food! It has tiny bumps called taste buds. You can taste sweet, salty, sour, and bitter flavors.' },
      { title: 'Touch', emoji: '🤚', fact: 'Your skin helps you feel things! You can feel if something is hot, cold, soft, or rough. Your fingertips are extra sensitive!' },
    ],
    quiz: [
      { question: 'Which body part helps you see?', options: ['👁️ Eyes', '👂 Ears', '👃 Nose'], answer: 0 },
      { question: 'Which sense tells you if food is sweet?', options: ['👃 Smell', '👅 Taste', '🤚 Touch'], answer: 1 },
      { question: 'What do you use to hear music?', options: ['👁️ Eyes', '👂 Ears', '👅 Tongue'], answer: 1 },
    ],
  },
  {
    id: 'habitats',
    title: 'Habitats',
    emoji: '🌍',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    cards: [
      { title: 'The Ocean', emoji: '🌊', fact: 'The ocean covers most of our planet! It is home to amazing creatures like whales, dolphins, jellyfish, and colorful coral reefs.' },
      { title: 'The Forest', emoji: '🌲', fact: 'Forests are full of tall trees and wildlife! Deer, owls, squirrels, and bears all call the forest their home.' },
      { title: 'The Desert', emoji: '🏜️', fact: 'Deserts are very dry places! Animals like camels, lizards, and snakes have special ways to survive with very little water.' },
      { title: 'The Arctic', emoji: '🧊', fact: 'The Arctic is very cold and icy! Polar bears, penguins, and seals live there. The ice can be as thick as a tall building!' },
    ],
    quiz: [
      { question: 'Which animal lives in the ocean?', options: ['🐋 Whale', '🦌 Deer', '🦎 Lizard'], answer: 0 },
      { question: 'Which habitat is very dry?', options: ['🌲 Forest', '🌊 Ocean', '🏜️ Desert'], answer: 2 },
      { question: 'Where do polar bears live?', options: ['🏜️ Desert', '🧊 Arctic', '🌲 Forest'], answer: 1 },
    ],
  },
  {
    id: 'lifecycles',
    title: 'Life Cycles',
    emoji: '🔄',
    difficulty: 2,
    ageGroups: ['early', 'kid'],
    cards: [
      { title: 'Butterfly Life Cycle', emoji: '🦋', fact: 'A butterfly starts as a tiny egg, becomes a caterpillar, wraps itself in a chrysalis, and transforms into a beautiful butterfly!' },
      { title: 'Frog Life Cycle', emoji: '🐸', fact: 'A frog begins as an egg in water, hatches into a tadpole with a tail, grows legs, loses its tail, and becomes a jumping frog!' },
      { title: 'Plant Life Cycle', emoji: '🌻', fact: 'A plant starts as a seed, sprouts into a seedling, grows stems and leaves, blooms into a flower, and makes new seeds!' },
      { title: 'Chicken Life Cycle', emoji: '🐣', fact: 'A chicken starts as an egg in a nest, hatches into a chick, grows feathers, and becomes an adult chicken that can lay more eggs!' },
    ],
    quiz: [
      { question: 'What does a caterpillar become?', options: ['🦋 Butterfly', '🐸 Frog', '🐟 Fish'], answer: 0 },
      { question: 'What does a tadpole have that a frog does not?', options: ['Legs', 'A tail', 'Eyes'], answer: 1 },
      { question: 'What does a plant start from?', options: ['A leaf', 'A seed', 'A flower'], answer: 1 },
    ],
  },
  {
    id: 'solar',
    title: 'Solar System',
    emoji: '🚀',
    difficulty: 3,
    ageGroups: ['kid'],
    cards: [
      { title: 'The Sun', emoji: '☀️', fact: 'The sun is the center of our solar system! It is a huge ball of hot gas. All 8 planets orbit around the sun!' },
      { title: 'The Moon', emoji: '🌙', fact: "The moon is Earth's natural satellite! It goes around the Earth about once every 27 days. The moon changes shape as it orbits!" },
      { title: 'Earth', emoji: '🌍', fact: 'Earth is our home planet! It is the only planet known to have liquid water and life. It has one moon.' },
      { title: 'The Stars', emoji: '⭐', fact: 'Stars are giant balls of hot glowing gas! Our sun is a star. There are billions and billions of stars in the universe!' },
    ],
    quiz: [
      { question: 'How many planets orbit our sun?', options: ['5', '8', '10'], answer: 1 },
      { question: "What is Earth's natural satellite?", options: ['☀️ The Sun', '🌙 The Moon', '⭐ A Star'], answer: 1 },
      { question: 'Which planet do we live on?', options: ['Mars', '🌍 Earth', 'Jupiter'], answer: 1 },
    ],
  },
];

const CARD_COLORS = ['coral', 'sun', 'grass', 'sky', 'lavender', 'mint', 'coral', 'sun'] as const;

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
  if (wrong <= 2) return 1;
  return 0;
}

function speakText(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.15;
    window.speechSynthesis.speak(utterance);
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

export default function SciencePage() {
  const router = useRouter();
  const { play: playClick } = useAudio({ frequency: 800, type: 'sine' });
  const { play: playSuccess } = useAudio({ frequency: 1200, type: 'sine' });
  const { play: playError } = useAudio({ frequency: 300, type: 'square', duration: 200 });

  const [profile] = useState<ActiveProfile | null>(() => getStoredProfile());
  const [state, setState] = useState<PageState>('select');
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [currentCard, setCurrentCard] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [stars, setStars] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Record<string, number>>(() =>
    getStoredProgress(getStoredProfile()?.id || '', 'science')
  );

  const activeLesson = SCIENCE_LESSONS[activeLessonIdx];
  const totalCards = activeLesson.cards.length;
  const totalQuestions = activeLesson.quiz.length;

  /* Persist completed lessons */
  useEffect(() => {
    if (profile && Object.keys(completedLessons).length > 0) {
      try {
        localStorage.setItem(`kv-progress-science-${profile.id}`, JSON.stringify(completedLessons));
      } catch {
        // ignore
      }
    }
  }, [completedLessons, profile]);

  const ageGroup = profile ? getAgeGroup(profile.age) : 'kid';
  const visibleLessons = SCIENCE_LESSONS.filter((l) => l.ageGroups.includes(ageGroup));

  const startLesson = useCallback(
    (idx: number) => {
      setActiveLessonIdx(idx);
      setCurrentCard(0);
      setCurrentStep(0);
      setScore(0);
      setWrongCount(0);
      setStars(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setState('learning');
      playClick();
    },
    [playClick]
  );

  const readAloud = useCallback(() => {
    const card = SCIENCE_LESSONS[activeLessonIdx].cards[currentCard];
    if (card && !isSpeaking) {
      setIsSpeaking(true);
      speakText(`${card.title}. ${card.fact}`);
      setTimeout(() => setIsSpeaking(false), 5000);
    }
  }, [activeLessonIdx, currentCard, isSpeaking]);

  const nextCard = useCallback(() => {
    if (currentCard < totalCards - 1) {
      setCurrentCard((c) => c + 1);
      playClick();
    } else {
      setState('quiz');
      setCurrentStep(0);
      playClick();
    }
  }, [currentCard, totalCards, playClick]);

  const handleAnswer = useCallback(
    (answerIdx: number) => {
      if (showFeedback) return;
      setSelectedAnswer(answerIdx);
      setShowFeedback(true);

      const quizQ = activeLesson.quiz[currentStep];
      const isCorrect = answerIdx === quizQ.answer;
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
    [showFeedback, activeLesson, currentStep, score, wrongCount, totalQuestions, playSuccess, playError, profile]
  );

  /* No profile */
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kids-offwhite p-4">
        <KidsCard variant="elevated" color="grass" padding="xl" className="max-w-md text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">👤</motion.div>
          <h2 className="text-2xl font-nunito font-bold text-kids-dark mb-2">No Profile Selected</h2>
          <p className="text-kids-text-secondary mb-6">Please select a profile to start exploring science!</p>
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
              <h1 className="text-2xl sm:text-3xl font-nunito font-bold text-kids-dark">🔬 Science Explorer</h1>
              <p className="text-sm text-kids-text-secondary font-nunito">Hi {profile.name}! Discover amazing things about our world!</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {visibleLessons.map((lesson) => {
              const completedStars = completedLessons[lesson.id] || 0;
              const globalIdx = SCIENCE_LESSONS.indexOf(lesson);
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

  /* LEARNING STATE (Flashcards) */
  if (state === 'learning') {
    const card = activeLesson.cards[currentCard];

    return (
      <main className="min-h-screen bg-kids-offwhite">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <KidsButton variant="ghost" size="icon" onClick={() => setState('select')} sound="click"><span className="text-2xl">←</span></KidsButton>
            <div className="flex-1">
              <p className="text-sm text-kids-text-secondary font-nunito">{activeLesson.emoji} {activeLesson.title}</p>
              <div className="w-full bg-kids-lightgray rounded-full h-2 mt-1">
                <motion.div className="bg-kids-sky h-2 rounded-full" animate={{ width: `${((currentCard + 1) / totalCards) * 100}%` }} transition={{ duration: 0.4 }} />
              </div>
            </div>
            <KidsBadge variant="default" size="md">{currentCard + 1}/{totalCards}</KidsBadge>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={currentCard} initial={{ opacity: 0, rotateY: -30, scale: 0.9 }} animate={{ opacity: 1, rotateY: 0, scale: 1 }} exit={{ opacity: 0, rotateY: 30, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="mb-6">
              <KidsCard variant="elevated" color={CARD_COLORS[activeLessonIdx % CARD_COLORS.length]} padding="xl" className="text-center">
                <motion.span className="text-7xl sm:text-8xl block mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>{card.emoji}</motion.span>
                <h2 className="text-2xl sm:text-3xl font-nunito font-bold text-kids-dark mb-4">{card.title}</h2>
                <p className="text-base sm:text-lg text-kids-text-secondary font-nunito leading-relaxed max-w-md mx-auto">{card.fact}</p>
              </KidsCard>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center mb-6">
            <KidsButton variant="accent" size="early" onClick={readAloud} disabled={isSpeaking} leftIcon={<span className="text-xl">{isSpeaking ? '🔊' : '🗣️'}</span>}>
              {isSpeaking ? 'Reading...' : 'Read to Me'}
            </KidsButton>
          </div>
          <div className="flex justify-between gap-4">
            <KidsButton variant="outline" size="early" onClick={() => setCurrentCard((c) => Math.max(0, c - 1))} disabled={currentCard === 0}>← Back</KidsButton>
            <KidsButton variant={currentCard >= totalCards - 1 ? 'success' : 'primary'} size="early" onClick={nextCard}>
              {currentCard >= totalCards - 1 ? 'Take Quiz! 🎯' : 'Next Card →'}
            </KidsButton>
          </div>
        </div>
      </main>
    );
  }

  /* QUIZ STATE */
  if (state === 'quiz') {
    const quizQ = activeLesson.quiz[currentStep];

    return (
      <main className="min-h-screen bg-kids-offwhite">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <KidsButton variant="ghost" size="icon" onClick={() => setState('select')} sound="click"><span className="text-2xl">←</span></KidsButton>
            <div className="flex-1">
              <p className="text-sm text-kids-text-secondary font-nunito">{activeLesson.emoji} {activeLesson.title} — Quiz</p>
              <div className="w-full bg-kids-lightgray rounded-full h-2 mt-1">
                <motion.div className="bg-kids-grass h-2 rounded-full" animate={{ width: `${(currentStep / totalQuestions) * 100}%` }} transition={{ duration: 0.4 }} />
              </div>
            </div>
            <KidsBadge variant="default" size="md">{score}/{currentStep}</KidsBadge>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <KidsCard variant="elevated" color="sky" padding="xl" className="text-center mb-6">
                <p className="text-lg sm:text-xl font-nunito font-bold text-kids-dark">{quizQ.question}</p>
              </KidsCard>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {quizQ.options.map((option, idx) => {
                  const isCorrect = idx === quizQ.answer;
                  const isSelected = selectedAnswer === idx;
                  let borderClass = 'border-3 border-kids-lightgray hover:border-kids-sky';
                  let bgClass = 'bg-white';
                  if (showFeedback) {
                    if (isCorrect) { borderClass = 'border-3 border-kids-grass'; bgClass = 'bg-green-50'; }
                    else if (isSelected && !isCorrect) { borderClass = 'border-3 border-kids-coral'; bgClass = 'bg-red-50'; }
                  }
                  return (
                    <motion.button key={idx} className={`rounded-2xl p-4 sm:p-6 shadow-kids transition-colors text-center ${borderClass} ${bgClass}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(idx)} disabled={showFeedback}>
                      <span className="text-lg sm:text-xl font-nunito font-bold text-kids-dark block">{option}</span>
                      {showFeedback && isCorrect && <motion.span className="block text-sm text-kids-grass mt-2" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓ Correct!</motion.span>}
                      {showFeedback && isSelected && !isCorrect && <motion.span className="block text-sm text-kids-coral mt-2" initial={{ scale: 0 }} animate={{ scale: 1 }}>Try again!</motion.span>}
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
        <KidsCard variant="elevated" color={stars >= 2 ? 'sun' : 'grass'} padding="xl" className="text-center">
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
