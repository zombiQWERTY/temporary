module.exports = {
  plugins:
    process.env.NODE_ENV === 'production'
      ? [
          'postcss-nesting',
          'postcss-flexbugs-fixes',
          [
            'postcss-preset-env',
            {
              autoprefixer: {
                flexbox: 'no-2009',
              },
              stage: 3,
              features: {
                'custom-properties': false,
              },
            },
          ],
        ]
      : [
          'postcss-nesting',
          'postcss-flexbugs-fixes',
          [
            'postcss-preset-env',
            {
              autoprefixer: false,
              features: {
                'custom-properties': false,
              },
            },
          ],
        ],
};
