'use client';

import { useState, useCallback, useEffect } from 'react';
import { PremiumLock } from '@/components/premium/premium-lock';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SUBSCRIPTION_KEY = 'kidsverse-subscription';

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('This is a Premium activity!');
  const [modalFeatures, setModalFeatures] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  /* Read subscription status from localStorage */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      try {
        const raw = localStorage.getItem(SUBSCRIPTION_KEY);
        setIsPremium(raw === 'active');
      } catch {
        setIsPremium(false);
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const openModal = useCallback((title?: string, features?: string[]) => {
    if (title) setModalTitle(title);
    if (features && features.length > 0) setModalFeatures(features);
    else setModalFeatures([]);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const guardPremium = useCallback(
    (isPremiumContent: boolean, title?: string, features?: string[]) => {
      if (!isPremiumContent) return true;
      if (isPremium) return true;
      openModal(title, features);
      return false;
    },
    [isPremium, openModal],
  );

  return {
    isPremium: mounted ? isPremium : false,
    showModal,
    openModal,
    closeModal,
    guardPremium,
    modalTitle,
    modalFeatures,
    mounted,
  };
}

/* ------------------------------------------------------------------ */
/*  Convenience component that renders the modal                       */
/* ------------------------------------------------------------------ */

export function PremiumModal({
  isOpen,
  onClose,
  title,
  features,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  features?: string[];
}) {
  return (
    <PremiumLock
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      features={features}
    />
  );
}
