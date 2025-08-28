const plugin = require('tailwindcss/plugin');
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './projects/e-suggestion/src/**/*.{html,ts}',
    './projects/tableland/src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ea580c', // Orange 600 - vibrant primary orange
          light: '#fb923c', // Orange 400 - lighter for hover states
          50: '#fff7ed', // Orange 50 - very light for backgrounds
          100: '#ffedd5', // Orange 100 - subtle backgrounds
          200: '#fed7aa', // Orange 200 - light borders/dividers
        },
        secondary: {
          DEFAULT: '#0c4a6e', // Sky 900 - deep blue complement
          light: '#0ea5e9', // Sky 500 - lighter blue for accents
          50: '#f0f9ff', // Sky 50 - very light blue backgrounds
          100: '#e0f2fe', // Sky 100 - subtle blue elements
        },
        accent: {
          DEFAULT: '#f97316', // Orange 500 - bright accent
          light: '#fdba74', // Orange 300 - light accent
          dark: '#c2410c', // Orange 700 - dark accent
        },
        neutral: {
          DEFAULT: '#FFFFFF', // Pure white
          surface: '#fefefe', // Warm white surface
          100: '#f8fafc', // Slate 50 - clean backgrounds
          200: '#e2e8f0', // Slate 200 - borders
          300: '#cbd5e1', // Slate 300 - disabled states
          400: '#94a3b8', // Slate 400 - placeholder text
        },
        text: {
          DEFAULT: '#1c1917', // Stone 900 - warm dark text
          secondary: '#57534e', // Stone 600 - secondary text
          muted: '#78716c', // Stone 500 - muted text
          onPrimary: '#FFFFFF', // White text on orange
          onSecondary: '#FFFFFF', // White text on blue
          onAccent: '#FFFFFF', // White text on bright orange
        },
        status: {
          success: '#16a34a', // Green 600 - success states
          warning: '#eab308', // Yellow 500 - warnings (orange-adjacent)
          error: '#dc2626', // Red 600 - errors
          info: '#0ea5e9', // Sky 500 - information (matches secondary)
        },
        background: {
          DEFAULT: '#ffffff', // Pure white
          warm: '#fffbeb', // Amber 50 - warm background option
          cool: '#f8fafc', // Slate 50 - cool background option
        },
      },
    },
  },
  plugins: [],
};
