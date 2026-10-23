/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aubergine: {
          DEFAULT: '#3A0F34',
          deep: '#260822',
          light: '#53194B',
          soft: 'rgba(58, 15, 52, 0.05)',
          border: 'rgba(58, 15, 52, 0.12)',
        },
        ice: {
          DEFAULT: '#DDE3E8',
          light: '#F0F4F7',
          dark: '#BAC5CE',
          glass: 'rgba(221, 227, 232, 0.6)',
        },
        marigold: {
          DEFAULT: '#EAAA00',
          hover: '#CF9600',
          glow: 'rgba(234, 170, 0, 0.25)',
          light: 'rgba(234, 170, 0, 0.1)',
        },
        warm: {
          bg: '#FBFBF9',
          card: '#FFFFFF',
          surface: '#F5F5F0',
          muted: '#7A6B78',
        }
      },
      fontFamily: {
        editorial: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(58, 15, 52, 0.07)',
        'glass-hover': '0 14px 40px 0 rgba(58, 15, 52, 0.12)',
        'gold-glow': '0 0 20px rgba(234, 170, 0, 0.35)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        dashDraw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        }
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        dashDraw: 'dashDraw 3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      }
    },
  },
  plugins: [],
}
