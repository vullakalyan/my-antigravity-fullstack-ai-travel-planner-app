/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep space dark backgrounds
        space: {
          950: '#020408',
          900: '#050a12',
          800: '#0a0e1a',
          700: '#0d1320',
          600: '#111827',
          500: '#1a2332',
        },
        // Cyan / teal primary accent
        cyan: {
          DEFAULT: '#00d4ff',
          50: '#e0faff',
          100: '#b3f3ff',
          200: '#66e8ff',
          300: '#1adcff',
          400: '#00d4ff',
          500: '#00b8e0',
          600: '#008fb0',
          700: '#006680',
          800: '#003d50',
          900: '#001520',
        },
        // Gold accent
        gold: {
          DEFAULT: '#ffd700',
          400: '#ffd700',
          500: '#e6c200',
          600: '#ccad00',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-orbitron)', 'Orbitron', 'monospace'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'space-gradient': 'linear-gradient(135deg, #020408 0%, #0a0e1a 50%, #0d1320 100%)',
        'cyan-glow': 'radial-gradient(ellipse at center, rgba(0,212,255,0.15) 0%, transparent 70%)',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,212,255,0.08) 0%, transparent 80%)',
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
        'cyan-glow-sm': '0 0 10px rgba(0, 212, 255, 0.3)',
        'cyan-glow-lg': '0 0 40px rgba(0, 212, 255, 0.5), 0 0 80px rgba(0, 212, 255, 0.2)',
        'gold-glow': '0 0 20px rgba(255, 215, 0, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'spin-slow': 'spin 20s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.8), 0 0 60px rgba(0, 212, 255, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
