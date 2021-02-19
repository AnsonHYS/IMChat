import 'babel-polyfill'
import Es6Promise from 'es6-promise'
import Vue from 'vue' //vue项目打包分离element-ui，减小vendor包
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from './utils/request'
import store from './store' // 加载容器
import tim from './tim.js'
import TIM from 'tim-js-sdk'
import Share from 'vue-social-share'
import 'vue-social-share/dist/client.css';
// import {
//   ImagePreview
// } from 'vant'



Es6Promise.polyfill()
// 腾讯TIM
window.tim = tim
window.TIM = TIM
Vue.prototype.tim = tim
Vue.prototype.TIM = TIM

Vue.use(ElementUI)


Vue.use(Share)

axios.defaults.timeout = 10000;
Vue.prototype.$axios = axios // axios赋值给全局属性

Vue.prototype.wylmUrl = process.env.WYLM_URL
Vue.prototype.wyyUrl = process.env.WYY_URL

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
