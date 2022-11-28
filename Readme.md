# webpack learn

## HMR

### 依赖安装

webpack-dev-server socket.io

### content

static 配置了静态资源位置时 指定 webpackHtmlPlugin template 可以监听到静态资源如 html 的变化，进行 live reload 而不是 HMR

webpack watch 的非静态资源的变化会通过 socket 发送信号 type: hash; type: ok; 给客户端
客户端 dev-serve-client 收到信号后会通知客户端的 webpack/hot/runtime 去向 server 端发送两个请求，1 manifest 文件 response c:[changeNamelist]；2 请求变更的文件 response 文件

dev:node 用来调试自己写的 hmr
memory-fs 是要单独安装的
