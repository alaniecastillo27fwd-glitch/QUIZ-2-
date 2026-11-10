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
        // Paleta oficial obligatoria Constructora Del Valle (5 colores exactos)
        evergreen: {
          DEFAULT: '#002626',
          dark: '#001a1a',
          light: '#053838',
        },
        darkteal: {
          DEFAULT: '#0E4749',
          dark: '#093335',
          light: '#145c5f',
        },
        yellowgreen: {
          DEFAULT: '#95C623',
          dark: '#7fa81d',
          light: '#abde33',
        },
        cayenne: {
          DEFAULT: '#E55812',
          dark: '#c4480c',
          light: '#f06e2e',
        },
        softlinen: {
          DEFAULT: '#EFE7DA',
          dark: '#ded3c1',
          light: '#f7f2eb',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
      },
    },
  },
  plugins: [],
}
