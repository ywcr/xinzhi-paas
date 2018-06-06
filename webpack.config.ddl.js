const webpack = require('webpack');
const path = require('path');


const vendors = [
  'antd',
  'babel-plugin-antd',
  'babel-plugin-react-transform',
  'babel-plugin-transform-runtime',
  'babel-preset-es2015',
  'babel-preset-react',
  'babel-preset-react-hmre',
  'babel-preset-stage-0',
  'babel-preset-stage-2',
  'classnames',
  'codemirror',
  'color-hash',
  'echarts',
  'echarts-for-react',
  'es6-object-assign',
  'es6-promise',
  'humps',
  'isomorphic-fetch',
  'lodash',
  'jquery',
  'moment',
  'normalizr',
  'qrcode.react',
  'rc-animate',
  'rc-queue-anim',
  'rc-scroll-anim',
  'rc-tween-one',
  'react',
  'react-codemirror',
  'react-dom',
  'react-intercom',
  'react-intl',
  'react-redux',
  'react-router',
  'react-router-redux',
  'redux',
  'redux-devtools',
  'redux-devtools-dock-monitor',
  'redux-devtools-log-monitor',
  'redux-logger',
  'redux-thunk',
  'socket.io-client',
  'text-encoding',
  'whatwg-fetch',
  'xterm',
  // ...其它库
];

module.exports = {
  devtool: 'cheap-source-map',
  output: {
    path: 'static/webpack_dll',
    filename: '[name].js',
    library: '[name]',
  },
  entry: {
    "lib": vendors,
  },
  module: {
    loaders: [{
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: /\.css$/,
      loader: 'style!css?sourceMap'
    }, {
      test: /\.less$/,
      loader:
      'style!css!less?sourceMap'
    }]
  },
  plugins: [
    new webpack.DllPlugin({
      path: 'manifest.json',
      name: '[name]',
      context: __dirname,
    }),
    new webpack.NoErrorsPlugin(),
  ],
};