/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./projects/ts-etl-ui/src/**/*.{html,ts}'], theme: {
    scale: {
      '25': '.25',
    }, extend: {
      colors: {}, flexGrow: {
        0.65: '0.65',
      },
    },
  }, plugins: [], important: true,
};
