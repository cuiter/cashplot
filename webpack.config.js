const path = require('path');

module.exports = {
  entry: './src/js/frontend/index.js',
  mode: 'development',
  resolve: {
    fallback: { "path": require.resolve("path-browserify") }
  },
  output: {
    filename: 'main.js',

    path: path.resolve(__dirname, './src/js'),
  },
};
