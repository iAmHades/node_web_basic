'use strict'

let models = require('./../server/models')

Object.keys(models).forEach((key) => {
  let model = models[key]
  let intAttr = []
  Object.keys(model).forEach((attr) => {
    let typeFunc = model[attr]
    if (typeFunc.name === 'Number') {
      intAttr.push(attr)
    }
  })
  console.info(intAttr)
})
