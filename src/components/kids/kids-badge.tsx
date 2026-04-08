'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const kidsBadgeVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-nunito font-bold select-none',
  {
    variants: {
      variant: {
        default: 'bg-kids-sky text-white shadow-kids',
        success: 'bg-kids-grass text-white shadow-kids',
        gold: 'bg-gradient-to-br from-kids-sun to-kids-peach text-kids-dark shadow-kids',
        danger: 'bg-kids-coral text-white shadow-kids',
        purple: 'bg-gradient-to-br from-kids-lavender to-kids-purple text-white shadow-kids',
        pink: 'bg-kids-pink text-white shadow-kids',
        mint: 'bg-kids-mint text-kids-dark shadow-kids',
        outline: 'border-2 border-kids-sky text-kids-sky bg-transparent',
        muted: 'bg-kids-lightgray text-kids-text-secondary',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs gap-1',
        md: 'px-3 py-1 text-sm gap-1.5',
        lg: 'px-4 py-2 text-base gap-2',
        xl: 'px-5 py-3 text-lg gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface KidsBadgeProps
  extends Omit<HTMLMotionProps<'span'>, 'children'>,
    VariantProps<typeof kidsBadgeVariants> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  isAchievement?: boolean;
  glow?: boolean;
  earned?: boolean;
  delay?: number;
}

const KidsBadge = React.forwardRef<HTMLSpanElement, KidsBadgeProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      children,
      isAchievement = false,
      glow = false,
      earned = true,
      delay = 0,
      ...props
    },
    ref
  ) => {
    if (!earned) {
      return (
        <span
          ref={ref}
          className={cn(
            kidsBadgeVariants({ variant: 'muted', size }),
            'opacity-50 grayscale',
            className
          )}
          aria-label={`Badge not yet earned: ${typeof children === 'string' ? children : 'achievement'}`}
          {...(props as React.HTMLAttributes<HTMLSpanElement>)}
        >
          {children}
        </span>
      );
    }

    if (isAchievement) {
      return (
        <motion.span
          ref={ref}
          className={cn(
            kidsBadgeVariants({ variant, size }),
            glow && 'ring-2 ring-kids-sun/50 shadow-[0_0_15px_rgba(255,217,61,0.4)]',
            className
          )}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 15, delay }}
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          {...props}
        >
          {icon && (
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, delay }}
              aria-hidden="true"
            >
              {icon}
            </motion.span>
          )}
          {children}
        </motion.span>
      );
    }

    return (
      <motion.span
        ref={ref}
        className={cn(kidsBadgeVariants({ variant, size }), className)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay }}
        {...props}
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        {children}
      </motion.span>
    );
  }
);

KidsBadge.displayName = 'KidsBadge';

export { KidsBadge, kidsBadgeVariants };
