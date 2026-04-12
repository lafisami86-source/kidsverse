'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, BookOpen, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KidsCard } from '@/components/kids/kids-card';
import { KidsButton } from '@/components/kids/kids-button';
import { KidsBadge } from '@/components/kids/kids-badge';
import { useAudio } from '@/hooks/use-audio';
import { useAgeGroup } from '@/hooks/use-age-group';

/* ------------------------------------------------------------------ */
/*  Story data                                                         */
/* ------------------------------------------------------------------ */

const STORIES_DB: Record<string, {
  title: string;
  icon: string;
  pages: { text: string; emoji: string; bg: string }[];
}> = {
  'lion-mouse': {
    title: 'The Lion & The Mouse',
    icon: '🦁',
    pages: [
      { text: 'Once upon a time, a mighty lion was sleeping in the forest.', emoji: '🦁', bg: 'from-green-100 to-emerald-100' },
      { text: 'A tiny mouse ran across the lion\'s nose by mistake! The lion woke up angry.', emoji: '🐭', bg: 'from-amber-100 to-yellow-100' },
      { text: '"Please let me go!" squeaked the mouse. "Maybe I can help you someday!"', emoji: '😞', bg: 'from-rose-100 to-pink-100' },
      { text: 'The lion laughed but let the mouse go free. "How could a tiny mouse help ME?"', emoji: '😄', bg: 'from-green-100 to-emerald-100' },
      { text: 'Days later, the lion got caught in a hunter\'s net! He roared for help.', emoji: '🪢', bg: 'from-sky-100 to-blue-100' },
      { text: 'The little mouse heard the lion and hurried to help!', emoji: '🐭', bg: 'from-amber-100 to-yellow-100' },
      { text: 'The mouse chewed through the ropes and set the lion free!', emoji: '✂️', bg: 'from-green-100 to-emerald-100' },
      { text: '"Thank you, little friend!" said the lion. "You were right — even the smallest friends can be the biggest help!"', emoji: '❤️', bg: 'from-rose-100 to-pink-100' },
    ],
  },
  'moon-rabbit': {
    title: 'The Moon Rabbit',
    icon: '🐰',
    pages: [
      { text: 'Long ago, a kind rabbit lived on Earth with her friends: a fox, a monkey, and an otter.', emoji: '🐰', bg: 'from-violet-100 to-purple-100' },
      { text: 'One day, a hungry old man came asking for food. Everyone wanted to help!', emoji: '👴', bg: 'from-amber-100 to-yellow-100' },
      { text: 'The monkey brought fruit, the otter brought fish, and the fox brought milk.', emoji: '🐒', bg: 'from-green-100 to-emerald-100' },
      { text: 'But the rabbit had no food to give. She only knew how to gather grass.', emoji: '😢', bg: 'from-rose-100 to-pink-100' },
      { text: 'So the rabbit jumped into the fire to offer herself as food for the old man.', emoji: '🔥', bg: 'from-red-100 to-orange-100' },
      { text: 'But the fire didn\'t hurt! The old man was a magical being, touched by her kindness.', emoji: '✨', bg: 'from-sky-100 to-blue-100' },
      { text: 'He took the rabbit to the moon, where she lives forever, making delicious rice cakes!', emoji: '🌕', bg: 'from-violet-100 to-purple-100' },
      { text: 'If you look at the moon, you can still see the rabbit with her rice cake mortar! 🍙', emoji: '🌙', bg: 'from-indigo-100 to-blue-100' },
    ],
  },
  'alphabet-forest': {
    title: 'Alphabet Forest Adventure',
    icon: '🌳',
    pages: [
      { text: 'Welcome to the Alphabet Forest! Every tree here grows a different letter of the alphabet!', emoji: '🌳', bg: 'from-green-100 to-emerald-100' },
      { text: 'Little Tim walked past the A tree. "A is for Apple!" he said, picking a shiny red apple.', emoji: '🍎', bg: 'from-red-100 to-orange-100' },
      { text: 'Next was the B tree. A beautiful blue bird was building a nest. "B is for Bird!"', emoji: '🐦', bg: 'from-sky-100 to-blue-100' },
      { text: 'He found the C tree with a cute orange cat sleeping on a branch. "C is for Cat!"', emoji: '🐱', bg: 'from-amber-100 to-yellow-100' },
      { text: 'The D tree had a dog playing with a big brown duck. "D is for Dog and Duck!" Tim laughed.', emoji: '🐶', bg: 'from-green-100 to-emerald-100' },
      { text: 'At the E tree, an elephant sprayed water everywhere! Tim danced in the rainbow that appeared.', emoji: '🐘', bg: 'from-violet-100 to-purple-100' },
      { text: 'Tim kept walking through F, G, H... all the way to Z! He learned every single letter!', emoji: '📖', bg: 'from-amber-100 to-yellow-100' },
      { text: '"I learned the whole alphabet!" Tim cheered. The forest animals clapped and sang with joy! 🎉', emoji: '🎉', bg: 'from-rose-100 to-pink-100' },
    ],
  },
  'brave-little-star': {
    title: 'The Brave Little Star',
    icon: '⭐',
    pages: [
      { text: 'High up in the night sky, a tiny star named Twinkle felt very small next to the big constellations.', emoji: '✨', bg: 'from-indigo-100 to-blue-100' },
      { text: '"I want to be part of a constellation too!" said Twinkle. The older stars laughed kindly.', emoji: '😢', bg: 'from-violet-100 to-purple-100' },
      { text: 'One night, a little girl on Earth was scared of the dark. She couldn\'t sleep at all.', emoji: '👧', bg: 'from-amber-100 to-yellow-100' },
      { text: 'Twinkle shone as brightly as she could, sending a warm golden glow through the girl\'s window.', emoji: '🌟', bg: 'from-yellow-100 to-amber-100' },
      { text: 'The girl saw Twinkle\'s light and smiled. "Look, a little star just for me!" She felt safe now.', emoji: '❤️', bg: 'from-rose-100 to-pink-100' },
      { text: 'Every night after that, Twinkle shone for the girl. Soon, other stars joined to form a pattern.', emoji: '⭐', bg: 'from-indigo-100 to-blue-100' },
      { text: 'The big constellations gasped — Twinkle had created the most beautiful new constellation of all!', emoji: '🤩', bg: 'from-sky-100 to-blue-100' },
      { text: '"You don\'t need to be big to be important," they said. Twinkle twinkled the brightest that night! 🌟', emoji: '🌟', bg: 'from-violet-100 to-purple-100' },
    ],
  },
  'giggly-giraffe': {
    title: 'The Giggly Giraffe',
    icon: '🦒',
    pages: [
      { text: 'Gerry the Giraffe had a very special talent — he could not stop laughing! Everything was funny to him.', emoji: '🦒', bg: 'from-amber-100 to-yellow-100' },
      { text: 'When the wind blew, Gerry giggled. When a butterfly landed on his nose, he laughed out loud!', emoji: '🦋', bg: 'from-green-100 to-emerald-100' },
      { text: 'The other animals were confused. "Why do you laugh all the time?" asked Zara the Zebra.', emoji: '🦓', bg: 'from-rose-100 to-pink-100' },
      { text: '"Because the world is wonderful!" said Gerry, bending his long neck to smile at Zara.', emoji: '😊', bg: 'from-sky-100 to-blue-100' },
      { text: 'One day, everyone was grumpy because it rained and they couldn\'t play outside.', emoji: '🌧️', bg: 'from-slate-100 to-gray-200' },
      { text: 'Gerry started to giggle. Then he splashed in a puddle and did a silly dance in the rain!', emoji: '💃', bg: 'from-blue-100 to-indigo-100' },
      { text: 'The other animals watched... and started to smile. Then they laughed! Soon everyone was dancing!', emoji: '🎉', bg: 'from-green-100 to-emerald-100' },
      { text: '"See?" said Gerry. "Even rainy days are fun when you laugh!" And everyone agreed! 😄', emoji: '🌈', bg: 'from-amber-100 to-yellow-100' },
    ],
  },
  'ocean-friends': {
    title: 'Friends of the Ocean',
    icon: '🐬',
    pages: [
      { text: 'Deep in the blue ocean, a playful dolphin named Fin was looking for a new friend to explore with.', emoji: '🐬', bg: 'from-sky-100 to-blue-100' },
      { text: 'He found Shelly the Seahorse hiding in some coral. "Want to explore?" Fin asked with a smile.', emoji: '🐡', bg: 'from-green-100 to-emerald-100' },
      { text: 'They swam past colorful fish, waving seaweed, and shiny bubbles floating up to the surface.', emoji: '🐠', bg: 'from-teal-100 to-cyan-100' },
      { text: '"Look!" said Shelly. A big sea turtle was stuck in some plastic. "We have to help!"', emoji: '🐢', bg: 'from-amber-100 to-yellow-100' },
      { text: 'Fin used his nose to push the plastic away while Shelly wiggled through the gaps to untangle it.', emoji: '💪', bg: 'from-sky-100 to-blue-100' },
      { text: 'The turtle was free! "Thank you, little friends!" she said. "My name is Tessa. Let me take you somewhere special."', emoji: '🐢', bg: 'from-green-100 to-emerald-100' },
      { text: 'Tessa led them to a hidden cave filled with glowing jellyfish — it was the most magical place ever!', emoji: '🪼', bg: 'from-violet-100 to-purple-100' },
      { text: 'From that day on, Fin, Shelly, and Tessa explored the ocean together — the best of friends! 🌊', emoji: '💙', bg: 'from-sky-100 to-blue-100' },
    ],
  },
  'counting-caterpillar': {
    title: 'The Counting Caterpillar',
    icon: '🐛',
    pages: [
      { text: 'Cody the Caterpillar was very hungry! He wanted to eat 10 things, but first he had to count them.', emoji: '🐛', bg: 'from-green-100 to-emerald-100' },
      { text: '"1 apple!" Cody counted, taking a big bite. "Mmm, that\'s delicious!"', emoji: '🍎', bg: 'from-red-100 to-orange-100' },
      { text: '"2 pears, 3 bananas!" He arranged the fruit in a nice neat row on his leaf.', emoji: '🍌', bg: 'from-yellow-100 to-amber-100' },
      { text: '"4 strawberries, 5 blueberries!" Cody was getting really full now. His tummy was round!', emoji: '🍓', bg: 'from-rose-100 to-pink-100' },
      { text: '"6 grapes, 7 cherries!" His friend Bella Butterfly helped him carry more fruit.', emoji: '🍇', bg: 'from-violet-100 to-purple-100' },
      { text: '"8 cookies, 9 marshmallows!" Wait — those weren\'t fruit! Cody giggled and ate them anyway.', emoji: '🍪', bg: 'from-amber-100 to-yellow-100' },
      { text: '"And 10... a big juicy watermelon!" Cody was so full he rolled right off the leaf! "1, 2, 3... SPLASH!"', emoji: '🍉', bg: 'from-green-100 to-emerald-100' },
      { text: 'Cody ate 10 things, counted to 10, and soon turned into a beautiful butterfly! What a day! 🦋', emoji: '🦋', bg: 'from-sky-100 to-blue-100' },
    ],
  },
  'dragon-dreams': {
    title: 'Dragon Dreams',
    icon: '🐉',
    pages: [
      { text: 'Draco the Dragon was different from other dragons. Instead of breathing fire, he breathed colorful bubbles!', emoji: '🐉', bg: 'from-violet-100 to-purple-100' },
      { text: 'The other dragons laughed. "Dragons should breathe fire, not bubbles!" they said.', emoji: '😢', bg: 'from-rose-100 to-pink-100' },
      { text: 'Draco felt sad and flew to a quiet cave. "Why can\'t I be like everyone else?" he wondered.', emoji: '🫧', bg: 'from-slate-100 to-gray-200' },
      { text: 'That night, a lost baby bird was crying in the forest. All the fire-breathing dragons scared it away!', emoji: '🐦', bg: 'from-amber-100 to-yellow-100' },
      { text: 'Draco gently blew soft, glowing bubbles. They floated around the baby bird like a warm blanket of light.', emoji: '✨', bg: 'from-sky-100 to-blue-100' },
      { text: 'The baby bird stopped crying and hopped onto Draco\'s nose. "Thank you, kind dragon!" it chirped.', emoji: '❤️', bg: 'from-rose-100 to-pink-100' },
      { text: 'The other dragons saw this and were amazed. "Your bubbles are magical, Draco! We\'re sorry we laughed."', emoji: '🤩', bg: 'from-green-100 to-emerald-100' },
      { text: 'Draco smiled and blew a rainbow of bubbles. "Being different is my superpower!" 🌈', emoji: '🌈', bg: 'from-amber-100 to-yellow-100' },
    ],
  },
  'sleepy-owl': {
    title: 'The Sleepy Owl',
    icon: '🦉',
    pages: [
      { text: 'Oliver the Owl was the sleepiest owl in the whole forest. When other owls were awake at night, Oliver was yawning.', emoji: '🦉', bg: 'from-indigo-100 to-blue-100' },
      { text: '"I want to see the sunrise!" Oliver said. "That\'s when the sky turns pink and gold and the world wakes up!"', emoji: '🌅', bg: 'from-amber-100 to-yellow-100' },
      { text: 'But every time he tried to stay awake, his eyes would get heavy... heavier... and he\'d fall asleep!', emoji: '😴', bg: 'from-violet-100 to-purple-100' },
      { text: 'His friend Luna the Firefly offered to help. "I\'ll flash my light whenever you start to nod off!"', emoji: '🪲', bg: 'from-yellow-100 to-amber-100' },
      { text: 'Oliver tried again. Flash! "I\'m awake!" he said. Flash flash! "Still awake!" This was hard work!', emoji: '💡', bg: 'from-green-100 to-emerald-100' },
      { text: 'The sky started getting lighter. "It\'s almost time!" whispered Luna. Oliver\'s eyes were so very heavy...', emoji: '👁️', bg: 'from-sky-100 to-blue-100' },
      { text: 'Then... the first ray of sunlight appeared! Oliver opened his eyes wide. "It\'s... BEAUTIFUL!" he gasped.', emoji: '☀️', bg: 'from-orange-100 to-amber-100' },
      { text: 'The golden sunrise was the most wonderful thing Oliver had ever seen. "Worth every sleepy moment!" he smiled. 🌅', emoji: '🦉', bg: 'from-rose-100 to-pink-100' },
    ],
  },
};

// Default story for any story ID not in DB
const DEFAULT_STORY = {
  title: 'A Wonderful Story',
  icon: '📖',
  pages: [
    { text: 'Once upon a time, in a land far away, something magical was about to happen!', emoji: '🌟', bg: 'from-amber-100 to-yellow-100' },
    { text: 'The animals of the forest gathered together to share stories and laughter.', emoji: '🦁', bg: 'from-green-100 to-emerald-100' },
    { text: 'Each friend had something special to share. What matters most is being kind.', emoji: '❤️', bg: 'from-rose-100 to-pink-100' },
    { text: 'And they all lived happily ever after! The End. 🎉', emoji: '🌟', bg: 'from-sky-100 to-blue-100' },
  ],
};

const STORAGE_KEY = 'kv-active-profile';

function getStoredProfile() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function speakText(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.7;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function StoryViewer() {
  const router = useRouter();
  const { play: playPop } = useAudio({ frequency: 600, type: 'triangle' });
  const { play: playSuccess } = useAudio({ frequency: 1200, type: 'sine' });

  const [profile, setProfile] = useState<{ name: string; age: number; id?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const storyId = typeof window !== 'undefined'
    ? window.location.pathname.split('/stories/')[1] || 'lion-mouse'
    : 'lion-mouse';

  const story = STORIES_DB[storyId] || DEFAULT_STORY;
  const totalPages = story.pages.length;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      const p = getStoredProfile();
      setProfile(p);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const ageConfig = useAgeGroup(profile?.age ?? 5);
  const isToddler = ageConfig.ageGroup === 'toddler';

  const handlePrev = useCallback(() => {
    if (currentPage > 0) {
      playPop();
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage, playPop]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      playPop();
      setCurrentPage((p) => p + 1);
      if (currentPage === totalPages - 2) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4000);
      }
    } else {
      playSuccess();
      router.replace('/stories');
    }
  }, [currentPage, totalPages, playPop, playSuccess, router]);

  const handleReadAloud = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else {
      speakText(story.pages[currentPage].text);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 5000);
    }
  }, [currentPage, story, isSpeaking]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kids-offwhite">
        <div className="text-6xl animate-bounce">📖</div>
      </div>
    );
  }

  const page = story.pages[currentPage];

  return (
    <div className="min-h-screen bg-kids-offwhite flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-2xl flex items-center justify-between px-4 h-14">
          <button
            type="button"
            onClick={() => { playPop(); router.replace('/stories'); }}
            className="flex items-center gap-2 rounded-2xl px-2 py-1 hover:bg-kids-lightgray transition-colors"
          >
            <ArrowLeft className="size-5 text-kids-dark" />
            <span className="hidden sm:inline text-sm font-nunito font-bold text-kids-dark">Stories</span>
          </button>
          <h1 className="text-sm sm:text-base font-nunito font-extrabold text-kids-dark truncate max-w-[200px]">
            {story.title}
          </h1>
          <KidsBadge variant="default" size="sm">
            {currentPage + 1}/{totalPages}
          </KidsBadge>
        </div>
      </header>

      {/* Story content */}
      <main className="flex-1 flex flex-col mx-auto max-w-2xl w-full px-3 py-3 sm:px-4 sm:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className={cn('flex-1 flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br px-5 py-5 sm:px-10 sm:py-8 shadow-kids-lg', page.bg)}
          >
            {/* Page emoji */}
            <motion.span
              className="text-5xl sm:text-7xl mb-4 sm:mb-6"
              animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {page.emoji}
            </motion.span>

            {/* Story text */}
            <p className={cn(
              'font-nunito text-kids-dark text-center leading-relaxed max-w-md sm:max-w-lg',
              isToddler ? 'text-lg sm:text-xl' : 'text-sm sm:text-base',
            )}>
              {page.text}
            </p>

            {/* Read aloud button */}
            <motion.button
              type="button"
              onClick={handleReadAloud}
              className={cn(
                'mt-4 sm:mt-6 px-4 py-2 rounded-2xl bg-white/80 shadow-kids font-nunito font-bold flex items-center gap-2 hover:bg-white transition-colors',
                'text-kids-sky text-xs sm:text-sm',
              )}
              whileTap={{ scale: 0.95 }}
            >
              <Volume2 className="size-3.5 sm:size-4" />
              {isSpeaking ? 'Stop' : 'Read Aloud'}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="sticky bottom-0 bg-white border-t border-kids-lightgray shadow-sm">
        <div className="mx-auto max-w-2xl flex items-center justify-between px-4 h-16">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-2xl font-nunito font-bold text-sm transition-all',
              currentPage === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-kids-dark bg-kids-lightgray/60 hover:bg-kids-lightgray active:scale-95',
            )}
          >
            <ChevronLeft className="size-5" />
            {isToddler ? '' : 'Back'}
          </button>

          {/* Progress dots */}
          <div className="flex gap-2">
            {story.pages.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full transition-all',
                  i === currentPage
                    ? 'bg-kids-sky w-3 h-3'
                    : 'bg-gray-300 w-2.5 h-2.5',
                )}
              />
            ))}
          </div>

          <KidsButton
            variant="primary"
            size="early"
            onClick={handleNext}
            rightIcon={<ChevronRight className="size-5" />}
            sound="pop"
          >
            {currentPage === totalPages - 1 ? (isToddler ? '🏠' : 'Done!') : (isToddler ? '▶️' : 'Next')}
          </KidsButton>
        </div>
      </nav>

      {/* Celebration overlay when reaching last page */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            {/* Confetti particles */}
            {['🎉', '⭐', '🌟', '💫', '🎊', '✨', '🏆', '❤️'].map((emoji, i) => (
              <motion.span
                key={i}
                className="absolute text-3xl sm:text-4xl"
                initial={{ y: -100, x: (i - 4) * 60, opacity: 1, rotate: 0 }}
                animate={{ y: 600, opacity: 0, rotate: 360 }}
                transition={{ duration: 2.5, delay: i * 0.15, ease: 'easeIn' }}
              >
                {emoji}
              </motion.span>
            ))}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
              className="bg-white rounded-3xl px-8 py-6 shadow-kids-lg text-center"
            >
              <motion.span
                className="text-5xl sm:text-6xl block mb-3"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1, repeat: 3 }}
              >
                📖
              </motion.span>
              <p className="font-nunito font-extrabold text-kids-dark text-lg sm:text-xl">
                {isToddler ? 'Yay! The End!' : 'Story Complete!'}
              </p>
              <p className="text-sm text-kids-text-secondary mt-1">
                {isToddler ? '' : 'Great job reading!'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
