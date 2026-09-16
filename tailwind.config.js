import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        foreground: '#FAFAFA',
        card: {
          DEFAULT: '#121215',
          foreground: '#FAFAFA',
          border: '#27272A',
        },
        popover: {
          DEFAULT: '#121215',
          foreground: '#FAFAFA',
        },
        primary: {
          DEFAULT: '#FAFAFA',
          foreground: '#09090B',
        },
        secondary: {
          DEFAULT: '#27272A',
          foreground: '#FAFAFA',
        },
        muted: {
          DEFAULT: '#1D1D21',
          foreground: '#A1A1AA',
        },
        accent: {
          DEFAULT: '#27272A',
          foreground: '#FAFAFA',
        },
        destructive: {
          DEFAULT: '#7F1D1D',
          foreground: '#FAFAFA',
        },
        border: '#27272A',
        input: '#27272A',
        ring: '#D4D4D8',
        surface: {
          deep: '#09090B',
          base: '#121215',
          elevated: '#18181B',
          subtle: '#27272A',
        },
        vital: {
          emerald: '#10B981',
          cyan: '#38BDF8',
          amber: '#F59E0B',
          purple: '#A855F7',
        },
      },
      fontFamily: {
        sans: ['Geist', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
