import { hello } from "./src/helloworld";
const title = "hello";
function render() {
  document.body.innerText = hello();
}
render();
if (module.hot) {
  module.hot.accept(["./src/helloworld"], render);
}
