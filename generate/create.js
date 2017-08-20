'use strict'

let ejs = require('ejs')
let fs = require('fs')
let models = require(process.cwd() + '/server/models')
let modelsName = []

Object.keys(models).forEach((modelName) => {
  let model = models[modelName]
  let needPraseIntAttr = []
  let attrs = []
  Object.keys(model).forEach((attr) => {
    let typeFunc = model[attr]
    if (typeFunc.name === 'Number') {
      needPraseIntAttr.push(attr)
    }
		// 移除model中属性为_id的值
    if (typeFunc.name !== 'Object') {
      attrs.push(attr)
    }
  })
  let routeFile = fs.readFileSync(process.cwd() + '/generate/routes.js')
  routeFile = ejs.render(routeFile.toString(), {
    model: modelName,
    needPraseIntAttr: needPraseIntAttr,
    attrs: attrs
  })
  let serviceFile = fs.readFileSync(process.cwd() + '/generate/service.js')
  serviceFile = ejs.render(serviceFile.toString(), {
    model: modelName
  })
  modelsName.push(modelName)

  fs.writeFileSync(process.cwd() + '/server/controllers/' + modelName.toLocaleLowerCase() + 'Routes.js', routeFile)
  fs.writeFileSync(process.cwd() + '/server/service/' + modelName.toLocaleLowerCase() + 'Service.js', serviceFile)
})

// 创建controllers中的routes.js文件
let entryRouteFile = fs.readFileSync(process.cwd() + '/generate/entryRoute.js')
entryRouteFile = ejs.render(entryRouteFile.toString(), {
  modelsName: modelsName
})
fs.writeFileSync(process.cwd() + '/server/controllers/routes.js', entryRouteFile)
