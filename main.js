import { hello } from "./src/helloworld";
const title = "hello";
console.log(12222);
function render() {
  document.querySelector("div").innerText = hello();
}
render();
if (module.hot) {
  module.hot.accept(["./src/helloworld"], render);
}
