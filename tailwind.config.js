/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fintel: {
          cyan: '#42C7F5',
          green: '#A6CC38',
          'green-light': '#BDD745',
          'blue-dark': '#004068',
          'blue-medium': '#0077B6',
          gray: '#999999',
          black: '#111827',
          white: '#FFFFFF',
          'bg-light': '#F8FAFB',
          'bg-card': '#FFFFFF',
          'text-primary': '#1F2937',
          'text-secondary': '#6B7280',
          'border-light': '#E5E7EB',
        },
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-subtle': 'glowSubtle 3s ease-in-out infinite',
        'pyramid-pulse': 'pyramidPulse 2s ease-in-out infinite',
        'pyramid-rotate': 'pyramidRotate 4s linear infinite',
        'level-fill': 'levelFill 0.8s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 5px currentColor)' },
          '100%': { filter: 'drop-shadow(0 0 20px currentColor)' },
        },
        glowSubtle: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(66, 199, 245, 0.4), 0 0 40px rgba(66, 199, 245, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(66, 199, 245, 0.5), 0 0 60px rgba(66, 199, 245, 0.3)' },
        },
        pyramidPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        pyramidRotate: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        levelFill: {
          '0%': { opacity: '0.3', transform: 'scaleX(0.9)' },
          '100%': { opacity: '1', transform: 'scaleX(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glass': '0 4px 24px 0 rgba(0, 64, 104, 0.08)',
        'glass-lg': '0 8px 32px 0 rgba(0, 64, 104, 0.12)',
        'card': '0 2px 12px 0 rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 24px 0 rgba(0, 64, 104, 0.12)',
        'card-smooth': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover-smooth': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-selected': '0 0 0 3px rgba(66, 199, 245, 0.2), 0 4px 6px -1px rgba(66, 199, 245, 0.15)',
        'neon-cyan': '0 0 20px rgba(66, 199, 245, 0.3)',
        'neon-green': '0 0 20px rgba(166, 204, 56, 0.3)',
        'input-focus': '0 0 0 3px rgba(66, 199, 245, 0.15)',
      },
      backdropBlur: {
        'glass': '16px',
      },
    },
  },
  plugins: [],
};
