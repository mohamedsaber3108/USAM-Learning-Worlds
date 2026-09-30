/** @type {import('tailwindcss').Config} */
// USAM design tokens — WHITE / GREEN / BLACK (see
// docs/frontend/FINAL_USAM_DESIGN_SYSTEM.md). Green is the ONE dominant brand
// hue on a white canvas with near-black ink. No per-feature rainbow. Semantic
// colors (success/warning/error) are functional only. Depth = surface contrast
// + hairline borders + whisper shadows, not heavy drop shadows.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // The single dominant brand hue. green-800/900 anchor on the legacy
        // deep-teal (brand-adjacent, credible academic green).
        brand: {
          50: '#eef6f0',
          100: '#d6ebdd',
          200: '#aed7bd',
          300: '#7cbd96',
          400: '#4a9e6f',
          500: '#1f7a4d',
          600: '#166141',
          700: '#12513a',
          800: '#0d3a2c',
          900: '#0a2b22',
        },
        // Near-black ink (headings + brand mark) and text ramp.
        ink: {
          900: '#0b0f0e',
          800: '#141917',
          700: '#1a201e',
          600: '#3a423f',
          500: '#5b635f',
          400: '#828a86',
        },
        canvas: {
          white: '#ffffff',
          off: '#fbfbf9',
        },
        line: '#e7e9e6',
        // Functional semantic colors only.
        success: { 100: '#d1fae5', 500: '#10b981', 700: '#047857' },
        warning: { 100: '#fef3c7', 500: '#f59e0b', 700: '#b45309' },
        error: { 100: '#fee2e2', 500: '#ef4444', 700: '#b91c1c' },
      },
      fontFamily: {
        display: ['Nunito', 'Manrope', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', 'Tajawal', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        control: '12px',
        card: '18px',
        pill: '9999px',
      },
      boxShadow: {
        // Whisper shadows; real elevation reserved for hero/modal.
        soft: '0 1px 2px rgba(11,15,14,0.04), 0 1px 3px rgba(11,15,14,0.03)',
        card: '0 1px 3px rgba(11,15,14,0.05), 0 4px 12px rgba(11,15,14,0.05)',
        lift: '0 8px 24px -10px rgba(11,15,14,0.18)',
        focus: '0 0 0 3px rgba(31,122,77,0.35)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16,1,0.3,1)',
      },
      transitionDuration: {
        xfast: '120ms',
        fast: '180ms',
        base: '240ms',
        slow: '360ms',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.24s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
