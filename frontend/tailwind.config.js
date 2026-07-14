/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ps: {
          blue: '#0070d1',
          'blue-pressed': '#0064b7',
          'blue-active': '#004d8d',
          orange: '#d53b00',
          black: '#000000',
          charcoal: '#1f2024',
          'ink-deep': '#121314',
          'ink-elevated': '#181818',
          'surface-card': '#f5f7fa',
          'surface-dark-card': '#181818',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81'
        }
      },
      fontFamily: {
        sans: ['PlayStation SST', 'SST', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
