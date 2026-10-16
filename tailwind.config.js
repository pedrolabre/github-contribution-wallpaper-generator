/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        oled: {
          pure: '#000000',
          deep: '#030504',
          dark: '#0d1117',
          surface: '#161b22',
          border: '#30363d',
          muted: '#8b949e',
        },
        neon: {
          emerald: '#00ff59',
          glow: 'rgba(0, 255, 89, 0.4)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
