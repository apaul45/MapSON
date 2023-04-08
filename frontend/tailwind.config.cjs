/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      'app': '#343131',
      'navbar': '#282626',
      'navbar-hover': '#5B5555',
      'white': '#FFFFFF',
      'black': '#000000',
      'blue': '#5783F4',
      'gray': '#4F4F4F',
      'upvote': "#fa8072",
      'downvote': '#7193ff'
    }
  },
  plugins: [],
}
