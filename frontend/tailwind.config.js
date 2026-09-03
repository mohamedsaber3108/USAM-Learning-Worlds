/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRIMARY — Confident indigo. Distinct from the Duolingo-green-clone
        // and Prodigy's orange/purple; reads premium + trustworthy (Linear/Stripe
        // territory) while staying warm enough for an 8-14 audience. Used as the
        // ONE dominant brand color across nav, primary buttons, and focus states.
        primary: {
          50: '#eef1ff',
          100: '#e0e4ff',
          200: '#c6ccff',
          300: '#a5aaff',
          400: '#8a86fb',
          500: '#6a63f1',
          600: '#4f46e5',
          700: '#4038c7',
          800: '#342fa0',
          900: '#2b2880',
        },
        // ACCENT — Warm coral. Used SPARINGLY: streaks, CTAs, one highlight per view.
        accent: {
          50: '#fff1ee',
          100: '#ffe1d9',
          200: '#ffc0b0',
          300: '#ff9a80',
          400: '#ff7a5c',
          500: '#ff6b57',
          600: '#ea4f39',
          700: '#c53c29',
          800: '#9e3122',
          900: '#7f2a1e',
        },
        // SECONDARY — Muted gold. Reserved for XP / rewards, used tastefully.
        secondary: {
          50: '#fff9eb',
          100: '#fef0c7',
          200: '#fdde8d',
          300: '#fbc653',
          400: '#f9ab2b',
          500: '#f0921a',
          600: '#d4740f',
          700: '#ab5810',
          800: '#8a4614',
          900: '#713b14',
        },
        // SUCCESS — Emerald. Correctness / mastery feedback only.
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Neutral surface tones — clean white/slate, not a cream/rainbow wash.
        surface: {
          50: '#fafafa',
          100: '#f4f4f6',
          200: '#e9e9ee',
        },
      },
      fontFamily: {
        // Display: used SPARINGLY for big numbers/headlines only.
        display: ['"Manrope"', 'sans-serif'],
        // Body/UI: clean, readable, not babyish at 14 y/o.
        sans: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        control: '12px',
      },
      boxShadow: {
        // Soft, multi-layer shadows — replace flat drop-shadows / chunky blocks.
        soft: '0 1px 2px rgba(16,24,40,0.04), 0 4px 12px rgba(16,24,40,0.06)',
        'soft-md': '0 2px 8px rgba(16,24,40,0.06), 0 8px 24px rgba(16,24,40,0.06)',
        'soft-lg': '0 4px 12px rgba(16,24,40,0.08), 0 16px 40px rgba(16,24,40,0.08)',
        'soft-hover': '0 4px 16px rgba(16,24,40,0.08), 0 12px 32px rgba(16,24,40,0.10)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Single subtle highlight sweep across a progress fill — the
        // "reward" cue for XP/streak bars. One pass, no looping rainbow,
        // no color shift — just a soft lighter band of the SAME hue
        // moving once across the bar when its value changes.
        'shimmer-sweep': {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer-sweep': 'shimmer-sweep 1.1s ease-out',
      },
    },
  },
  plugins: [],
}
