'use client';

import { motion, AnimatePresence } from 'framer-motion';

/**
 * Props for the `Mascot` component.
 */
interface MascotProps {
  /** Current mood / reaction of the owl */
  mood?: 'happy' | 'excited' | 'thinking' | 'celebrating' | 'sleepy' | 'encouraging';
  /** Visual size of the mascot */
  size?: 'sm' | 'md' | 'lg';
  /** Text to display in a speech bubble (null hides it) */
  speechBubble?: string | null;
  /** Whether to run the idle floating animation continuously */
  animated?: boolean;
  /** Additional CSS class applied to the outer wrapper */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Size mapping                                                      */
/* ------------------------------------------------------------------ */

const SIZE_MAP: Record<'sm' | 'md' | 'lg', number> = {
  sm: 80,
  md: 120,
  lg: 160,
};

/* ------------------------------------------------------------------ */
/*  Colour palette (KidsVerse tokens)                                  */
/* ------------------------------------------------------------------ */

const C = {
  body: '#F59E6B',       // warm tawny
  bodyDark: '#E08A4A',   // darker tawny (wings / ear tufts)
  belly: '#FDE8CC',      // cream
  beak: '#FFD93D',       // kids-sun
  eyeWhite: '#FFFFFF',
  pupil: '#1E293B',      // kids-dark
  pupilHighlight: '#60B5FF', // kids-sky
  feet: '#E08A4A',
  cheek: '#FFB5B5',      // soft pink blush
  sparkle: '#FFD93D',    // kids-sun
} as const;

/* ------------------------------------------------------------------ */
/*  Mood-specific SVG sub-elements                                     */
/* ------------------------------------------------------------------ */

/**
 * Returns the eye elements for a given mood.
 * Each eye is centred at the provided (cx, cy).
 */
function getEyes(
  mood: MascotProps['mood'],
  leftCx: number,
  rightCx: number,
  cy: number,
): JSX.Element {
  const r = 16; // eye white radius

  const renderEye = (cx: number, extra: React.ReactNode) => (
    <g key={cx}>
      {/* White sclera */}
      <circle cx={cx} cy={cy} r={r} fill={C.eyeWhite} />
      {/* Pupils (overridden per mood) */}
      {extra}
    </g>
  );

  switch (mood) {
    case 'happy':
      return (
        <>
          {renderEye(leftCx, (
            <>
              <circle cx={leftCx} cy={cy + 2} r={8} fill={C.pupil} />
              <circle cx={leftCx - 3} cy={cy - 2} r={3} fill={C.pupilHighlight} />
              {/* Happy arc over eyes */}
              <path
                d={`M ${leftCx - r + 2} ${cy + 2} Q ${leftCx} ${cy - 10} ${leftCx + r - 2} ${cy + 2}`}
                fill="none"
                stroke={C.pupil}
                strokeWidth={3}
                strokeLinecap="round"
              />
            </>
          ))}
          {renderEye(rightCx, (
            <>
              <circle cx={rightCx} cy={cy + 2} r={8} fill={C.pupil} />
              <circle cx={rightCx - 3} cy={cy - 2} r={3} fill={C.pupilHighlight} />
              <path
                d={`M ${rightCx - r + 2} ${cy + 2} Q ${rightCx} ${cy - 10} ${rightCx + r - 2} ${cy + 2}`}
                fill="none"
                stroke={C.pupil}
                strokeWidth={3}
                strokeLinecap="round"
              />
            </>
          ))}
        </>
      );

    case 'excited':
      return (
        <>
          {renderEye(leftCx, (
            <>
              {/* Wide-open eyes: bigger pupils, star highlight */}
              <circle cx={leftCx} cy={cy} r={11} fill={C.pupil} />
              <circle cx={leftCx - 3} cy={cy - 4} r={4} fill={C.pupilHighlight} />
            </>
          ))}
          {renderEye(rightCx, (
            <>
              <circle cx={rightCx} cy={cy} r={11} fill={C.pupil} />
              <circle cx={rightCx - 3} cy={cy - 4} r={4} fill={C.pupilHighlight} />
            </>
          ))}
        </>
      );

    case 'thinking':
      return (
        <>
          {renderEye(leftCx, (
            <>
              {/* Left eye looking up-right */}
              <circle cx={leftCx + 4} cy={cy - 3} r={8} fill={C.pupil} />
              <circle cx={leftCx + 2} cy={cy - 5} r={2.5} fill={C.pupilHighlight} />
              {/* Half-lid for "thoughtful" look */}
              <ellipse cx={leftCx} cy={cy - 8} rx={r + 1} ry={10} fill={C.body} />
            </>
          ))}
          {renderEye(rightCx, (
            <>
              {/* Right eye squinted / smaller */}
              <circle cx={rightCx} cy={cy + 2} r={7} fill={C.pupil} />
              <circle cx={rightCx - 2} cy={cy - 1} r={2} fill={C.pupilHighlight} />
              {/* Heavy lid */}
              <ellipse cx={rightCx} cy={cy - 6} rx={r + 1} ry={12} fill={C.body} />
            </>
          ))}
        </>
      );

    case 'sleepy':
      return (
        <>
          {renderEye(leftCx, (
            <>
              {/* Nearly closed eyes — thin lines */}
              <line x1={leftCx - 10} y1={cy} x2={leftCx + 10} y2={cy} stroke={C.pupil} strokeWidth={3} strokeLinecap="round" />
            </>
          ))}
          {renderEye(rightCx, (
            <>
              <line x1={rightCx - 10} y1={cy} x2={rightCx + 10} y2={cy} stroke={C.pupil} strokeWidth={3} strokeLinecap="round" />
            </>
          ))}
        </>
      );

    case 'celebrating':
      return (
        <>
          {renderEye(leftCx, (
            <>
              {/* Star-shaped pupils for celebration */}
              <polygon
                points={`${leftCx},${cy - 10} ${leftCx + 3},${cy - 3} ${leftCx + 10},${cy - 3} ${leftCx + 4},${cy + 2} ${leftCx + 6},${cy + 10} ${leftCx},${cy + 5} ${leftCx - 6},${cy + 10} ${leftCx - 4},${cy + 2} ${leftCx - 10},${cy - 3} ${leftCx - 3},${cy - 3}`}
                fill={C.pupil}
              />
            </>
          ))}
          {renderEye(rightCx, (
            <>
              <polygon
                points={`${rightCx},${cy - 10} ${rightCx + 3},${cy - 3} ${rightCx + 10},${cy - 3} ${rightCx + 4},${cy + 2} ${rightCx + 6},${cy + 10} ${rightCx},${cy + 5} ${rightCx - 6},${cy + 10} ${rightCx - 4},${cy + 2} ${rightCx - 10},${cy - 3} ${rightCx - 3},${cy - 3}`}
                fill={C.pupil}
              />
            </>
          ))}
        </>
      );

    case 'encouraging':
    default:
      return (
        <>
          {renderEye(leftCx, (
            <>
              <circle cx={leftCx} cy={cy + 1} r={9} fill={C.pupil} />
              <circle cx={leftCx - 3} cy={cy - 3} r={3} fill={C.pupilHighlight} />
              {/* Gentle brow for warm look */}
              <path
                d={`M ${leftCx - 12} ${cy - 12} Q ${leftCx} ${cy - 18} ${leftCx + 12} ${cy - 12}`}
                fill="none"
                stroke={C.pupil}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </>
          ))}
          {renderEye(rightCx, (
            <>
              <circle cx={rightCx} cy={cy + 1} r={9} fill={C.pupil} />
              <circle cx={rightCx - 3} cy={cy - 3} r={3} fill={C.pupilHighlight} />
              <path
                d={`M ${rightCx - 12} ${cy - 12} Q ${rightCx} ${cy - 18} ${rightCx + 12} ${cy - 12}`}
                fill="none"
                stroke={C.pupil}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </>
          ))}
        </>
      );
  }
}

/**
 * Returns wing path elements based on mood.
 */
function getWings(mood: MascotProps['mood']): React.ReactNode {
  const baseStyle: React.SVGProps<typeof motion.path> = {
    fill: C.bodyDark,
    strokeLinecap: 'round' as const,
    strokeWidth: 1,
  };

  switch (mood) {
    case 'excited':
    case 'celebrating':
      return (
        <>
          {/* Wings raised up */}
          <motion.path
            {...baseStyle}
            d="M 42 95 Q 20 50 35 35 Q 50 45 55 80 Z"
            animate={{ rotate: [0, -15, 0], y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
            style={{ originX: '50px', originY: '95px' }}
          />
          <motion.path
            {...baseStyle}
            d="M 158 95 Q 180 50 165 35 Q 150 45 145 80 Z"
            animate={{ rotate: [0, 15, 0], y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
            style={{ originX: '150px', originY: '95px' }}
          />
        </>
      );

    case 'sleepy':
      return (
        <>
          {/* Wings drooping down */}
          <path {...baseStyle} d="M 42 110 Q 25 120 30 140 Q 40 130 55 115 Z" />
          <path {...baseStyle} d="M 158 110 Q 175 120 170 140 Q 160 130 145 115 Z" />
        </>
      );

    case 'thinking':
      return (
        <>
          {/* Right wing raised to chin */}
          <path {...baseStyle} d="M 42 105 Q 25 95 32 80 Q 40 90 55 100 Z" />
          <motion.path
            {...baseStyle}
            d="M 155 100 Q 140 95 135 115 Q 145 110 155 115 Z"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        </>
      );

    case 'encouraging':
      return (
        <>
          {/* Wings slightly open, welcoming */}
          <path {...baseStyle} d="M 40 100 Q 18 70 30 55 Q 48 68 52 90 Z" />
          <path {...baseStyle} d="M 160 100 Q 182 70 170 55 Q 152 68 148 90 Z" />
        </>
      );

    default:
      // happy
      return (
        <>
          {/* Relaxed wings at sides */}
          <path {...baseStyle} d="M 42 105 Q 22 100 28 120 Q 38 112 52 108 Z" />
          <path {...baseStyle} d="M 158 105 Q 178 100 172 120 Q 162 112 148 108 Z" />
        </>
      );
  }
}

/**
 * Returns extra decorations (sparkles for celebrating, zzz for sleepy, etc.)
 */
function getDecorations(mood: MascotProps['mood']): React.ReactNode {
  if (mood === 'celebrating') {
    return (
      <>
        {/* Sparkles */}
        <motion.circle cx={40} cy={50} r={4} fill={C.sparkle}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
        />
        <motion.circle cx={160} cy={45} r={3} fill={C.sparkle}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}
        />
        <motion.circle cx={100} cy={30} r={5} fill={C.sparkle}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0.6 }}
        />
        <motion.circle cx={55} cy={35} r={2.5} fill="#C4B5FD"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.15 }}
        />
        <motion.circle cx={145} cy={32} r={2.5} fill="#6EE7B7"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.45 }}
        />
      </>
    );
  }

  if (mood === 'sleepy') {
    return (
      <>
        {/* Zzz */}
        <motion.text
          x={150} y={55}
          fontSize="16" fontWeight="bold" fill="#C4B5FD"
          fontFamily="Nunito, sans-serif"
          animate={{ opacity: [0, 0.8, 0], y: [0, -8, -16] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          z
        </motion.text>
        <motion.text
          x={162} y={40}
          fontSize="12" fontWeight="bold" fill="#C4B5FD"
          fontFamily="Nunito, sans-serif"
          animate={{ opacity: [0, 0.6, 0], y: [0, -6, -12] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
        >
          z
        </motion.text>
        <motion.text
          x={170} y={30}
          fontSize="9" fontWeight="bold" fill="#C4B5FD"
          fontFamily="Nunito, sans-serif"
          animate={{ opacity: [0, 0.4, 0], y: [0, -5, -10] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: 1 }}
        >
          z
        </motion.text>
      </>
    );
  }

  return null;
}

/**
 * Returns a small beak shape.
 */
function getBeak(mood: MascotProps['mood']): React.ReactNode {
  const baseY = 112;
  switch (mood) {
    case 'excited':
    case 'celebrating':
      return (
        <>
          {/* Open beak (happy mouth) */}
          <polygon points="100,108 92,114 108,114" fill={C.beak} />
          <polygon points="100,114 92,114 108,114" fill="#F59E0B" />
          <ellipse cx="100" cy="116" rx="8" ry="3" fill="#E88D30" />
        </>
      );
    case 'thinking':
      return (
        <>
          {/* Beak pointing to the side slightly */}
          <polygon points="102,110 94,114 110,114" fill={C.beak} />
        </>
      );
    case 'sleepy':
      return (
        <>
          {/* Closed beak, small */}
          <polygon points="100,112 94,115 106,115" fill={C.beak} />
        </>
      );
    default:
      return (
        <>
          {/* Normal triangular beak */}
          <polygon points="100,110 93,116 107,116" fill={C.beak} />
          <polygon points="100,110 107,116 100,118" fill="#F59E0B" />
        </>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

/**
 * "Hoot" the friendly owl — KidsVerse mascot.
 *
 * Renders an animated SVG owl that changes expression based on the
 * `mood` prop. When `speechBubble` is provided, a speech bubble
 * animates in beside the mascot.
 *
 * @example
 * ```tsx
 * <Mascot mood="happy" size="lg" speechBubble="Great job!" />
 * ```
 */
function Mascot({
  mood = 'happy',
  size = 'md',
  speechBubble = null,
  animated = true,
  className = '',
}: MascotProps): React.ReactElement {
  const px = SIZE_MAP[size];

  /* -- idle floating animation ------------------------------------ */
  const floatingVariants = {
    rest: { y: 0 },
    float: {
      y: [-4, 4, -4],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  /* -- body sway per mood ----------------------------------------- */
  const bodyRotate = mood === 'sleepy' ? -5 : mood === 'excited' ? 3 : 0;

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`} aria-hidden="true">
      {/* Speech bubble — outside the floating container so it stays stable */}
      <AnimatePresence>
        {speechBubble && (
          <motion.div
            className="mb-1 z-10"
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <div
              className="relative whitespace-nowrap rounded-2xl bg-white px-4 py-2 font-nunito text-sm font-bold text-kids-dark shadow-kids"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
            >
              {speechBubble}
              {/* Tail */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0 w-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Owl SVG — only this part floats */}
      <motion.div
        variants={animated ? floatingVariants : undefined}
        animate={animated ? 'float' : undefined}
        className="flex items-center justify-center"
      >
        <svg
          width={px}
          height={px}
          viewBox="0 0 200 190"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={`Hoot the owl is ${mood}`}
        >
          {/* Ear tufts */}
          <polygon points="72,68 62,30 88,58" fill={C.bodyDark} />
          <polygon points="128,68 138,30 112,58" fill={C.bodyDark} />

          {/* Body */}
          <motion.ellipse
            cx={100}
            cy={115}
            rx={55}
            ry={60}
            fill={C.body}
            animate={{ rotate: bodyRotate }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{ originX: '100px', originY: '115px' }}
          />

          {/* Belly */}
          <ellipse cx={100} cy={125} rx={35} ry={38} fill={C.belly} />

          {/* Cheek blushes */}
          <ellipse cx={65} cy={108} rx={10} ry={6} fill={C.cheek} opacity={0.5} />
          <ellipse cx={135} cy={108} rx={10} ry={6} fill={C.cheek} opacity={0.5} />

          {/* Wings (behind eyes, in front of body) */}
          {getWings(mood)}

          {/* Eyes */}
          {getEyes(mood, 78, 122, 88)}

          {/* Beak */}
          {getBeak(mood)}

          {/* Feet */}
          <ellipse cx={82} cy={174} rx={10} ry={5} fill={C.feet} />
          <ellipse cx={118} cy={174} rx={10} ry={5} fill={C.feet} />

          {/* Belly lines for texture */}
          <path d="M 75 115 Q 100 120 125 115" stroke={C.bodyDark} strokeWidth={1} opacity={0.3} fill="none" />
          <path d="M 72 125 Q 100 130 128 125" stroke={C.bodyDark} strokeWidth={1} opacity={0.3} fill="none" />
          <path d="M 74 135 Q 100 140 126 135" stroke={C.bodyDark} strokeWidth={1} opacity={0.3} fill="none" />

          {/* Decorations (sparkles / zzz) */}
          {getDecorations(mood)}
        </svg>
      </motion.div>
    </div>
  );
}

export default Mascot;
export { Mascot };
