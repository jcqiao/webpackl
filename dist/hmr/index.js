(function (modules) {})({
  "./main.js": function (module, exports, __webpack_require__) {
    const hello = require("./src/helloworld");
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
