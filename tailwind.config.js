/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Store palette
        blush: {
          50: '#FDF8F6',
          100: '#F5E6E0',
          200: '#EDDCD5',
          300: '#E0C8BD',
          400: '#C77B8B',
          500: '#B5616E',
          600: '#9E4A58',
        },
        ivory: '#FAF8F5',
        charcoal: '#1A1A2E',
        // Admin palette
        admin: {
          bg: '#F8FAFC',
          sidebar: '#1E293B',
          primary: '#3B82F6',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
