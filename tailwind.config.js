/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        'layout-color': '#0C0E12',
        'color-hover': '#22262F',

        'blue-color': '#155EEF',
        'blue-color-bg-info-account': '#002266',
        'blue-color-border-info-account': '#00359E',
        'blue-color-text-info-account': '#528BFF',

        'purple-color': '#7F56D9',
        'purple-color-bg-info-account': '#2C1C5F',
        'purple-color-border-info-account': '#42307D',
        'purple-color-info-account': '#B692F6',

        'gray-color': '#D1D5DB',
        'red-color': '#FF0000',
        'primary-color': 'var(--primary-color)',
        'secondary-color': 'var(--secondary-color)',
        border: {
          default: '#22262F'
        },
        text: {
          default: '#CECFD2'
        },
        bg: {
          gray: '#13161B'
        }
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },

  plugins: [require('tailwindcss-animate')]
}
