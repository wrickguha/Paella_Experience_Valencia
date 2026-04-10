/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fdedd4',
          200: '#fad7a8',
          300: '#f6b971',
          400: '#f19338',
          DEFAULT: '#E67E22',
          600: '#d76a10',
          700: '#b25110',
          800: '#8e4015',
          900: '#743614',
        },
        secondary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          DEFAULT: '#F4D03F',
          400: '#facc15',
          500: '#eab308',
        },
        neutral: {
          cream: '#FFF8F0',
          beige: '#F5F0EB',
          sand: '#E8E0D8',
          gray: '#6B7280',
          dark: '#1F2937',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
        'elevated': '0 20px 60px -15px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
