/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#080C15',
          800: '#0F172A',
          700: '#1E293B',
        }
      }
    },
  },
  plugins: [],
}
