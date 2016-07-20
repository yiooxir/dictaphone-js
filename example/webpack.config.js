var path = require('path')
var webpack = require('webpack')
console.log(path.join(__dirname, '..', 'lib'));

module.exports = {
  debug: true,
  devtool: 'source-map',
  // devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './app.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    alias: {
      'record-audio-js': path.join(__dirname, '..', 'src')
    }
  },
  resolveLoader: { root: path.join(__dirname, "node_modules") },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: [ 'babel' ],
        exclude: /node_modules/,
        include: [
          __dirname,
          path.resolve(__dirname, "../src")
        ],
      },
      { test: /\.css$/, loader: "style-loader!css-loader?root=." },
    ]
  }
}