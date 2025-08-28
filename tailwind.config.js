const { iconsPlugin } = require('@egoist/tailwindcss-icons');

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './demo/**/*.{vue,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), iconsPlugin()],
};
