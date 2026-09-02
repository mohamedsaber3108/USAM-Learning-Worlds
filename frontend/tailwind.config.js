/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sky blue — primary brand color (Macaw/Feather-family: saturated, friendly, not neon)
        primary: {
          50: '#eff9ff',
          100: '#dcf1ff',
          200: '#b3e4ff',
          300: '#7ccfff',
          400: '#3ab4f7',
          500: '#159ce6',
          600: '#0b7fc4',
          700: '#0a659e',
          800: '#0e5480',
          900: '#12466b',
        },
        // Playful violet — secondary, used for "magic/quest" accents (Prodigy-style)
        secondary: {
          50: '#faf5ff',
          100: '#f3e6ff',
          200: '#e5c8ff',
          300: '#d29fff',
          400: '#b96bff',
          500: '#9d3ef2',
          600: '#832bd0',
          700: '#6a20aa',
          800: '#551c86',
          900: '#451a6b',
        },
        // Sunshine orange — energy, streaks, CTAs (Duolingo streak / Prodigy Blaze family)
        accent: {
          50: '#fff6ea',
          100: '#ffe9cb',
          200: '#ffd08f',
          300: '#ffb455',
          400: '#ff9827',
          500: '#f97e0b',
          600: '#dd6304',
          700: '#b74d05',
          800: '#933d0b',
          900: '#78330d',
        },
        // Feather green — success, mastery, correct answers
        success: {
          50: '#eefcf0',
          100: '#d6f7dc',
          200: '#aeeeba',
          300: '#78e08e',
          400: '#45c968',
          500: '#22ab49',
          600: '#178a3a',
          700: '#136d31',
          800: '#12572a',
          900: '#0f4824',
        },
        // Warm amber — warning / badges
        warning: {
          50: '#fffbea',
          100: '#fff3c4',
          200: '#ffe58a',
          300: '#ffd24d',
          400: '#ffbe1f',
          500: '#f5a306',
          600: '#d17f02',
          700: '#a75f05',
          800: '#874b0c',
          900: '#713e0f',
        },
        error: {
          50: '#fff1f1',
          100: '#ffdfdf',
          200: '#ffc5c5',
          300: '#ff9d9d',
          400: '#fd6a6a',
          500: '#f13f3f',
          600: '#d42525',
          700: '#b01c1c',
          800: '#911d1d',
          900: '#791e1e',
        },
        // Warm cream background instead of stark white/gray
        cream: {
          50: '#fffdf8',
          100: '#fef9ee',
          200: '#fcf1d9',
          300: '#f8e6bd',
        },
      },
      fontFamily: {
        heading: ['"Baloo 2"', 'sans-serif'],
        sans: ['Quicksand', 'sans-serif'],
      },
      boxShadow: {
        chunky: '0 4px 0 0 rgba(0,0,0,0.12)',
        'chunky-primary': '0 4px 0 0 #0b7fc4',
        'chunky-accent': '0 4px 0 0 #dd6304',
        'chunky-success': '0 4px 0 0 #178a3a',
        pop: '0 8px 24px -6px rgba(20, 90, 150, 0.35)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '60%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        wiggle: 'wiggle 1.2s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        shine: 'shine 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
