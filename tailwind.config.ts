import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand palette — placeholder, refined in Phase 8.
        brand: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#E25822',
          600: '#C44A1A',
          900: '#5C2110',
        },
        accent: {
          500: '#1F6F8B',
          900: '#0B3A4A',
        },
        // Semantic tokens — shells map to these, not raw palette.
        bg: '#FAF7F2',
        surface: '#FFFFFF',
        border: '#E8E0D4',
        ink: '#1A1614',
        muted: '#6B6660',
        success: '#3F8B5C',
        warning: '#D9A441',
        danger: '#B33A3A',
        // Tier feedback colors (right / close / wrong).
        tierRight: '#3F8B5C',
        tierClose: '#D9A441',
        tierWrong: '#B33A3A',
      },
      fontFamily: {
        sans: ['Inter'],
        display: ['Fraunces'],
        cyrillic: ['NotoSerif'],
        mono: ['JetBrainsMono'],
      },
      borderRadius: {
        card: '16px',
        button: '12px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
