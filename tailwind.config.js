/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#F97316',
          secondary: '#FDBA74',
          dark: '#1B1B1F',
          surface: '#1E293B',
          card: '#27324D',
          border: '#334155',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#CBD5F5',
        },
      },
    },
  },
  plugins: [],
};
