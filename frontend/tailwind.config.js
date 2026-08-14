/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#12162B',
          50: '#F2F3F7',
          100: '#E1E3EE',
          200: '#B9BDD6',
          300: '#8B90B3',
          400: '#5B6089',
          500: '#3A3F63',
          600: '#262B48',
          700: '#1B1F38',
          800: '#12162B',
          900: '#0B0E1C',
        },
        paper: {
          DEFAULT: '#F7F6F1',
          soft: '#FBFAF7',
        },
        ember: {
          DEFAULT: '#E8A33D',
          50: '#FDF6E9',
          100: '#FAEACB',
          300: '#F1C57C',
          500: '#E8A33D',
          600: '#CC8323',
          700: '#A5661A',
        },
        signal: {
          DEFAULT: '#3452FF',
          50: '#EDF0FF',
          100: '#D6DCFF',
          300: '#8C9CFF',
          500: '#3452FF',
          600: '#233BDB',
          700: '#1A2CAD',
        },
        sage: {
          DEFAULT: '#3F9142',
          50: '#EBF6EB',
          100: '#D2ECD3',
          500: '#3F9142',
          600: '#307433',
        },
        rust: {
          DEFAULT: '#D14B3D',
          50: '#FCEBE9',
          100: '#F7CFC9',
          500: '#D14B3D',
          600: '#AC372B',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,22,43,0.04), 0 8px 24px -8px rgba(18,22,43,0.10)',
        cardHover: '0 4px 12px rgba(18,22,43,0.06), 0 16px 40px -12px rgba(18,22,43,0.16)',
        focus: '0 0 0 3px rgba(52,82,255,0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        rise: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        rise: 'rise 0.5s ease-out both',
        wave: 'wave 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
