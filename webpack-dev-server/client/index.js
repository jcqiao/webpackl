const EventEmiter = require("../utils/eventEmiter");
// let io = require("socket.io-client"); 全局引入了io可以直接使用
const socket = io("/");
// 客户端保存当前的hash
let currentHash;
// 监听事件
socket.on("hash", (hash) => {
  currentHash = hash;
});
socket.on("ok", () => {
  reloadApp();
});
const eventEmiter = new EventEmiter();
function reloadApp() {
  eventEmiter.emit("webpackHotUpdate");
}
