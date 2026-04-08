'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * KidsCard — Animated card component for the KidsVerse design system
 * Features:
 * - Soft drop shadows on all cards (per spec)
 * - rounded-2xl minimum border radius
 * - Framer Motion hover/tap animations
 * - Color-coded variants for different content types
 * - Optional click handler for interactive cards
 * - Full keyboard accessibility
 */

const kidsCardVariants = cva(
  'bg-white rounded-2xl overflow-hidden transition-all select-none',
  {
    variants: {
      /** Visual variant — determines border, shadow, and hover behavior */
      variant: {
        /** Default card with subtle shadow */
        default: 'shadow-kids border border-kids-lightgray/50',
        /** Elevated card with stronger shadow */
        elevated: 'shadow-kids-lg border border-kids-lightgray/30',
        /** Interactive card with hover animation */
        interactive: 'shadow-kids border-2 border-kids-lightgray/50 hover:border-kids-sky/50 cursor-pointer',
        /** No shadow or border — for containers */
        flat: 'border border-kids-lightgray/30',
        /** Featured/highlighted card with colored border */
        featured: 'shadow-kids-lg border-2 border-kids-sun/60',
      },
      /** Color theme — sets background gradient */
      color: {
        /** White/default */
        white: 'bg-white',
        /** Sky blue tint */
        sky: 'bg-gradient-to-br from-blue-50 to-sky-100',
        /** Green tint */
        grass: 'bg-gradient-to-br from-green-50 to-emerald-100',
        /** Yellow tint */
        sun: 'bg-gradient-to-br from-yellow-50 to-amber-100',
        /** Coral/pink tint */
        coral: 'bg-gradient-to-br from-rose-50 to-pink-100',
        /** Lavender/purple tint */
        lavender: 'bg-gradient-to-br from-violet-50 to-purple-100',
        /** Mint tint */
        mint: 'bg-gradient-to-br from-teal-50 to-emerald-100',
      },
      /** Padding preset */
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      color: 'white',
      padding: 'lg',
    },
  }
);

export interface KidsCardProps
  extends Omit<HTMLMotionProps<'div'>, 'children'>,
    VariantProps<typeof kidsCardVariants> {
  /** Card content */
  children?: React.ReactNode;
  /** Optional header section */
  header?: React.ReactNode;
  /** Optional footer section */
  footer?: React.ReactNode;
  /** Icon displayed at top of card (above header) */
  icon?: React.ReactNode;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** onClick handler — enables interactive behavior */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Whether the card is selected/active */
  isActive?: boolean;
  /** Animation delay in seconds */
  delay?: number;
}

const KidsCard = React.forwardRef<HTMLDivElement, KidsCardProps>(
  (
    {
      className,
      variant,
      color,
      padding,
      header,
      footer,
      icon,
      title,
      description,
      children,
      onClick,
      isActive = false,
      delay = 0,
      ...props
    },
    ref
  ) => {
    const isInteractive = variant === 'interactive' || !!onClick;

    const cardContent = (
      <>
        {/* Icon area */}
        {icon && (
          <div className="flex justify-center mb-3" aria-hidden="true">
            {icon}
          </div>
        )}

        {/* Header area */}
        {(header || title || description) && (
          <div className="mb-3">
            {header}
            {title && (
              <h3 className="text-lg font-nunito font-bold text-kids-dark leading-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-kids-text-secondary mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Main content */}
        {children && <div className="flex-1">{children}</div>}

        {/* Footer area */}
        {footer && (
          <div className="mt-4 pt-3 border-t border-kids-lightgray/50">
            {footer}
          </div>
        )}
      </>
    );

    if (isInteractive) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            kidsCardVariants({ variant: isActive ? 'featured' : variant, color, padding, className }),
            isActive && 'ring-2 ring-kids-sky ring-offset-2'
          )}
          onClick={onClick}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onKeyDown={(e) => {
            if (onClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
            }
          }}
          aria-pressed={isActive}
          {...props}
        >
          {cardContent}
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(kidsCardVariants({ variant, color, padding, className }))}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: 'easeOut' }}
        {...props}
      >
        {cardContent}
      </motion.div>
    );
  }
);

KidsCard.displayName = 'KidsCard';

export { KidsCard, kidsCardVariants };
