/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cardio: {
          bg: '#F5F8FC',
          card: '#FFFFFF',
          text: '#17243A',
          muted: '#607086',
          border: '#E2E8F0',
          action: '#D92D4C',
          actionHover: '#B91F3B',
          blue: '#2563EB',
          surfaceBlue: '#EDF4FF',
          surfaceRose: '#FFF0F2',
          success: '#0d9488',
          warning: '#f97316',
          lad: '#f43f5e',
          lcx: '#0d9488',
          rca: '#f97316',
          cad: '#e11d48',
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(23, 36, 58, 0.04), 0 1px 2px -1px rgba(23, 36, 58, 0.04)',
        'card-hover': '0 6px 16px -2px rgba(23, 36, 58, 0.07), 0 2px 6px -1px rgba(23, 36, 58, 0.03)',
        'subtle': '0 1px 2px 0 rgba(23, 36, 58, 0.05)',
      }
    },
  },
  plugins: [],
}
