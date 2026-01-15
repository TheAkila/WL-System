/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
        ui: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'brand': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
        'brand-lg': '0 20px 60px -15px rgba(0, 0, 0, 0.3)',
      },
      aspectRatio: {
        '16/9': '16 / 9',
        '4/3': '4 / 3',
      },
      animation: {
        'scroll': 'scroll 25s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { 
            transform: 'translateX(0)',
          },
          '100%': { 
            transform: 'translateX(calc(-100% / 20))',
          },
        },
      },
    },
  },
  plugins: [],
};
