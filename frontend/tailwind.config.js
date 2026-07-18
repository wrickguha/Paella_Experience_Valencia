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
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--color-bg-secondary)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          alt: 'var(--color-accent-alt)',
        },
        luxury: {
          DEFAULT: 'var(--color-accent-alt)',
        },
        bg: {
          main: 'var(--color-bg-main)',
          secondary: 'var(--color-bg-secondary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
        neutral: {
          cream: 'var(--color-bg-main)',
          beige: 'var(--color-bg-secondary)',
          sand: '#E8E0D8',
          gray: 'var(--color-text-secondary)',
          dark: 'var(--color-text-primary)',
        },
      },
      fontFamily: {
        // Script/decorative font stays hardcoded — it's branding, not body text
        'script-family': ['"Great Vibes"', 'cursive'],
        // All body/heading fonts point to the CSS variable set by the admin panel
        'modern-family': ['var(--site-font-family)', 'sans-serif'],
        display: ['var(--site-font-family)', 'sans-serif'],
        heading: ['var(--site-font-family)', 'sans-serif'],
        body: ['var(--site-font-family)', 'sans-serif'],
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
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'kenburns': {
          '0%': { transform: 'scale(1.08) translate(0px, 0px)' },
          '100%': { transform: 'scale(1.0) translate(-20px, -8px)' },
        },
      },
      animation: {
        'gradient-x': 'gradient-x 5s ease infinite',
        'kenburns': 'kenburns 6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
