/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      borderWidth: {
        '3': '3px',
      },
      colors: {
        // Dynamic theme colors using CSS variables
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          light: 'var(--secondary-color)',
          dark: 'var(--secondary-color)',
        },
        // Static theme colors for backgrounds and text
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
        DEFAULT: 'var(--color-primary)',
      },
      ringOffsetColor: {
        DEFAULT: '#ffffff', // white for light mode
      },
      borderColor: {
        DEFAULT: '#e5e7eb', // gray-200
        focus: 'var(--color-primary)',
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
    // Temporarily disabled to test if this is causing the white background issue
    // require('@tailwindcss/forms')({
    //   strategy: 'base',
    // }),
  ],
}
