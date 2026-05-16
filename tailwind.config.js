/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#5B4FCF',
        'primary-light': '#EEEDFE',
        'primary-dark': '#3B2FA0',
        bg: '#FAFAF9',
        surface: '#FFFFFF',
        border: '#E8E8E4',
        'text-primary': '#1A1240',
        'text-secondary': '#6B6B80',
        'text-tertiary': '#A0A0B0',
        success: '#22B87A',
        warning: '#F0A500',
        danger: '#E04444',
      },
      fontFamily: {
        sans: ['DMSans_400Regular'],
        'sans-medium': ['DMSans_500Medium'],
        'sans-semibold': ['DMSans_600SemiBold'],
        'sans-bold': ['DMSans_700Bold'],
        display: ['Fraunces_600SemiBold'],
        'display-bold': ['Fraunces_700Bold'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(91, 79, 207, 0.08)',
      },
    },
  },
  plugins: [],
};
