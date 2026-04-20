/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'death-dark': '#040812',
        'death-panel': 'rgba(10, 15, 30, 0.65)',
        'death-neon': '#00f3ff',
        'death-neon-glow': 'rgba(0, 243, 255, 0.5)',
        'death-text': '#e0f2fe',
        'death-muted': '#7dd3fc',
        'death-danger': '#ef4444',
        'death-success': '#22c55e',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 243, 255, 0.5), inset 0 0 4px rgba(0, 243, 255, 0.3)',
        'neon-strong': '0 0 20px rgba(0, 243, 255, 0.8), inset 0 0 8px rgba(0, 243, 255, 0.5)',
      }
    },
  },
  plugins: [],
}
