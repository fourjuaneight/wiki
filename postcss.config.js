const cssnano = require('cssnano');
const postcssPresetEnv = require('postcss-preset-env');

// Tailwind is pre-compiled via `pnpm run tw` — do not include here.
// Including it as a PostCSS plugin causes the PostCSS process to stay alive
// (JIT file watchers) and hang Hugo's build pipeline.

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
  ],
});
