const express = require("express");
const http = require("http");
const path = require("path");
// const memoryFS = require("memory-fs");
// 为了更加直观 将memoryFs 变为硬盘fs 这样就能在dist目录下观察到了
const fs = require("fs-extra");
fs.join = path.join;

const mime = require("mime");
const updateCompiler = require("../../utils/updateCompiler");
const socketIO = require("socket.io");
class Server {
  constructor(compiler) {
    // init
    this.compiler = compiler;
    this.currentHash;
    this.clientSocketList = [];
    updateCompiler(compiler);
    this.setupHooks();
    // 创建app实例
    this.setupApp();
    // 创建webpack-dev-middleware，返回一个中间件
    this.setupDevMiddleware();
    // 创建http
    this.createServer();
    // 配置路由 使用中间件 客户端通过路由访问中间件再访问文件系统获取文件
    this.routes();
    // 创建ws
    this.createSocketServer();
  }
  setupHooks() {
    this.compiler.hooks.done.tap("webpack-dev-server", (stat) => {
      //   console.log("stat : ", stat);
      this.currentHash = stat.hash;
      // 发布订阅 通知所有订阅者发送消息
      this.clientSocketList.forEach((socket) => {
        socket.emit("hash", this.currentHash);
        socket.emit("ok");
      });
    });
  }
  setupDevMiddleware() {
    this.middleware = this.webpackDevMiddleware();
  }
  webpackDevMiddleware() {
    this.compiler.watch({}, () => {
      console.log("中间件以监听模式启动编译");
    });
    // const fs = new memoryFS();
    // 打包后的文件写入memory fs
    this.fs = this.compiler.outputFileSystem = fs;
    // 返回一个中间件 用来响应客户端对文件的请求 如main.js index.html
    return (staticDir) => {
      return (req, res, next) => {
        let { url } = req;
        url === "/" ? (url = "index.html") : null;
        let filePath = path.join(staticDir, url);
        console.log("filepath", filePath);
        try {
          // 返回文件描述对象
          let staticObj = this.fs.statSync(filePath);
          // console.log(staticObj, "staticObj");
          if (staticObj.isFile()) {
            const content = this.fs.readFileSync(filePath);
            console.log("content", content);
            res.setHeader("Content-Type", mime.getType(filePath));
            res.send(content);
          }
        } catch (error) {
          console.log(error, "error");
          return res.sendStatus(404);
        }
      };
    };
  }
  routes() {
    const config = this.compiler.options;
    this.app.use(this.middleware(config.output.path));
  }
  createSocketServer() {
    //   ws启动依赖http服务
    const io = socketIO(this.server);
    io.on("connection", (socket) => {
      // 客户端订阅
      this.clientSocketList.push(socket);
      //   发送hash
      socket.emit("hash", this.currentHash);
      socket.emit("ok");
      //   客户端断开连接则删除订阅
      socket.on("disconnect", (socket) => {
        const index = this.clientSocketList.indexOf(socket);
        this.clientSocketList.splice(index, 1);
      });
    });
  }
  setupApp() {
    this.app = express();
  }
  createServer() {
    this.server = http.createServer(this.app);
  }
  listen(port, host, cb) {
    this.server.listen(port, host, cb);
  }
}
module.exports = Server;
