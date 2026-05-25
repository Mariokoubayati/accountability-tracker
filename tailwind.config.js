/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0F0F0F',
        surface: '#1A1A1A',
        'surface-alt': '#222222',
        accent: '#00FF87',
        danger: '#FF3B30',
        punishment: '#8B0000',
        warning: '#FF9500',
        muted: '#888888',
        border: '#2A2A2A',
      },
    },
  },
  plugins: [],
};
