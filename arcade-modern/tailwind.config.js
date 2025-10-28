/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff006e',
          blue: '#3a86ff',
          green: '#06ffa5',
          yellow: '#ffb703',
          purple: '#8338ec',
        },
        dark: {
          900: '#0a0a1a',
          800: '#0f0f1e',
          700: '#1a1a2e',
          600: '#16213e',
          500: '#0f3460',
        }
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'scale-in': 'scale-in 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { 
            textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #ff006e, 0 0 40px #ff006e',
            opacity: '1' 
          },
          '50%': { 
            textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff006e, 0 0 20px #ff006e',
            opacity: '0.8' 
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 0, 110, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 0, 110, 0.8), 0 0 60px rgba(255, 0, 110, 0.6)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.3)',
        'neon-blue': '0 0 20px rgba(58, 134, 255, 0.5), 0 0 40px rgba(58, 134, 255, 0.3)',
        'neon-green': '0 0 20px rgba(6, 255, 165, 0.5), 0 0 40px rgba(6, 255, 165, 0.3)',
        'neon-yellow': '0 0 20px rgba(255, 183, 3, 0.5), 0 0 40px rgba(255, 183, 3, 0.3)',
      }
    },
  },
  plugins: [],
}

