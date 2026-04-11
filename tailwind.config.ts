import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui base colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // KidsVerse custom child-friendly palette
        'kids-sky': '#60B5FF',
        'kids-grass': '#7ED957',
        'kids-sun': '#FFD93D',
        'kids-coral': '#FF6B6B',
        'kids-lavender': '#C4B5FD',
        'kids-mint': '#6EE7B7',
        'kids-peach': '#FBBF7A',
        'kids-pink': '#F472B6',
        'kids-blue': '#3B82F6',
        'kids-purple': '#8B5CF6',
      },
      fontFamily: {
        nunito: ['var(--font-nunito)', 'sans-serif'],
        display: ['var(--font-nunito)', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'kids': '1rem',
        'kids-lg': '1.5rem',
        'kids-xl': '2rem',
      },
      boxShadow: {
        'kids': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'kids-lg': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'kids-hover': '0 6px 25px rgba(0, 0, 0, 0.15)',
        'kids-glow-sky': '0 0 20px rgba(96, 181, 255, 0.3)',
        'kids-glow-grass': '0 0 20px rgba(126, 217, 87, 0.3)',
        'kids-glow-sun': '0 0 20px rgba(255, 217, 61, 0.3)',
        'kids-glow-coral': '0 0 20px rgba(255, 107, 107, 0.3)',
      },
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(1deg)' },
          '66%': { transform: 'translateY(-4px) rotate(-1deg)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'star-spin': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.2)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        'rainbow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'pop': 'pop 0.3s ease-out',
        'star-spin': 'star-spin 1s ease-in-out',
        'rainbow': 'rainbow 3s ease infinite',
      },
      spacing: {
        'tap-target': '80px',
        'tap-target-sm': '44px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
