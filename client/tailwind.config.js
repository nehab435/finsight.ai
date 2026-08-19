/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables manual light/dark mode switching
  theme: {
    extend: {
      colors: {
        finGreen: '#10b981', // The exact vibrant green from your design
        finDark: '#111827',  // Clean dark mode background
      }
    },
  },
  plugins: [],
}