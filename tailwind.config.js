/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon': '#00FF41',
        'void': '#0c0c0c',
        'error': '#FF3333',
        'concrete': '#f0f0f0',
      },
      fontFamily: {
        'mono': ['"Courier New"', 'Courier', 'monospace'],
      },
      boxShadow: {
        'brutal': '5px 5px 0px 0px #000000',
      }
    },
  },
  plugins: [],
}