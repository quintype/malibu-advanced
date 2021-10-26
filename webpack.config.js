const SpriteLoaderPlugin = require("svg-sprite-loader/plugin");
const path = require("path");
const webpackConfig = require("@quintype/build/config/webpack");

const resolveConfig = {
  resolve: {
    alias: {
      "react-is": path.resolve("./node_modules/react-is"),
      "lodash-es": "lodash",
      "lodash.debounce": "lodash/debounce",
      "@quintype/components": path.resolve("./node_modules/@quintype/components"),
      react: path.resolve("./node_modules/react"),
      "react-redux": path.resolve("./node_modules/react-redux"),
      redux: path.resolve("./node_modules/redux"),
      warning: path.resolve("./node_modules/warning"),
      "hoist-non-react-statics": path.resolve("./node_modules/hoist-non-react-statics")
    }
  }
};
const { plugins, output, module: webpackModule } = webpackConfig;
const libraryDef = {
  library: "QT_COMPONENTS",
  libraryTarget: "window"
};
if (process.env.NODE_ENV !== "production") output.path = path.resolve("./public");
const customOutput = { ...output, ...libraryDef };
const getSpritePlugin = () => new SpriteLoaderPlugin({ plainSprite: true });
const insertIntoIndex = (arr, index, newItem) => [...arr.slice(0, index), newItem, ...arr.slice(index)];
const enhancedPlugins = insertIntoIndex(plugins, 1, getSpritePlugin());
const spriteRule = {
  test: /\.svg$/,
  use: [
    {
      loader: "svg-sprite-loader",
      options: {
        extract: true,
        spriteFilename: process.env.NODE_ENV === "production" ? "svg-sprite-[hash].svg" : "svg-sprite.svg",
        esModule: false
      }
    },
    "svg-transform-loader",
    "svgo-loader"
  ]
};
const enhancedRules = insertIntoIndex(webpackModule.rules, 5, spriteRule);
enhancedRules[8] = {
  test: /\.(jpe?g|gif|png|woff|woff2|eot|ttf|wav|mp3|ico|mp4)$/,
  loader: "file-loader",
  options: { context: "./app/assets", name: "[name].[ext]" }
};

const externals = {
  // Use external version of React & alike for the components library.
  react: "React",
  "react-dom": "ReactDOM",
  "react-router": "ReactRouter",
  "react-redux": "ReactRedux"
};
module.exports = {
  ...webpackConfig,
  ...resolveConfig,
  module: { ...webpackModule, ...{ rules: enhancedRules } },
  output: customOutput,
  externals,
  plugins: enhancedPlugins
};
