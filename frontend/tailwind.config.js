 /** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  safelist: [
    'bg-blue-500',
    'bg-gray-400',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: "media",
}