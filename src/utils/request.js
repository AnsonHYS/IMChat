import axios from 'axios'
import store from '@/store'
import {
  getItem
} from '@/utils/storage'

// axios.defaults.baseURL = 'http://113.105.121.26:18480/Wylm_patientAppServer/' // 赋值基础地址(本地-外网）
// axios.defaults.baseURL = 'http://172.16.0.103:8480/Wylm_patientAppServer/' // 赋值基础地址(本地-局域网)
// axios.defaults.baseURL = process.env.WYY + '/Wylm_WapPatServer/' // (线上、预生产)

// axios.defaults.baseURL = 'https://www.bjwylm.com/Platform_N/wap'
axios.defaults.timeout = 30 * 1000; // 30s
console.log('默认接口地址:' + axios.defaults.baseURL)
// 请求拦截器
axios.interceptors.request.use(function (config) {
  // config 是axios的默认请求配置 和传入的配置 结合出来的
  // 必须将config return 不return 不行
  // debugger
  // var token = store.state.user
  // var ciphertext = store.state.userId
  // var pid = store.state.patientID
  var token = getItem('setUser')
  var ciphertext = getItem('userId')
  var pid = getItem('patientID')
  config.headers.common = {
    reqsource: 'wap',
    token: token,
    ciphertext: ciphertext,
    pid: pid
  }
  config.headers['Authorization'] = `Bearer ${token}` // 统一注入token
  return config
}, function () {})
// 导出请求对象
export default axios
