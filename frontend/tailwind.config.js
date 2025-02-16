/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'visionz': {
          purple: '#4A1D96',
          'purple-light': '#5925B0',
          'purple-dark': '#3B1678',
        },
      },
    },
  },
  plugins: [],
}
