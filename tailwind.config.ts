import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['var(--font-inter)', 'sans-serif'],
        'playfair': ['var(--font-playfair)', 'serif'],
        'montserrat': ['var(--font-montserrat)', 'sans-serif'],
        'oswald': ['var(--font-oswald)', 'sans-serif'],
      },
      colors: {
        // Editorial Color System
        cream: '#FEFEFE',
        'warm-white': '#FAFAFA',
        'light-grey': '#F8F8F8',
        'medium-grey': '#E5E5E5',
        'warm-grey': '#A8A8A8',
        'dark-grey': '#666666',
        charcoal: '#1A1A1A',
        black: '#000000',
        gold: '#D4AF37',
        'light-gold': '#F4E4B8',
      },
      spacing: {
        'xs': '0.5rem',
        'sm': '1rem',
        'md': '2rem',
        'lg': '4rem',
        'xl': '6rem',
        '2xl': '8rem',
        '3xl': '12rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'medium': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'strong': '0 20px 40px rgba(0, 0, 0, 0.15)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 1s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      fontSize: {
        'display-xl': ['clamp(4rem, 12vw, 8rem)', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        'display-lg': ['clamp(3rem, 8vw, 5rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'heading-xl': ['clamp(2.5rem, 6vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading-lg': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-md': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.3', letterSpacing: '0.02em' }],
        'heading-sm': ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'body-xl': ['clamp(1.25rem, 2.5vw, 1.5rem)', { lineHeight: '1.8' }],
        'body-lg': ['clamp(1.125rem, 2vw, 1.25rem)', { lineHeight: '1.7' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.15em', textTransform: 'uppercase' }],
        'label-lg': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.1em', textTransform: 'uppercase' }],
      },
      gridTemplateColumns: {
        'editorial': 'repeat(12, 1fr)',
      },
      aspectRatio: {
        '3/4': '3 / 4',
        '4/5': '4 / 5',
      },
    },
  },
  plugins: [],
} satisfies Config; 