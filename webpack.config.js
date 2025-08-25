const SpriteLoaderPlugin = require("svg-sprite-loader/plugin");
const path = require("path");
const webpackConfig = require("@quintype/build/config/webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

const { plugins, output, module: webpackModule } = webpackConfig;
if (process.env.NODE_ENV !== "production") output.path = path.resolve("./public");

const getSpritePlugin = () => new SpriteLoaderPlugin({ plainSprite: true });
const insertIntoIndex = (arr, index, newItem) => [...arr.slice(0, index), newItem, ...arr.slice(index)];

// Enhanced plugins for production
const enhancedPlugins = insertIntoIndex(plugins, 1, getSpritePlugin());

// Add performance optimizations for production
if (process.env.NODE_ENV === "production") {
  enhancedPlugins.push(
    new CompressionPlugin({
      test: /\.(js|css|html|svg)$/,
      algorithm: "gzip",
      threshold: 10240,
      minRatio: 0.8,
    })
  );

  // Bundle analyzer for development
  if (process.env.ANALYZE_STATS) {
    enhancedPlugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
        reportFilename: "bundle-analysis.html",
      })
    );
  }
}

const spriteRule = {
  test: /\.svg$/,
  use: [
    {
      loader: "svg-sprite-loader",
      options: {
        extract: true,
        spriteFilename: process.env.NODE_ENV === "production" ? "svg-sprite-[hash].svg" : "svg-sprite.svg",
        esModule: false,
      },
    },
    "svg-transform-loader",
    "svgo-loader",
  ],
};

const enhancedRules = insertIntoIndex(webpackModule.rules, 5, spriteRule);
enhancedRules[8] = {
  test: /\.(jpe?g|gif|png|woff|woff2|eot|ttf|wav|mp3|ico|mp4)$/,
  loader: "file-loader",
  options: {
    context: "./app/assets",
    name: "[name].[ext]",
    // Add image optimization
    ...(process.env.NODE_ENV === "production" && {
      limit: 8192,
      fallback: "file-loader",
    })
  },
};

// Enhanced optimization configuration
const optimization = {
  ...webpackConfig.optimization,
  splitChunks: {
    chunks: "all",
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: "vendors",
        chunks: "all",
        priority: 10,
      },
      common: {
        name: "common",
        minChunks: 2,
        chunks: "all",
        priority: 5,
        reuseExistingChunk: true,
      },
      // Separate React and React DOM
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: "react",
        chunks: "all",
        priority: 20,
      },
      // Separate lodash
      lodash: {
        test: /[\\/]node_modules[\\/]lodash[\\/]/,
        name: "lodash",
        chunks: "all",
        priority: 15,
      },
    },
  },
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === "production",
          drop_debugger: process.env.NODE_ENV === "production",
        },
        mangle: true,
      },
      extractComments: false,
    }),
  ],
};

module.exports = {
  ...webpackConfig,
  module: { ...webpackModule, ...{ rules: enhancedRules } },
  plugins: enhancedPlugins,
  optimization,
  // Add explicit dev server configuration
  devServer: {
    ...(webpackConfig.devServer || {}),
    port: 8081,
    host: '0.0.0.0',
    allowedHosts: 'all',
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
};
