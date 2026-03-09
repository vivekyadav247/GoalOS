/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#050816',
        surface: '#0f172a',
        accent: '#4f46e5',
        accentSoft: '#6366f1'
      }
    }
  },
  plugins: []
};

