/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Victus Brand Colors ──────────────────────────────────────────
        primary: {
          50:  '#edf7ee',
          100: '#cde8cf',
          200: '#9fd3a4',
          300: '#6fbe78',
          400: '#48a852',
          DEFAULT: '#2D7E34',  // Verde principal — logo
          500: '#2D7E34',
          600: '#256b2b',
          700: '#1c5722',
          800: '#134318',
          900: '#0a2f0f',
        },
        secondary: {
          50:  '#e8f0f9',
          100: '#c5d9ef',
          200: '#9bbfdf',
          300: '#6da4cf',
          400: '#4a8dbf',
          DEFAULT: '#2764AD',  // Azul
          500: '#2764AD',
          600: '#1f5699',
          700: '#174680',
          800: '#0f3567',
          900: '#08244e',
        },
        accent: {
          50:  '#fdf1ed',
          100: '#f9d5c9',
          200: '#f5b09a',
          300: '#f18b6b',
          DEFAULT: '#ED6F49',  // Naranja/Coral
          500: '#ED6F49',
          600: '#e05530',
          700: '#c2421f',
          800: '#9e3016',
          900: '#7a200d',
        },
        warning: {
          50:  '#fffde7',
          100: '#fff9c4',
          DEFAULT: '#FFEB3C',  // Amarillo highlight
          500: '#FFEB3C',
          600: '#fdd835',
          700: '#f9a825',
        },
        // ── Neutral (fondo crema de Victus) ─────────────────────────────
        cream: {
          DEFAULT: '#F4F5DC',  // Crema/Beige — background claro
          50:  '#fafbf2',
          100: '#F4F5DC',
          200: '#ebedb8',
        },
      },
    },
  },
  plugins: [],
};
