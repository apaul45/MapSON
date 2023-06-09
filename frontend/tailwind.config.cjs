/** @type {import('tailwindcss').Config} */
const withMT = require('@material-tailwind/react/utils/withMT')

module.exports = withMT({
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
    colors: {
      app: '#343131',
      navbar: '#282626',
      'navbar-hover': '#5B5555',
      white: '#FFFFFF',
      black: '#000000',
      blue: '#5783F4',
      gray: '#4F4F4F',
      upvote: '#fa8072',
      downvote: '#7193ff',
      sort: '#D9D9D9',
      'sort-by': '#C0B7B7',
      'sort-hover': '#757575',
      'blue-500': '#3b82f6',
      'blue-700': '#1d4ed8',
      'drag-text': '#B5B6BE',
    },
  },
  plugins: [],
})
