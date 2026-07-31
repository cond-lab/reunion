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
        ink:     '#1C2530',
        carbon:  '#1B232E',
        steel:   '#232D3A',
        paper:   '#FCFCFB',
        chalk:   '#F4F4F2',
        signal:  '#D98324',
        conform: '#2E9E7B',
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
