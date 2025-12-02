/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  darkMode: ['class'],
  plugins: [require('tailwindcss-animate')],
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
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      colors: {
        bg: {
          gray: '#13161B'
        },
        'blue-color': '#155EEF',

        'blue-color-bg-info-account': '#002266',
        'blue-color-border-info-account': '#00359E',
        'blue-color-text-info-account': '#528BFF',
        border: {
          default: '#22262F'
        },

        'color-hover': '#22262F',
        'gray-color': '#D1D5DB',
        'layout-color': '#0C0E12',
        'primary-color': 'var(--primary-color)',

        'purple-color': '#7F56D9',
        'purple-color-bg-info-account': '#2C1C5F',
        'purple-color-border-info-account': '#42307D',
        'purple-color-info-account': '#B692F6',
        'red-color': '#FF0000',
        'secondary-color': 'var(--secondary-color)',
        text: {
          default: '#CECFD2'
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
      }
    }
  }
}
