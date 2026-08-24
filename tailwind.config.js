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
      },
      fontFamily: {
        sans: ['Geist-Regular', 'Geist', 'sans-serif'],
        mono: ['GeistMono-Regular', 'GeistMono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
