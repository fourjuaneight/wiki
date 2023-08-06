const cssnano = require('cssnano');
const postcssPresetEnv = require('postcss-preset-env');
const tailwind = require('tailwindcss');

module.exports = () => ({
  plugins: [
    postcssPresetEnv({
      stage: 3,
      features: {
        'custom-properties': {
          preserve: true,
          fallback: true,
        },
        'nesting-rules': true,
      },
      autoprefixer: {
        flexbox: true,
        grid: false,
      },
    }),
    cssnano({
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true,
          },
        },
      ],
    }),
    tailwind,
  ],
});
