const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const safePostCssParser = require('postcss-safe-parser');
const postcssNormalize = require('postcss-normalize');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');

const APP_SRC_PATH = path.resolve(__dirname, '../src');
const APP_DIST_PATH = path.resolve(__dirname, '../dist');
const APP_PUBLIC_PATH = path.resolve(__dirname, '../public');
const IMAGE_INLINE_SIZE_LIMIT = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || '10000', 10);

// style files regex
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false;
  }

  try {
    require.resolve('react/jsx-runtime');
    return true;
  } catch (e) {
    return false;
  }
})();

module.exports = function() {
  const isEnvDevelopment = process.env.NODE_ENV === 'development';
  const isEnvProduction = process.env.NODE_ENV === 'production';

  const developmentPlugins = isEnvDevelopment
    ? [
      new ReactRefreshWebpackPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerHost: '127.0.0.1',
        analyzerPort: '8888',
        reportFilename: path.resolve(__dirname, '../report/report.html'),
        defaultSizes: 'parsed',
        openAnalyzer: true,
        generateStatsFile: false,
        statsFilename: path.resolve(__dirname, '../report/stats.json'),
        statsOptions: null,
        excludeAssets: null,
        logLevel: 'info',
      }),
    ]
    : [];

  // common function to get style loaders
  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        // css is located in `static/css`, use '../../' to locate index.html folder
        // in production `paths.publicUrlOrPath` can be a relative path
        options: {
          publicPath: '/',
        },
      },
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve('postcss-loader'),
        options: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          plugins: () => [
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({
              autoprefixer: {
                flexbox: 'no-2009',
              },
              stage: 3,
            }),
            // Adds PostCSS Normalize as the reset css with default options,
            // so that it honors browserslist config in package.json
            // which in turn let's users customize the target behavior as per their needs.
            postcssNormalize(),
          ],
          sourceMap: isEnvProduction,
        },
      },
    ].filter(Boolean);

    if (preProcessor) {
      loaders.push(
        {
          loader: require.resolve('resolve-url-loader'),
          options: {
            sourceMap: isEnvProduction,
            root: APP_SRC_PATH,
          },
        },
        {
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: true,
          },
        },
      );
    }

    return loaders;
  };

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    entry: [
      path.resolve(APP_SRC_PATH, 'index.tsx'),
    ],
    devtool: isEnvProduction
      ? 'source-map'
      : isEnvDevelopment && 'cheap-module-source-map',
    output: {
      path: APP_DIST_PATH,
      filename: 'static/js/' + (isEnvDevelopment ? '[name].bundle.js' : '[name].[hash:8].js'),
      chunkFilename: 'static/js/' + (isEnvDevelopment ? '[name].chunk.js' : '[name].[contenthash:8].chunk.js'),
      publicPath: '/',
      libraryTarget: 'umd',
    },
    externals: [
      {
        lodash: {
          commonjs: 'lodash',
          amd: 'lodash',
          root: '_', // indicates global variable
          commonjs2: 'lodash',
        },
        'react': 'React',
        'react-dom': 'ReactDOM',
        'moment': 'moment',
      },
      function(context, request, callback) {
        if (request.startsWith('sockjs-client')) {
          return callback(null, {
            root: 'SockJS',
            commonjs: `${request}/index`,
            commonjs2: `${request}/index`,
            amd: `${request}/index`,
          });
        }
        callback();
      },
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 30,
            chunks: 'initial',
          },
          common: {
            test: function (module, chunks) {
              if (/@material-ui\/core/.test(module.context)) {
                return false;
              }
              return true;
            },
            chunks: 'all',
            name: 'common',
            minChunks: 2,
            priority: 20,
          },
          '@ant-design': {
            name: 'ant-design',
            test: /[\\/]@ant-design[\\/]/,
            priority: 30,
            chunks: 'initial',
          },
        },
      },
      minimizer: [
        new TerserWebpackPlugin({
          cache: true,
          parallel: true,
          sourceMap: true, // Must be set to true if using source-maps in production
          terserOptions: {
            parse: {
              // We want terser to parse ecma 8 code. However, we don't want it
              // to apply any minification steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending further investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true,
            },
            // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
          },
        }),
        new OptimizeCSSAssetsWebpackPlugin({
          cssProcessorOptions: {
            parser: safePostCssParser,
            map: {
              // `inline: false` forces the sourcemap to be output into a
              // separate file
              inline: false,
              // `annotation: true` appends the sourceMappingURL to the end of
              // the css file, helping the browser find the sourcemap
              annotation: true,
            },
          },
          cssProcessorPluginOptions: {
            preset: ['default', { minifyFontValues: { removeQuotes: false }}],
          },
        }),
      ],
      // Keep the runtime chunk separated to enable long term caching
      // https://twitter.com/wSokra/status/969679223278505985
      // https://github.com/facebook/create-react-app/issues/5358
      runtimeChunk: {
        name: entryPoint => `runtime-${entryPoint.name}`,
      },
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', 'jsx'],
      alias: {
        'katex': path.resolve(process.cwd(), 'node_modules/katex'),
      },
    },
    devServer: {
      hot: true,
      host: '0.0.0.0',
      inline: true,
      contentBase: APP_PUBLIC_PATH,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          secure: true,
          changeOrigin: true,
          pathRewrite: {
            '^/api': '/api',
          },
        },
        '/socket.io': {
          target: 'http://localhost:3000',
          secure: true,
          changeOrigin: true,
          pathRewrite: {
            '^/socket.io': '/socket.io',
          },
        },
      },
      ...(
        isEnvDevelopment
          ? {
            https: {
              key: fs.readFileSync(path.resolve(__dirname, '../ssl/*.lenconda.top.key'), 'utf-8'),
              cert: fs.readFileSync(path.resolve(__dirname, '../ssl/*.lenconda.top.cer'), 'utf-8'),
              ca: fs.readFileSync(path.resolve(__dirname, '../ssl/ca.cer'), 'utf-8'),
            },
          }
          : {}
      ),
    },
    module: {
      strictExportPresence: true,
      rules: [
        { parser: { requireEnsure: false }},
        {
          oneOf: [
            // {
            //   test: /\.(html|ejs)$/,
            //   exclude: /node_modules/,
            //   use: ['html-loader'],
            // },
            {
              test: [/\.avif$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: IMAGE_INLINE_SIZE_LIMIT,
                mimetype: 'image/avif',
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: IMAGE_INLINE_SIZE_LIMIT,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // Process application JS with Babel.
            // The preset includes JSX, Flow, TypeScript, and some ESnext features.
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: APP_SRC_PATH,
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve('babel-preset-react-app/webpack-overrides'),
                presets: [
                  [
                    require.resolve('babel-preset-react-app'),
                    {
                      runtime: hasJsxRuntime ? 'automatic' : 'classic',
                    },
                  ],
                ],
                plugins: [
                  isEnvDevelopment && require.resolve('react-refresh/babel'),
                ].filter(Boolean),
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,
                compact: isEnvProduction,
              },
            },
            // Process any JS outside of the app with Babel.
            // Unlike the application JS, we only compile the standard ES features.
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('babel-preset-react-app/dependencies'),
                    { helpers: true },
                  ],
                ],
                cacheDirectory: true,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,
                // Babel sourcemaps are needed for debugging into node_modules
                // code.  Without the options below, debuggers like VSCode
                // show incorrect code and set breakpoints on the wrong lines.
                sourceMaps: true,
                inputSourceMap: true,
              },
            },
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds assets as dependencies.
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use MiniCSSExtractPlugin to extract that CSS
            // to a file, but in development "style" loader enables hot editing
            // of CSS.
            // By default we support CSS Modules with the extension .module.css
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction,
              }),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
            // using the extension .module.css
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction,
              }),
            },
            // Opt-in support for Less (using .less extensions).
            // By default we support Less Modules with the
            // extensions .module.scss or .module.less
            {
              test: lessRegex,
              exclude: lessModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction,
                },
                'less-loader',
              ),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // Adds support for CSS Modules, but using Less
            // using the extension .module.scss or .module.less
            {
              test: lessModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  sourceMap: isEnvProduction,
                },
                'less-loader',
              ),
            },
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              loader: require.resolve('file-loader'),
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
          ],
        },
      ],
    },
    plugins: [
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        filename: path.resolve(APP_DIST_PATH, 'index.html'),
        template: path.resolve(APP_PUBLIC_PATH, 'index.html'),
        appName: 'ExamPro',
        templateParameters: {
          appName: 'ExamPro',
        },
        chunksSortMode: 'none',
        inject: true,
        ...(isEnvProduction
          ? {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
          }
          : undefined),
      }),
      new MiniCssExtractPlugin({
        filename: isEnvDevelopment ? 'static/css/[name].css' : 'static/css/[name].[contenthash:8].css',
        chunkFilename: isEnvDevelopment ? 'static/css/[id].css' : 'static/css/[id].[contenthash:8].css',
      }),
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, '../assets/'),
          to: path.resolve(APP_DIST_PATH, 'assets'),
        },
      ]),
      new CleanWebpackPlugin(),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.DefinePlugin({
        STUN_SERVER: JSON.stringify(process.env.STUN_SERVER),
        TURN_SERVER: JSON.stringify(process.env.TURN_SERVER),
        TURN_SERVER_USERNAME: JSON.stringify(process.env.TURN_SERVER_USERNAME),
        TURN_SERVER_CREDENTIAL: JSON.stringify(process.env.TURN_SERVER_CREDENTIAL),
      }),
      ...developmentPlugins,
    ],
  };
};
