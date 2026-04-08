'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

interface UseAudioOptions {
  /** Path to the audio file or a Web Audio API frequency */
  src?: string;
  /** If no src, use Web Audio API with this frequency (Hz) */
  frequency?: number;
  /** Duration in ms (default: 150) */
  duration?: number;
  /** Volume 0-1 (default: 0.3) */
  volume?: number;
  /** Sound type for Web Audio API: 'sine' | 'square' | 'triangle' | 'sawtooth' */
  type?: OscillatorType;
}

interface UseAudioReturn {
  /** Play the sound effect */
  play: () => void;
  /** Whether audio is currently enabled globally */
  isEnabled: boolean;
  /** Toggle audio on/off globally */
  toggle: () => void;
  /** Set audio enabled state */
  setEnabled: (enabled: boolean) => void;
}

// Global audio enabled state (shared across all components)
let globalAudioEnabled = true;
const audioListeners = new Set<(enabled: boolean) => void>();

function notifyListeners(enabled: boolean) {
  audioListeners.forEach((listener) => listener(enabled));
}

const SOUND_PRESETS: Record<string, Omit<UseAudioOptions, 'duration' | 'volume'>> = {
  click: { frequency: 800, type: 'sine' },
  success: { frequency: 1200, type: 'sine' },
  error: { frequency: 300, type: 'square' },
  pop: { frequency: 600, type: 'triangle' },
  whoosh: { frequency: 400, type: 'sine' },
  badge: { frequency: 1000, type: 'sine' },
  tick: { frequency: 500, type: 'sine' },
};

export function useAudio(options: UseAudioOptions = {}): UseAudioReturn {
  const {
    src,
    frequency = 800,
    duration = 150,
    volume = 0.3,
    type = 'sine',
  } = options;

  const audioContextRef = useRef<AudioContext | null>(null);
  const [isEnabled, setIsEnabled] = useState(globalAudioEnabled);

  useEffect(() => {
    const listener = (enabled: boolean) => setIsEnabled(enabled);
    audioListeners.add(listener);
    return () => {
      audioListeners.delete(listener);
    };
  }, []);

  const toggle = useCallback(() => {
    globalAudioEnabled = !globalAudioEnabled;
    notifyListeners(globalAudioEnabled);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    globalAudioEnabled = enabled;
    notifyListeners(enabled);
  }, []);

  const play = useCallback(() => {
    if (!globalAudioEnabled) return;

    // Try HTML5 Audio if src is provided
    if (src) {
      try {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.play().catch(() => {
          // Autoplay blocked or file not found — silent fallback
        });
        return;
      } catch {
        // Fall through to Web Audio API
      }
    }

    // Web Audio API fallback
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = type;
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch {
      // Web Audio not supported — silent fallback
    }
  }, [src, frequency, duration, volume, type]);

  return { play, isEnabled, toggle, setEnabled };
}

export { SOUND_PRESETS };
export type { UseAudioOptions, UseAudioReturn };
