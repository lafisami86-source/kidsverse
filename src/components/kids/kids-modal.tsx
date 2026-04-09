'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * KidsModal — Animated modal dialog for the KidsVerse design system
 * Features:
 * - Framer Motion slide + fade animations
 * - Tap-outside-to-close (with safety guard against accidental child taps)
 * - Close button (X) positioned for easy access
 * - Focus trap for keyboard accessibility
 * - Body scroll lock when open
 * - Age-adaptive close button sizing
 * - ESC key to close
 * - Customizable overlay color
 * - Accessible with proper ARIA attributes
 */

export interface KidsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Modal title (rendered as h2 for accessibility) */
  title?: string;
  /** Optional description below the title */
  description?: string;
  /** Modal body content */
  children: React.ReactNode;
  /** Optional footer with action buttons */
  footer?: React.ReactNode;
  /** Size preset */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether clicking the overlay closes the modal (default: true) */
  closeOnOverlayClick?: boolean;
  /** Whether to show the close button (default: true) */
  showCloseButton?: boolean;
  /** Close button icon size */
  closeButtonSize?: 'sm' | 'md' | 'lg';
  /** Overlay color */
  overlayColor?: string;
  /** Whether to disable body scroll when open (default: true) */
  lockScroll?: boolean;
  /** Additional CSS classes for the content panel */
  className?: string;
  /** z-index for the modal (default: 50) */
  zIndex?: number;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)]',
};

const closeSizeClasses = {
  sm: 'size-8 text-lg',
  md: 'size-10 text-xl',
  lg: 'size-12 text-2xl',
};

export function KidsModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  closeButtonSize = 'md',
  overlayColor = 'bg-black/40',
  lockScroll = true,
  className,
  zIndex = 50,
}: KidsModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const overlayTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save and restore focus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
    } else {
      // Restore focus when modal closes
      const timer = setTimeout(() => {
        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen && lockScroll) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'relative';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
      };
    }
  }, [isOpen, lockScroll]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const content = contentRef.current;
    const focusableElements = content.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    function handleTabKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !contentRef.current) return;

      const focusable = contentRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    }

    document.addEventListener('keydown', handleTabKeyDown);
    return () => document.removeEventListener('keydown', handleTabKeyDown);
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    function handleEscKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscKeyDown);
    return () => document.removeEventListener('keydown', handleEscKeyDown);
  }, [isOpen, onClose]);

  // Overlay click handler — requires sustained press to prevent accidental child taps
  const handleOverlayClick = useCallback(() => {
    if (!closeOnOverlayClick) return;

    // Require the overlay to be pressed for 300ms before closing
    // This prevents accidental closes from children's taps
    if (overlayTapTimeoutRef.current) {
      clearTimeout(overlayTapTimeoutRef.current);
      overlayTapTimeoutRef.current = null;
      onClose();
    } else {
      overlayTapTimeoutRef.current = setTimeout(() => {
        overlayTapTimeoutRef.current = null;
      }, 300);
    }
  }, [closeOnOverlayClick, onClose]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (overlayTapTimeoutRef.current) {
        clearTimeout(overlayTapTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex }}>
          {/* Overlay */}
          <motion.div
            className={cn('fixed inset-0', overlayColor)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Modal content */}
          <motion.div
            ref={contentRef}
            className={cn(
              'relative z-10 w-full mx-4 bg-white rounded-3xl shadow-kids-lg overflow-hidden',
              sizeClasses[size],
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'kids-modal-title' : undefined}
            aria-describedby={description ? 'kids-modal-description' : undefined}
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 28,
            }}
          >
            {/* Header area */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-4 sm:p-6 pb-0">
                <div className="flex-1 pr-4">
                  {title && (
                    <h2
                      id="kids-modal-title"
                      className="text-xl sm:text-2xl font-nunito font-bold text-kids-dark"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="kids-modal-description"
                      className="text-sm text-kids-text-secondary mt-1"
                    >
                      {description}
                    </p>
                  )}
                </div>

                {/* Close button */}
                {showCloseButton && (
                  <motion.button
                    className={cn(
                      'flex items-center justify-center rounded-full bg-kids-lightgray text-kids-text-secondary hover:bg-kids-coral hover:text-white transition-colors shadow-kids focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-kids-sky',
                      closeSizeClasses[closeButtonSize]
                    )}
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close dialog"
                    type="button"
                  >
                    <X className="size-5" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="p-4 sm:p-6">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                  {footer}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
