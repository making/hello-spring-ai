/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7e8',
          100: '#e0efd1',
          200: '#c6e3a5',
          300: '#aad578',
          400: '#8fc74c',
          500: '#76b82a', // Spring Green
          600: '#5d9321',
          700: '#447018',
          800: '#2c4c0f',
          900: '#142806',
        },
        spring: {
          light: '#f0f7e8',
          DEFAULT: '#76b82a', // Spring primary green
          dark: '#5d9321',
          gray: '#f8f9fa',
          darkgray: '#e9ecef',
        }
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 6px 2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}