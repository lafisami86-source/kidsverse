/**
 * Rate limiting for API routes
 * Simple in-memory rate limiter (production should use Upstash Redis)
 */

interface RateLimitEntry {
  count: number;
  lastReset: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const DEFAULT_MAX_REQUESTS = 100;
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute

export interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
  keyPrefix?: string;
}

export function rateLimit(options?: RateLimitOptions): {
  check: (identifier: string) => { success: boolean; remaining: number; resetAt: number };
  reset: (identifier: string) => void;
} {
  const maxRequests = options?.maxRequests || DEFAULT_MAX_REQUESTS;
  const windowMs = options?.windowMs || DEFAULT_WINDOW_MS;
  const keyPrefix = options?.keyPrefix || 'rl';

  function getKey(identifier: string): string {
    return `${keyPrefix}:${identifier}`;
  }

  function check(identifier: string): {
    success: boolean;
    remaining: number;
    resetAt: number;
  } {
    const key = getKey(identifier);
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now - entry.lastReset > windowMs) {
      rateLimitMap.set(key, { count: 1, lastReset: now });
      return {
        success: true,
        remaining: maxRequests - 1,
        resetAt: now + windowMs,
      };
    }

    entry.count++;

    if (entry.count > maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetAt: entry.lastReset + windowMs,
      };
    }

    return {
      success: true,
      remaining: maxRequests - entry.count,
      resetAt: entry.lastReset + windowMs,
    };
  }

  function reset(identifier: string): void {
    rateLimitMap.delete(getKey(identifier));
  }

  // Periodically clean up old entries
  if (typeof globalThis !== 'undefined') {
    const cleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of rateLimitMap.entries()) {
        if (now - entry.lastReset > windowMs * 2) {
          rateLimitMap.delete(key);
        }
      }
    }, 60 * 1000); // Clean up every minute

    // Allow the process to exit even if the interval is running
    if (typeof cleanup.unref === 'function') {
      cleanup.unref();
    }
  }

  return { check, reset };
}
