const path = require('path');

module.exports = {
  entry: {
    onramp: './src/onramp.js',
    smartWallet: './src/smart-wallet.js'
  },  
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  mode: 'development'
};
