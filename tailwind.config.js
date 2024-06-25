/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './projects/ts-etl-ui/src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        'isActive': '#005cbb1a',
      },
    },
  },
  plugins: [],
  important: true,
};
