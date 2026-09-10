/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRIMARY — USAM deep teal. Taken from the brand palette (the dark
        // pine/teal swatch). This is the ONE dominant brand color across nav,
        // primary buttons, and focus states. Reads premium, calm and
        // trustworthy — an academic "graduate" tone rather than a toy-bright
        // primary, while the lighter 400/500 steps keep enough life for an
        // 8-14 audience.
        primary: {
          50: '#eef5f3',
          100: '#d4e7e2',
          200: '#a9cfc6',
          300: '#75b0a3',
          400: '#458d7e',
          500: '#2b7061',
          600: '#1c5a4d',
          700: '#12403a',
          800: '#0d3330',
          900: '#0a2926',
        },
        // ACCENT — Warm amber/terracotta. The single warm counterpoint to the
        // cool teal brand. Used SPARINGLY: streaks, CTAs, one highlight per
        // view. Chosen to sit harmoniously against deep teal (complementary
        // warm) instead of the previous coral.
        accent: {
          50: '#fdf3ec',
          100: '#fae1cf',
          200: '#f4c09f',
          300: '#ec9c6c',
          400: '#e37f45',
          500: '#d96a2c',
          600: '#c05622',
          700: '#9c431e',
          800: '#7c371d',
          900: '#652f1b',
        },
        // SECONDARY — Refined honey gold. Reserved for XP / rewards, used
        // tastefully. Slightly muted so it reads as "achievement", not a
        // caution color, against the teal brand.
        secondary: {
          50: '#fdf8ec',
          100: '#f9edca',
          200: '#f2d98f',
          300: '#ebc258',
          400: '#e3ab30',
          500: '#cf9316',
          600: '#b17812',
          700: '#8d5b13',
          800: '#744917',
          900: '#623d16',
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
        // Neutral surface tones — the off-white / light-gray family from the
        // brand palette. Cool-neutral (a hair toward the teal) so white cards
        // sit on a calm, slightly cool canvas rather than a pure clinical gray.
        surface: {
          50: '#f7f9f8',
          100: '#eef1f0',
          200: '#e0e5e3',
          300: '#cdd6d3',
        },
        // INK — true near-black, mirrors the black in the logo/wordmark. Used
        // for the highest-contrast headings and the brand mark itself.
        ink: {
          DEFAULT: '#0b0f0e',
          soft: '#1a201e',
        },
        // MIST — soft blue-gray from the palette, for quiet decorative fills
        // (illustration backdrops, subtle section dividers).
        mist: {
          100: '#e6ecec',
          200: '#c6d3d2',
          300: '#a9bcbb',
        },
        // INDIGO ALIAS — a number of feature/parent pages were authored with
        // Tailwind's default `indigo-*` accent before the teal rebrand. Rather
        // than hand-edit every call site, alias the whole `indigo` scale onto
        // the USAM teal `primary` scale so those pages inherit the brand color
        // automatically and stay consistent. New code should use `primary-*`.
        indigo: {
          50: '#eef5f3',
          100: '#d4e7e2',
          200: '#a9cfc6',
          300: '#75b0a3',
          400: '#458d7e',
          500: '#2b7061',
          600: '#1c5a4d',
          700: '#12403a',
          800: '#0d3330',
          900: '#0a2926',
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
        // Soft, multi-layer shadows — teal-tinted rather than neutral black so
        // depth harmonizes with the brand instead of muddying it.
        soft: '0 1px 2px rgba(10,41,38,0.05), 0 4px 12px rgba(10,41,38,0.07)',
        'soft-md': '0 2px 8px rgba(10,41,38,0.07), 0 8px 24px rgba(10,41,38,0.08)',
        'soft-lg': '0 4px 12px rgba(10,41,38,0.09), 0 16px 40px rgba(10,41,38,0.10)',
        'soft-hover': '0 4px 16px rgba(10,41,38,0.10), 0 12px 32px rgba(10,41,38,0.12)',
        // Tinted glows for correct/incorrect resolution states — same hue as
        // the success/error tokens above, not a generic black shadow. Used
        // sparingly on the single activity card that just resolved.
        'glow-success': '0 0 0 1px rgba(16,185,129,0.22), 0 10px 28px -6px rgba(16,185,129,0.35)',
        'glow-error': '0 0 0 1px rgba(239,68,68,0.20), 0 10px 28px -6px rgba(239,68,68,0.28)',
        'glow-primary': '0 0 0 1px rgba(28,90,77,0.20), 0 8px 22px -6px rgba(28,90,77,0.30)',
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
        // Tiny lateral wobble for the "not quite" resolution — a single
        // decaying oscillation (spring-like), not a cartoon shake loop.
        'wobble-once': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(3px)' },
          '60%': { transform: 'translateX(-2px)' },
          '80%': { transform: 'translateX(1px)' },
        },
        // Gentle vertical float — hero logo / empty-state art. Slow, small
        // amplitude so it feels alive without being distracting.
        'float-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        // Slow ambient scale/opacity pulse for decorative brand glows behind
        // hero content — one calm breathing loop, not a flashing highlight.
        'pulse-soft': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer-sweep': 'shimmer-sweep 1.1s ease-out',
        'wobble-once': 'wobble-once 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both',
        'float-soft': 'float-soft 5s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
