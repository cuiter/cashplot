const path = require('path');

module.exports = {
  entry: './src/js/frontend/index.js',
  mode: 'development',
  output: {
    filename: 'main.js',

    path: path.resolve(__dirname, './src/js'),
  },
};
