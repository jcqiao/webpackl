(function (modules) {
  // commonjs模块加载具有缓存机制 缓存过的模块不需要再次加载
  const installedModules = {};
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
    };
    installedModules[moduleId] = module;
    console.log(modules, moduleId, modules[moduleId]);
    // 这个函数执行完会加载helloworld并给module.exports赋值hello函数
    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );
    module.l = true;
    console.log("module", module);
    return module.exports;
  }
  return __webpack_require__("./main.js");
})({
  "./main.js": function (module, exports, __webpack_require__) {
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
});
