const webpack = require("webpack");
const config = require("../webpack.config");
const Server = require("./lib/server/Server");

const compiler = webpack(config);
const server = new Server(compiler);

server.listen(9090, "localhost", () => {
  console.log("localhost://9090 已启动");
});
