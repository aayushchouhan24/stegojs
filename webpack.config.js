const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './lib/Stego.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'Stego.js',
    library: 'Stego',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(), 
    ],
  },
};
