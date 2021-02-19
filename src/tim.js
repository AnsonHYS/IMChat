import TIM from 'tim-js-sdk'
import COSSDK from 'cos-js-sdk-v5'
console.log('环境', process.env.ENV_CONFIG)
var tim = ''
// 本地、预生产
if (process.env.ENV_CONFIG === 'dev' || process.env.ENV_CONFIG === 'test') {
  tim = TIM.create({
    SDKAppID: 1400466018
  })
  console.log('Appid[预生产环境]：1400466018')
}

// 生产环境
if (process.env.ENV_CONFIG === 'prod') {
  tim = TIM.create({
    SDKAppID: 1400372093
  })
  console.log('Appid[生产环境]：1400372093')
}


window.setLogLevel = tim.setLogLevel

// 无日志级别
tim.setLogLevel(0)

// 注册 cos
tim.registerPlugin({
  'cos-js-sdk': COSSDK
})
export default tim
