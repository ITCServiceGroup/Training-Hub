/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Define custom colors for light/dark mode
        primary: {
          light: '#0f766e', // teal-700
          dark: '#14b8a6', // teal-500
        },
        secondary: {
          light: '#7e22ce', // purple-700
          dark: '#a855f7', // purple-500
        },
        background: {
          light: '#f8fafc', // slate-50
          dark: '#1e293b', // slate-800
        },
        surface: {
          light: '#ffffff', // white
          dark: '#334155', // slate-700
        },
        text: {
          light: '#1e293b', // slate-800
          dark: '#f8fafc', // slate-50
        },
      },
      // Override the default ring and border colors for form elements
      ringColor: {
        DEFAULT: '#0f766e', // teal-700 for light mode
      },
      ringOffsetColor: {
        DEFAULT: '#ffffff', // white for light mode
      },
      borderColor: {
        DEFAULT: '#e5e7eb', // gray-200
        focus: '#0f766e', // teal-700 for light mode
      },
    },
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '100%',
        md: '100%',
        lg: '100%',
        xl: '100%',
        '2xl': '100%',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}
