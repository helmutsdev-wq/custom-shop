import type { Config } from 'tailwindcss'

export default {
  content: [
    './app.vue',
    './pages/**/*.vue',
    './components/**/*.vue',
    './layouts/**/*.vue',
  ],
  theme: {
    extend: {
      colors: {
        obscure: {
          bg: {
            primary: 'var(--obscure-bg-primary)',
            secondary: 'var(--obscure-bg-secondary)',
            elevated: 'var(--obscure-bg-elevated)',
            card: 'var(--obscure-bg-card)',
          },
          text: {
            primary: 'var(--obscure-text-primary)',
            secondary: 'var(--obscure-text-secondary)',
            muted: 'var(--obscure-text-muted)',
          },
          accent: {
            primary: 'var(--obscure-accent-primary)',
            secondary: 'var(--obscure-accent-secondary)',
            glow: 'var(--obscure-accent-glow)',
          },
          border: {
            DEFAULT: 'var(--obscure-border)',
            hover: 'var(--obscure-border-hover)',
          },
          success: 'var(--obscure-success)',
          error: 'var(--obscure-error)',
          warning: 'var(--obscure-warning)',
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
        'glow-sm': '0 0 10px rgba(139, 92, 246, 0.2)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 30px rgba(139, 92, 246, 0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-out',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
} satisfies Config