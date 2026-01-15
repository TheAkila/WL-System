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
      boxShadow: {
        'brand': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
        'brand-lg': '0 20px 60px -15px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};

