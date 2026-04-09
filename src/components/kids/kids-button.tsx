'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useAudio } from '@/hooks/use-audio';

const SOUND_MAP: Record<string, { frequency: number; type: OscillatorType }> = {
  click: { frequency: 800, type: 'sine' },
  success: { frequency: 1200, type: 'sine' },
  error: { frequency: 300, type: 'square' },
  pop: { frequency: 600, type: 'triangle' },
};

const kidsButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-nunito font-bold whitespace-nowrap rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 select-none',
  {
    variants: {
      variant: {
        primary: 'bg-kids-sky text-white shadow-kids hover:bg-kids-blue hover:shadow-kids-hover active:scale-95',
        success: 'bg-kids-grass text-white shadow-kids hover:brightness-110 hover:shadow-kids-hover active:scale-95',
        accent: 'bg-kids-sun text-kids-dark shadow-kids hover:brightness-105 hover:shadow-kids-hover active:scale-95',
        danger: 'bg-kids-coral text-white shadow-kids hover:brightness-95 hover:shadow-kids-hover active:scale-95',
        outline: 'border-3 border-kids-sky text-kids-sky bg-transparent hover:bg-kids-sky/10 active:scale-95',
        ghost: 'text-kids-sky hover:bg-kids-sky/10 active:scale-95',
        special: 'bg-gradient-to-br from-kids-lavender to-kids-purple text-white shadow-kids hover:shadow-kids-hover active:scale-95',
        rainbow: 'bg-gradient-to-r from-kids-coral via-kids-sun to-kids-grass text-white shadow-kids hover:shadow-kids-hover active:scale-95',
      },
      size: {
        toddler: 'min-h-[80px] min-w-[80px] px-6 py-4 text-xl',
        early: 'min-h-[60px] min-w-[60px] px-5 py-3 text-lg',
        kid: 'min-h-[44px] min-w-[44px] px-4 py-2.5 text-base',
        sm: 'h-9 px-3 text-sm rounded-xl',
        icon: 'size-12 rounded-2xl',
        'icon-sm': 'size-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'early',
    },
  }
);

export interface KidsButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof kidsButtonVariants> {
  children?: React.ReactNode;
  sound?: 'click' | 'success' | 'error' | 'pop';
  soundSrc?: string;
  playSound?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const KidsButton = React.forwardRef<HTMLButtonElement, KidsButtonProps>(
  (
    {
      className,
      variant,
      size,
      sound = 'click',
      soundSrc,
      playSound = true,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const preset = SOUND_MAP[sound] || SOUND_MAP.click;
    const { play, isEnabled } = useAudio(soundSrc ? { src: soundSrc } : preset);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;
      if (playSound && isEnabled) play();
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (disabled || isLoading) return;
        if (playSound && isEnabled) play();
        onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    };

    return (
      <motion.button
        ref={ref}
        className={cn(kidsButtonVariants({ variant, size, className }))}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || isLoading}
        whileHover={disabled || isLoading ? {} : { scale: 1.05 }}
        whileTap={disabled || isLoading ? {} : { scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <motion.span
              className="size-5 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              aria-hidden="true"
            />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

KidsButton.displayName = 'KidsButton';

export { KidsButton, kidsButtonVariants };
