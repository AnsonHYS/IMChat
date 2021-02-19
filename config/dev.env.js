'use strict'
var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  ENV_CONFIG: '"dev"',
  WYLM_URL: '"/wylm"',
  WYY_URL: '"/wyy"',
  WYLM_OTHER: '"/other"'
})
