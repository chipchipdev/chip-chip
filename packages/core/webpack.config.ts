/* node modules import */
const path = require('path');

/* webpack plugins */
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

/**
 * @description webpack build config ( for typescript )
 */
const config = {
  mode: 'none',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.js',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /.ts?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsConfigPathsPlugin({
        configFile: path.resolve(__dirname, 'tsconfig.json'),
      }),
    ],
  },
  // webpack4 optimizations
  optimization: {
    nodeEnv: false,
    minimize: true,
  },
  // to let __dirname & __filename not a relative path
  node: {
    __filename: false,
    __dirname: false,
  },
  // fork tsconfig.json
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, 'tsconfig.json'),
      },
    }),
    // new PeerDepsExternalsPlugin(),
  ],
};

export default config;
