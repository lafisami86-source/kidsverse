/**
 * Stripe integration for subscription management
 */

export const STRIPE_PLANS = {
  free: {
    name: 'Explorer',
    priceId: null,
    price: 0,
  },
  premium: {
    name: 'Explorer Pro',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    price: 999, // $9.99 in cents
  },
} as const;

export const SUBSCRIPTION_FEATURES = {
  free: {
    maxChildProfiles: 2,
    learningModules: ['alphabet', 'numbers'],
    games: ['memory'],
    stories: 3,
    creativeTools: ['basic-drawing'],
    videos: false,
  },
  premium: {
    maxChildProfiles: 5,
    learningModules: ['alphabet', 'numbers', 'colors', 'science'],
    games: ['memory', 'puzzle', 'spelling', 'math'],
    stories: Infinity,
    creativeTools: ['drawing', 'coloring'],
    videos: true,
  },
} as const;

// Initialize Stripe lazily (server-side only)
let stripeInstance: ReturnType<typeof import('stripe')['default']> | null = null;

export async function getStripe() {
  if (!stripeInstance) {
    if (typeof window !== 'undefined') {
      throw new Error('Stripe can only be initialized server-side');
    }
    const Stripe = (await import('stripe')).default;
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-12-18.acacia',
    });
  }
  return stripeInstance;
}

export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100);
}
