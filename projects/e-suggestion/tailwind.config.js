const plugin = require('tailwindcss/plugin')
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3c5d9e',
          light: '#7f99e0',
          50: '#c3dbff',
          100: '#a0b9ff',
          200: '#5e7abf'
        },
        secondary: {
          DEFAULT: '#ff6528',
          light: '#ffbdc9',
          50: '#ff9c98',
          100: '#ff7e63',
        },
        neutral: {
          DEFAULT: '#FFFFFF',
          surface: '#F8F9FA',
          100: '#F0F2F5',
          200: '#E4E6EB',
          300: '#CFD1D6',
        },
        text: {
          DEFAULT: '#1A1A1A',
          secondary: '#4A4A4A',
          muted: '#737373',
          onPrimary: '#FFFFFF',
          onSecondary: '#FFFFFF'
        },
        status: {
          success: '#00875A',
          warning: '#FF8800',
          error: '#E11900',
          info: '#0066CC'
        },
        background: {
          DEFAULT: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}