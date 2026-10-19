/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#E8EEF5',
          100: '#D1DCE8',
          200: '#A3B5CC',
          300: '#758DB0',
          400: '#466493',
          500: '#2A4A75',
          600: '#1E3A5F',
          700: '#152A47',
          800: '#0D1F33',
          900: '#001F3F',
          950: '#00132A',
        },
        gold: {
          50: '#FBF6E9',
          100: '#F7EDCF',
          200: '#EFD89F',
          300: '#E7C470',
          400: '#DDB045',
          500: '#D4A017',
          600: '#B8861A',
          700: '#8F6414',
          800: '#6B4A0E',
          900: '#4A330A',
        },
        cream: '#F8FAFC',
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        display: ["Playfair Display", "serif"],
      },
      boxShadow: {
        premium: '0 4px 24px -6px rgba(0, 31, 63, 0.08)',
        'premium-lg': '0 12px 48px -8px rgba(0, 31, 63, 0.14)',
        gold: '0 4px 20px -4px rgba(212, 160, 23, 0.3)',
        glass: '0 8px 32px -4px rgba(0, 31, 63, 0.12)',
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(135deg, #001F3F 0%, #152A47 50%, #0D1F33 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4A017 0%, #DDB045 50%, #E7C470 100%)',
        'navy-radial': 'radial-gradient(ellipse at top, #152A47 0%, #001F3F 70%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-out forwards',
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        slideIn: 'slideIn 0.5s ease-out forwards',
        scaleIn: 'scaleIn 0.4s ease-out forwards',
        shimmer: 'shimmer 3s linear infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
