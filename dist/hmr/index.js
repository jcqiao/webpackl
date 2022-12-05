class EventEmiter {
  constructor() {
    this.events = {};
  }
  // 订阅
  on(eventName, cb) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(cb);
  }
  emit(eventName, ...rest) {
    if (!this.events[eventName]) {
      return this;
    }
    this.events[eventName].forEach((cb) => {
      cb.call(this, ...rest);
    });
    return this;
  }
}
const eventEmiter = new EventEmiter();
let currentHash;
let lastHash;

(function (modules) {
  // commonjs模块加载具有缓存机制 缓存过的模块不需要再次加载
  const installedModules = {};
  debugger;
  /**
   * 对__webpack_require__简单封装实现模块父子关系
   * @param {main.js} parentModuleId
   * @returns fn 加载子模块
   */
  function hotCreateRequire(parentModuleId) {
    // 因为要加载子模块时父模块肯定加载好了 所以可以直接从缓存中取出父模块
    let parentModule = installedModules[parentModuleId]; // main.js
    if (!parentModule) {
      // 顶级模块无父亲
      return __webpack_require__;
    }
    // 实现父子关系
    let hotRequire = function (childModuleId) {
      // childModuleId: helloword.js
      // 加载子模块id 放入缓存中
      __webpack_require__(childModuleId);
      let childModule = installedModules[childModuleId];
      childModule.parents.push(parentModule);
      parentModule.children.push(childModuleId);
      console.log(childModule, "childm");
      return childModule.exports; // 返回子模块的导出对象
    };
    return hotRequire;
  }
  function hotCheck(params) {
    console.log(lastHash, "lastHa");
    hotDownloadManifest()
      .then((update) => {
        console.log("-----++");
        let chunksId = [...update.c];
        chunksId.forEach((chunkId) => {
          hotDownloadUpdateChunk(chunkId);
        });
        lastHash = currentHash;
      })
      .catch((e) => {
        console.log("---erro", e);
        // window.location.reload();
      });
  }
  function hotDownloadUpdateChunk(chunkId) {
    // jsonp
    let script = document.createElement("script");
    script.src = `${chunkId}-${lastHash}.hot-update.js`;
    document.head.appendChild(script);
  }
  function hotDownloadManifest() {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      let url = `main.${lastHash}.hot-update.json`;
      xhr.open("get", url);
      xhr.responseType = "json";
      xhr.onload = function () {
        debugger;
        resolve(xhr.response);
      };
      xhr.onerror = (e) => {
        console.log("error-", e);
      };
      xhr.send();
    });
  }
  window.webpackHotUpdate = function (chunkId, moreModules) {
    hotAddUpdateChunk(chunkId, moreModules);
  };
  // 记录哪个模块改变了
  let hotUpdate = {};
  function hotAddUpdateChunk(chunkId, moreModules) {
    for (const moduleId in moreModules) {
      // 新的模块覆盖老的模块
      modules[moduleId] = hotUpdate[moduleId] = moreModules[moduleId];
    }
    hotApply();
  }
  function hotApply() {
    for (const moduleId in hotUpdate) {
      // moduleId: "./src/helloworld.js"
      let oldModule = installedModules[moduleId]; // 老的模块-helloworld.js
      delete installedModules[moduleId]; //删除老的
      // 循环所有的父模块 看谁订阅了moduleId 订阅了就将cb调用
      let cbs = parentModule.hot._acceptDependencies[moduleId];
      //module.hot.accept(["helloworld.js"], () => { document.querySelector("div").innerText = hello();})
      cbs && cbs();
    }
  }
  function hotCreateModule(moduleId) {
    let hot = {
      _acceptDependencies: {},
      accept(deps, cb) {
        // module.hot.accept(["helloworld.js"], () => {})
        deps.forEach((dep) => (hot._acceptDependencies[dep] = cb));
      },
      check: hotCheck,
    };
    return hot;
  }
  /**
   * webpack的模块加载是commonjs规范，不能再浏览器端运行，所以自己实现__webpack_require__并加载入口文件
   * @param {*} moduleId
   * @returns module.exports对象
   */
  function __webpack_require__(moduleId) {
    //   缓存中有就直接返回
    if (installedModules[moduleId]) return installedModules[moduleId];
    let module = {
      i: moduleId,
      l: false, // loading
      exports: {},
      parents: [],
      children: [],
      hot: hotCreateModule(moduleId),
    };
    installedModules[moduleId] = module;
    console.log(modules, moduleId, modules[moduleId]);
    // 这个函数执行完会加载helloworld并给module.exports赋值hello函数
    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      hotCreateRequire(moduleId)
    );
    module.l = true;
    // console.log("module", module);
    return module.exports;
  }
  return hotCreateRequire("./main.js")("./main.js");
})({
  "./main.js": function (module, exports, __webpack_require__) {
    // 引入webpack-dev-server/client/index.js & /hot/dev-server.js
    __webpack_require__("./webpack/hot/dev-server.js");
    __webpack_require__("./webpack-dev-server/client/index.js");
    //   要带上后缀
    const hello = __webpack_require__("./src/helloworld.js");
    const title = "hello";
    console.log(12222);
    function render() {
      document.querySelector("div").innerText = hello();
    }
    render();
    if (module.hot) {
      module.hot.accept(["./src/helloworld"], render);
    }
  },
  "./src/helloworld.js": function (module, exports, __webpack_require__) {
    function hello() {
      return "hello world";
    }
    module.exports = hello;
  },
  "./webpack-dev-server/client/index.js": function (
    module,
    exports,
    __webpack_require__
  ) {
    // const EventEmiter = require("../utils/eventEmiter"); 放全局共享
    // let io = require("socket.io-client"); 全局引入了io可以直接使用
    const socket = window.io("/");
    console.log("firstUpdate");
    // 客户端保存当前的hash
    // let currentHash;
    // 监听事件
    socket.on("hash", (hash) => {
      console.log(hash, "hash");
      currentHash = hash;
    });
    socket.on("ok", () => {
      console.log("hash-ok");
      reloadApp();
    });
    // const eventEmiter = new EventEmiter();
    function reloadApp() {
      eventEmiter.emit("webpackHotUpdate");
    }
  },
  "./webpack/hot/dev-server.js": function (
    module,
    exports,
    __webpack_require__
  ) {
    eventEmiter.on("webpackHotUpdate", () => {
      if (!lastHash) {
        // 第一次渲染
        console.log("firstUpdate");
        lastHash = currentHash;
        return;
      }
      debugger;
      console.log("module!!!", module);
      // 调用check向服务器拉最新代码
      module.hot.check();
    });
  },
});
