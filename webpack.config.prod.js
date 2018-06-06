/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App webpack production config
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var WebpackMd5Hash = require('webpack-md5-hash')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // devtool: 'cheap-source-map',
  // !入口文件的顺序不能动！
  entry: {
    zh: './src/entry/zh.js',
    en: './src/entry/en.js',
    main: './src/entry/index.js',
    // vendor: ['react', 'lodash', 'moment', 'codemirror', 'antd'],
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },

  output: {
    path: path.join(__dirname, 'static/bundles'),
    filename: '[name].[chunkhash:8].js',
    chunkFilename: 'chunk.[id].[chunkhash:8].js',
    publicPath: '/bundles/'
  },

  externals: {
    'clipboard': 'Clipboard',
    'emojify.js': 'emojify'
  },

  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/,
      include: __dirname
    }, {
　　　 test: /\.(jpe?g|png|gif|svg)$/,
　　　 loader: 'url-loader', // 5KB 以下图片自动转成 base64 码
      query: {
        limit: 5120, // 5KB 以下图片自动转成 base64 码
        name: 'img/[name].[hash:8].[ext]',
      },
　　 }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: /\.css$/,
      loader: ExtractTextPlugin.extract(
        'css'
      )
    }, {
      test: /\.less$/,
      loader: ExtractTextPlugin.extract(
        // activate source maps via loader query
        'css!' +
        'less'
      )
    }]
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: false, // disabled inject
      chunks: ['zh', 'main', 'common'],
      minify: {
        collapseWhitespace: true,
        minifyJS: true,
      },
      title: '<%= title %>',
      body: '<%- body %>',
      intl_locale: '<%= intl_locale %>',
      randomStr: '<%= +new Date() %>',
      timestrap: (+ new Date()),
      template: path.join(__dirname, 'src/templates/index.html'),
      filename: path.join(__dirname, 'index.html'),
    }),
    // 删除重复数据
    new webpack.optimize.DedupePlugin(),
    // 设置分块传输最大数量和最小 size
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 18}),
    new webpack.optimize.MinChunkSizePlugin({minChunkSize: 200000}),
    // new webpack.optimize.CommonsChunkPlugin('vendor', 'common.js'),
    new webpack.optimize.CommonsChunkPlugin('common', 'common.[chunkhash:8].js'),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('index.[chunkhash:8].css', { allChunks: true }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      comments: false
    }),
    new webpack.BannerPlugin(''),
    function() {
      this.plugin('done', function(stats) {
        require('fs').writeFileSync(
          path.join(__dirname, 'stats.json'),
          JSON.stringify(stats.toJson()))
      })
    }
  ]
}