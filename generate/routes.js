'use strict'

let commonUtil = require('../helpers/commonUtil')
let <%=model.toLocaleLowerCase()%>Service = require('../service/<%=model.toLocaleLowerCase()%>Service')

module.exports = function(app) {

    //add <%=model%>
	app.post(baseUrl + '/<%=model.toLocaleLowerCase()%>', function*(req, res) {
	   let <%=model.toLocaleLowerCase()%>Info = commonUtil.getJson(req, '<%=attrs%>')
       <%needPraseIntAttr.forEach((attr)=>{ %>
       	  <%=model.toLocaleLowerCase()%>Info.<%=attr%> = parseInt(<%=model.toLocaleLowerCase()%>Info.<%=attr%>)
       <% }) %>
		yield <%=model.toLocaleLowerCase()%>Service.save(<%=model.toLocaleLowerCase()%>Info)
		res.json({
			code: 100
		})
	})

    //更新 <%=model%>
	app.put(baseUrl + '/<%=model.toLocaleLowerCase()%>', function*(req, res) {
       let <%=model.toLocaleLowerCase()%>Info = commonUtil.getJson(req, '<%=attrs%>')
       <%needPraseIntAttr.forEach((attr)=>{ %>
       	  <%=model.toLocaleLowerCase()%>Info.<%=attr%> = parseInt(<%=model.toLocaleLowerCase()%>Info.<%=attr%>)
       <% }) %>
       if(req.body._id){
         yield <%=model.toLocaleLowerCase()%>Service.update(req.body._id,<%=model.toLocaleLowerCase()%>Info)
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

    //单个<%=model.toLocaleLowerCase()%>对象的获取
	app.get(baseUrl + '/<%=model.toLocaleLowerCase()%>/:id', function*(req, res) {
        let <%=model.toLocaleLowerCase()%>Info = yield <%=model.toLocaleLowerCase()%>Service.query(req.params.id)
		 res.json({
			code: 100,
			data: <%=model.toLocaleLowerCase()%>Info
		 })
	})

    //批量<%=model.toLocaleLowerCase()%>对象的获取，根据分页属性查询
	app.get(baseUrl + '/<%=model.toLocaleLowerCase()%>s', function*(req, res) {
		let queryData = commonUtil.getJson(req, '<%=attrs%>')
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
		let sort = {createTime: -1}
        let <%=model.toLocaleLowerCase()%>Info = yield <%=model.toLocaleLowerCase()%>Service.findPagingData(queryData, start, limit, sort)
		 res.json({
			code: 100,
			data: <%=model.toLocaleLowerCase()%>Info
		 })
	})

	app.delete(baseUrl + '/<%=model.toLocaleLowerCase()%>', function*(req, res) {
       yield <%=model.toLocaleLowerCase()%>Service.remove(req.query._id)
		 res.json({
			code: 100
		 })
	})

}