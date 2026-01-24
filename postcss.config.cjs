module.exports = {
  plugins: {
    'postcss-preset-env': {
      stage: 3, // Configures the spec stability stage (optional)
      features: {
        'nesting-rules': true, // Example of enabling specific features
      },
    },
    // Autoprefixer is included in postcss-preset-env by default,
    // so you usually don't need to add it separately.
  },
};
