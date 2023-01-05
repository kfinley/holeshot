const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  context: __dirname,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  // devtool: 'source-map',
  devtool: slsw.lib.webpack.isLocal ? 'eval-cheap-module-source-map' : 'source-map', // we're only running sls local so should be able to just ditch these...
  resolve: {
    extensions: ['.mjs', '.js', '.json', '.ts'],
    symlinks: true,
    cacheWithContext: false,
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.paths.json',
      }),
    ],
  },
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  optimization: {
    concatenateModules: true,
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.ts(x?)$/,
        loader: 'ts-loader',
        exclude: [
          [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, '.serverless'),
            path.resolve(__dirname, '.webpack'),
          ],
        ],
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
    ],
  },
  plugins: [],
};
