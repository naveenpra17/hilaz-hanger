/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        burgundy: {
          50: '#fdf5f2',
          100: '#f8e8e4',
          200: '#e8c4bc',
          300: '#d49393',
          400: '#b05b4b',
          500: '#8b3a3a',
          600: '#6b2d39',
          700: '#632e32',
          800: '#4a0e0e',
          900: '#3a0b0b',
        },
        gold: {
          DEFAULT: '#c5a059',
          light: '#e8d4a8',
          dark: '#9a7b3f',
        },
        cream: {
          DEFAULT: '#f5efe6',
          light: '#fdf5f2',
          dark: '#e8dfd4',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(74, 14, 14, 0.08)',
        carousel: '0 8px 32px rgba(74, 14, 14, 0.12)',
      },
      backgroundImage: {
        'header-gradient': 'linear-gradient(90deg, #4a0e0e 0%, #6b2d39 50%, #8b3a3a 100%)',
        'footer-gradient': 'linear-gradient(180deg, #632e32 0%, #4a0e0e 100%)',
      },
    },
  },
  plugins: [],
};
