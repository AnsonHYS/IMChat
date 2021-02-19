# imchat

> a vue.js project

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

#预生产环境打包
npm run build:test

#生产环境打包
npm run build:prod

```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

# 关于分享功能组件 如果图标不显示，要在 \node_modules\vue-social-share\dist\client.css 文件里/static 前加. 如下

@font-face {
font-family: "socialshare";
src: url(./static/iconfont.eot);
src: url(./static/iconfont.eot?#iefix) format("embedded-opentype"), url(./static/iconfont.woff) format("woff"), url(./static/iconfont.ttf) format("truetype"), url(./static/iconfont.svg#iconfont) format("svg")
}
