'use strict'

var IOException = {

	// 处理异步异常
  nioExceptionHandle: function (domain, req, res, next) {
    var serverDomain = domain.create()
		// 监听domain的错误事件
    serverDomain.on('error', function (err) {
      const stack = err.stack
      const title = err.message
      // saveLog(req, res, title, stack)
      serverDomain.dispose()
    })
    serverDomain.add(req)
    serverDomain.add(res)
    serverDomain.run(next)
  },

    // 处理同步异常
  bioExceptionHandle: function (err, req, res, next) {
    const stack = err.stack
    const title = err.message
			// 正式生产环境
    if (err) {
      // saveLog(req, res, title, stack)
    } else {
      next()
    }
  }

}

module.exports = IOException
