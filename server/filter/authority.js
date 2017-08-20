'use strict'

const redisDao = require('../storage/redisDao')
const jwt = require('jsonwebtoken')
  // 不需要验证的路由
const OKURL = Object.create(null)
OKURL['/auth/gettoken'] = true

var filter = {

  // 允许跨域请求设置
  setCrossDomain: function(req, res, next) {
    res.append('Access-Control-Allow-Origin', '*')
    res.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.append('Access-Control-Allow-Credentials', 'true')
    res.append('Access-Control-Allow-Methods', '*')
    next()
  },

  // jwt验证
  checkToken(req, res, next) {
    if (OKURL[req.path]) {
      next()
    } else {
      // 检查post的信息或者url查询参数或者头信息
      var token = req.query.token || (req.body && req.body.token) || req.headers['x-access-token']
        // 解析 token
      if (token) {
        // 确认token
        jwt.verify(token, 'your secret', function(err, decoded) {
          if (err) {
            return res.status(403).json({
              code: 402,
              data: 'token信息错误.'
            })
          } else {
            // 如果没问题就把解码后的信息保存到请求中，供后面的路由使用
            req.apiData = decoded
            next()
          }
        })
      } else {
        // 如果没有token，则返回错误
        return res.status(403).json({
          code: 404,
          data: '没有提供token'
        })
      }
      next()
    }
  }

}

module.exports = filter