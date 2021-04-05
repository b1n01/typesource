const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  purge: [
    './src/**/*.svelte',
    './src/**/*.js',
    './public/index.html',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', ...defaultTheme.fontFamily.sans], // Set Nunito as default sans font family
      },
      colors: {
        'background': '#1F2937',
        'float': '#283548',
        'highlight': '#3C4A5D',
        'border': '#49596E',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
