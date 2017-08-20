'use strict'

let commonUtil = require('../helpers/commonUtil')
let companyService = require('../service/companyService')


module.exports = function(app) {

	//add Company
	app.post(baseUrl + '/company', function*(req, res) {
		let companyInfo = commonUtil.getJson(req, 'name,address,owner,phone,contractState,num,isReplenishment,companyState,remark,longitude,latitude,createTime')
		companyInfo.contractState = parseInt(companyInfo.contractState)
		companyInfo.num = parseInt(companyInfo.num)
		companyInfo.isReplenishment = parseInt(companyInfo.isReplenishment)
		companyInfo.companyState = parseInt(companyInfo.companyState)
		yield companyService.save(companyInfo)
		res.json({
			code: 100
		})
	})

	//更新 Company
	app.put(baseUrl + '/company', function*(req, res) {
		let companyInfo = commonUtil.getJson(req, 'name,address,owner,phone,contractState,num,isReplenishment,companyState,remark,longitude,latitude,createTime')
		companyInfo.contractState = parseInt(companyInfo.contractState)
		companyInfo.num = parseInt(companyInfo.num)
		companyInfo.isReplenishment = parseInt(companyInfo.isReplenishment)
		companyInfo.companyState = parseInt(companyInfo.companyState)
		if (req.body._id) {
			yield companyService.update(req.body._id, companyInfo)
			res.json({
				code: 100
			})
		} else {
			res.json({
				code: 500,
				data: '缺少_id'
			})
		}
	})

	//单个company对象的获取
	app.get(baseUrl + '/company/:id', function*(req, res) {
		let companyInfo = yield companyService.query(req.params.id)
		res.json({
			code: 100,
			data: companyInfo
		})
	})

	//批量company对象的获取，根据分页属性查询
	app.get(baseUrl + '/companys', function*(req, res) {
		let queryData = commonUtil.getJson(req, 'name,address,owner,phone,contractState,num,isReplenishment,companyState,remark,longitude,latitude,createTime')
		let start = parseInt(req.query.start)
			//limit默认值为10，且不超过30
		let limit = parseInt(req.query.limit) < 30 ? parseInt(req.query.limit) : 10
			// 如果startTime存在，则表示有时间过滤条件在里面
		if (req.query.startTime) {
			queryData['createTime'] = {
				$gt: commonUtil.timeIfNull70(req.query.startTime),
				$lt: commonUtil.timeIfNullNow(req.query.endTime)
			}
		}
		let sort = {
			createTime: -1
		}
		let companyInfo = yield companyService.findPagingData(queryData, start, limit, sort)
		res.json({
			code: 100,
			data: companyInfo
		})
	})

	app.delete(baseUrl + '/company', function*(req, res) {
		yield companyService.remove(req.query._id)
		res.json({
			code: 100
		})
	})

}