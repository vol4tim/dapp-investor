const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const sourcePath = path.join(__dirname, './src');
const staticsPath = path.join(__dirname, './public');

module.exports = (env) => {
  const nodeEnv = env && env.prod ? 'production' : 'development';
  const isProd = nodeEnv === 'production';

  const plugins = [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: 'vendor.bundle.js'
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: nodeEnv,
    }),
    new webpack.NamedModulesPlugin(),
    new ExtractTextPlugin({
      filename: 'app.css',
      allChunks: true
    })
  ];

  if (isProd) {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: false,
          conditionals: true,
          unused: false,
          comparisons: true,
          sequences: true,
          dead_code: false,
          evaluate: true,
          if_return: true,
          join_vars: true,
        },
        output: {
          comments: false,
        },
      })
    );
  } else {
    plugins.push(
      new webpack.HotModuleReplacementPlugin()
    );
  }

  return {
    devtool: isProd ? false : 'cheap-module-eval-source-map',
    // devtool: isProd ? 'cheap-module-source-map' : 'cheap-module-eval-source-map',
    context: sourcePath,
    entry: {
      app: './index.js',
      vendor: ['react', 'react-dom', 'axios', 'bluebird', 'lodash', 'web3-utils', 'eth-lib']
    },
    output: {
      path: staticsPath,
      filename: '[name].bundle.js',
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          exclude: [/node_modules/, /web3_modules/],
          loader: 'eslint-loader',
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: {
            loader: 'file-loader',
            query: {
              name: '[name].[ext]'
            },
          },
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [{
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: '[path][name]__[local]--[hash:base64:5]'
              }
            }]
          })
          // use: [
          //   'style-loader',
          //   {
          //     loader: 'css-loader',
          //     options: {
          //       modules: true,
          //       localIdentName: '[path][name]__[local]--[hash:base64:5]'
          //     }
          //   }
          // ]
          // loader: ExtractTextPlugin.extract(
          //   'style-loader',
          //   'css-loader?modules&sourceMap&importLoaders=1&localIdentName=
          // [local]___[hash:base64:5]'
          // )
        },
        {
          test: /\.(js|jsx)$/,
          include: [
            /node_modules\/(hoek|qs|wreck|boom|lodash-es|ipfs*|libp2p*|ipld*|multi*|promisify-es6|cid*|peer*|is-ipfs)/,
            path.resolve(__dirname, 'src'),
          ],
          use: [
            'babel-loader'
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
      modules: [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, 'web3_modules'),
        sourcePath
      ]
    },

    // externals: {
    //   // Needed for js-ipfs-api
    //   net: '{}',
    //   fs: '{}',
    //   tls: '{}',
    // },

    plugins,

    // performance: isProd && {
    //   maxAssetSize: 100,
    //   maxEntrypointSize: 300,
    //   hints: 'warning',
    // },

    stats: {
      colors: {
        green: '\u001b[32m',
      }
    },

    devServer: {
      contentBase: './public',
      historyApiFallback: true,
      port: 3000,
      compress: isProd,
      inline: !isProd,
      hot: !isProd,
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000 // is this the same as specifying --watch-poll?
      },
      stats: {
        assets: true,
        children: false,
        chunks: false,
        hash: false,
        modules: false,
        publicPath: false,
        timings: true,
        version: false,
        warnings: true,
        colors: {
          green: '\u001b[32m',
        }
      },
    }
  };
};
