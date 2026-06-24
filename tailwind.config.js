/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#14B8A6',
          dark: '#0F766E',
        },
        success: '#22C55E',
        bgPrimary: '#F8FAFC',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
      },
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
