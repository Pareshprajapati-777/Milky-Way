/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#020208',
          900: '#060814',
          850: '#0B0F28',
          800: '#10173D',
          700: '#18235A',
        },
        cyber: {
          cyan: '#00F5D4',
          blue: '#00BBF9',
          yellow: '#FFD60A',
          gold: '#FFAA00',
          red: '#FF3B30',
          purple: '#7B2CBF',
          magenta: '#F72585'
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        logo: ['var(--font-logo)', 'sans-serif'],
        mono: ['"Space Mono"', '"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        tech: ['"Orbitron"', '"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 245, 212, 0.45)',
        'neon-red': '0 0 25px rgba(255, 59, 48, 0.6)',
        'neon-gold': '0 0 25px rgba(255, 214, 10, 0.55)',
        'glass-edge': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.65)',
        'glass-glow': 'inset 0 1px 2px rgba(255, 255, 255, 0.4), 0 12px 40px rgba(0, 0, 0, 0.75), 0 0 30px rgba(0, 245, 212, 0.15)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '32px',
        '3xl': '48px',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 30s linear infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'radar': 'radar 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        radar: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
