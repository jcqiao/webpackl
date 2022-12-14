const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { SourceMapDevToolPlugin } = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
debugger;
module.exports = {
  entry: "./main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].bundle.js",
  },
  devServer: {
    hot: true,
    // static: path.resolve(__dirname, "./src"),
  },
  devtool: "source-map",
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new SourceMapDevToolPlugin({
      filename: "sourcemaps/[file].map",
    }),
  ],
  mode: "development",
  optimization: {
    splitChunks: {
      chunks: "all", // 默认是async 只能处理异步加载
      minSize: 20000, // 当分包的size小于设置的默认20000 20kb 则不会分包
      maxSize: 20000,
      //   minChunks: 3, // 被拆分的包至少被引用1次 需要注释掉minSize maxSize才起作用
      // 统一处理node_module下的包
      cacheGroups: {
        syVendor: {
          test: /[\\/]node_module[\\/]/,
          filename: "js/[id]_vendor.js",
        },
      },
    },
  },
};
