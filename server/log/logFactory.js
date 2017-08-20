'use strict'

let log4js = require('log4js')
let fs = require('fs')
    // 日志目录路径
let __root = 'logs'
if (!fs.existsSync(process.cwd() + '/' + __root)) {
  fs.mkdirSync(process.cwd() + '/' + __root)
}

var appender = {
  appenders: [{
    type: 'dateFile',
    filename: __root + '/app-' + new Date().getTime() + '.log',
    maxLogSize: 10485760,
    numBackups: 30,
    pattern: '-yyyy-MM-dd',
    category: 'app'
  }, {
    type: 'dateFile',
    filename: __root + '/error-' + new Date().getTime() + '.log',
    maxLogSize: 10485760,
    numBackups: 30,
    pattern: '-yyyy-MM-dd',
    category: 'error'
  }, {
    type: 'dateFile',
    filename: __root + '/debug-' + new Date().getTime() + '.log',
    maxLogSize: 10485760,
    numBackups: 30,
    pattern: '-yyyy-MM-dd',
    category: 'debug'
  }, {
    type: 'dateFile',
    filename: __root + '/warn-' + new Date().getTime() + '.log',
    maxLogSize: 10485760,
    numBackups: 30,
    pattern: '-yyyy-MM-dd',
    category: 'warn'
  }]
}

// 非生产环境，就在console输出日志
if (!(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'PRODUCTION')) {
  appender.appenders.push({
    type: 'console'
  })
}

log4js.configure(appender)

var appLogger = log4js.getLogger('app')
var errorLogger = log4js.getLogger('error')
var debugLogger = log4js.getLogger('debug')
var warnLogger = log4js.getLogger('warn')

exports.getLogger = function () {
  return {
    info: function (text) {
      appLogger.info(text)
    },
    error: function (text) {
      errorLogger.error(text)
    },
    debug: function (text) {
      debugLogger.debug(text)
    },
    warn: function (text) {
      warnLogger.warn(text)
    }
  }
}
