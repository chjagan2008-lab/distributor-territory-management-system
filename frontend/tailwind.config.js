/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'arvi-green': {
          50:  '#E8F5E9',
          100: '#C8E6C9',
          500: '#388E3C',
          700: '#2E7D32',
          800: '#1B5E20',
          900: '#1B5E20',
        },
        'arvi-amber': {
          400: '#FFCA28',
          500: '#F9A825',
          600: '#F57F17',
        }
      }
    },
  },
  plugins: [],
}