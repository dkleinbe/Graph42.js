'use strict';

var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * Get configuration for Webpack
 *
 * @see http://webpack.github.io/docs/configuration
 *      https://github.com/petehunt/webpack-howto
 *
 * @param {boolean} release True if configuration is intended to be used in
 * a release mode, false otherwise
 * @return {object} Webpack configuration
 */
const path = require('path');
module.exports = {
  entry: {
    app: './src/app.js'
  },

  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'build'),
    
  },

  
  devtool: 'source-map',
  devServer: {
    contentBase: './build'
  },

  stats: {
    colors: true,
    reasons: true
  },

  plugins: [
    new HtmlWebpackPlugin({template: 'src/assets/index.html'})
  ],

  resolve: {
    extensions: ['.webpack.js', '.web.js', '.js', '.jsx']
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test:  /\.(jpe?g|png|gif|svg)$/i,
        use: [
         {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
         }]
      },
      {
        test: /\.js|\.jsx/,
        exclude: /node_modules|bower_components/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};

