<template>
  <div id="app">

    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body,
html {
  margin: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
}
body {
  background-image: linear-gradient(to top, #209cff 0%, #68e0cf 100%);
}
@font-face {
  font-family: "socialshare";
  src: url(../static/iconfont.eot);
  src: url(../static/iconfont.eot?#iefix) format("embedded-opentype"),
    url(../static/iconfont.woff) format("woff"),
    url(../static/iconfont.ttf) format("truetype"),
    url(../static/iconfont.svg#iconfont) format("svg");
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  height: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
