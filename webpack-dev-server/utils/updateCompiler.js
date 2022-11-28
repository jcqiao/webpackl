const path = require("path");
/**
 * 实现客户端 服务端通信 向entry注入代码
 * webpack/hot/dev-server.js
 * webpack-dev-server/client/index.js
 * @param {*} compiler
 */
function updateCompiler(compiler) {
  const config = compiler.options;
  config.entry = {
    main: [
      path.resolve(__dirname, "../client/index.js"),
      path.resolve(__dirname, "../../webpack/hot/dev-server.js"),
      config.entry,
    ],
  };
}
module.exports = updateCompiler;
