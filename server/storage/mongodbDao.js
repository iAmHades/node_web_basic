'use strict'

let _ = require('lodash')
let Db = require('mongodb').Db
let config = require('../../config')
let Server = require('mongodb').Server
let ObjectID = require('mongodb').ObjectID
let mongoClient = require('mongodb').MongoClient
    // 正式环境
let configInstance = null
let workInstance = null

// 可配置数据库的连接属性,只生产有效
let connOptions = {
  poolSize: 10,
  reconnectTries: 3600,
  reconnectInterval: 1000,
  autoReconnect: true
}
connOptions = _.merge(connOptions, config.mongodbOptions || {})

class MongoDbDao {
  init (conf) {
        // conf为null的时候，连接的是配置数据库
    let me = this
    if (conf) {
      config = conf
      let url = ''
      if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'PRODUCTION') {
        console.info('#########    service start in PRODUCTION    #########')
        let sprintf = require('sprintf-js').sprintf
        url = sprintf('mongodb://%s:%d,%s:%d/%s?replicaSet=%s', config.dbhost1, config.dbport1, config.dbhost2, config.dbport2, config.dbname, config.replSetName)
        return new Promise(function (resolve, reject) {
          mongoClient.connect(url, connOptions, function (err, db) {
            if (err) {
              console.error('connect err:', err)
              reject(err)
            }
            let adminDb = db.admin()
            adminDb.authenticate(config.dbusername, config.dbpwd, function (err, result) {
              if (err) {
                console.error('authenticate err:', err)
                reject(err)
              }
              me._db = db
              resolve(me)
            })
          })
        })
      } else {
        console.info('#########    service start in DEVELOPE    #########')
        me._db = new Db(config.dbname, new Server(config.dbhost, config.dbport, {
          auto_reconnect: true
        }, {
          safe: true
        }))
        return new Promise(function (resolve, reject) {
          me._db.open(function (err, db) {
            if (err) {
              console.log('========= mongodb - err =========', err)
              reject(err)
            } else {
              me._db = db
              resolve(me)
            }
          })
        })
      }
    } else {
            // 有配置数据库的连接信息的情况
      if (config.dbname && config.dbhost && config.dbport) {
        console.info('连接配置数据库，获取数据数据库的配置信息...')
        me._db = new Db(config.dbname, new Server(config.dbhost, config.dbport, {
          auto_reconnect: true
        }, {
          safe: true
        }))
        return new Promise(function (resolve, reject) {
          me._db.open(function (err, db) {
            if (err) {
              console.log('========= mongodb - err =========', err)
              reject(err)
            } else {
              me._db = db
              resolve(me)
            }
          })
        })
                    // 没有配置数据库的连接信息的情况
      } else {
        return Promise.resolve(false)
      }
    }
  }

  save (collection, data) {
    let currentTime = this.getProcessedCurrentTime()
    if (data && data.length) {
      let _len = data.length
      for (let i = 0; i < _len; i++) {
        data[i].createTime = currentTime
        data[i].isDeleted = false
      }
    } else {
      data['createTime'] = currentTime
      data['isDeleted'] = false
    }
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).insert(data, {
        w: 1
      }, function (err, datas) {
        if (err) reject(err)
        resolve(datas.ops[0])
      })
    }.bind(this))
  }

  saveBatch (collection, data) {
    let currentTime = this.getProcessedCurrentTime()
    if (data && data.length) {
      let _len = data.length
      for (let i = 0; i < _len; i++) {
        data[i].createTime = currentTime
        data[i].isDeleted = false
      }
    } else {
      data['createTime'] = currentTime
      data['isDeleted'] = false
    }
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).insert(data, {
        w: 1
      }, function (err, datas) {
        if (err) reject(err)
        resolve(datas.ops)
      })
    }.bind(this))
  }

  getCollection (collection, selector, sort) {
    return new Promise(function (resolve, reject) {
      this.addDefaultCondition(selector)
      this._db.createCollection(collection, function (err, datas) {
        if (err) {
          reject(err)
        } else {
          resolve(datas)
        }
      })
    }.bind(this))
  }

  query (collection, selector, sort) {
    if (typeof (selector) === 'string') {
      selector = {
        _id: ObjectID.createFromHexString(selector)
      }
    }
    if (!sort) {
      sort = {
        createTime: -1
      }
    }
    this.addDefaultCondition(selector)
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).find(selector).sort(sort).toArray(function (err, datas) {
        if (err) reject(err)
        resolve(datas)
      })
    }.bind(this))
  }

  queryAdv (collection, selector, projection, sort) {
    this.addDefaultCondition(selector)
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).find(selector, projection).sort(sort).toArray(function (err, datas) {
        if (err) reject(err)
        resolve(datas)
      })
    }.bind(this))
  }

  findOne (collection, selector) {
    if (typeof (selector) === 'string') {
      selector = {
        _id: ObjectID.createFromHexString(selector)
      }
    }
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).findOne(selector, function (err, datas) {
        if (err) reject(err)
        resolve(datas)
      })
    }.bind(this))
  }

  findBySort (collection, selector, sort, limit) {
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).find(selector).skip(0).limit(limit - 0).sort(sort).toArray(function (err, datas) {
        if (err) reject(err)
        resolve(datas)
      })
    }.bind(this))
  }

  pagingQuery (collection, selector, sort, start, limit) {
    this.addDefaultCondition(selector)
    if (!sort) {
      sort = {
        createTime: -1
      }
    }
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).find(selector).sort(sort).skip(start).limit(limit).toArray(function (err, datas) {
        if (err) reject(err)
        resolve(datas)
      })
    }.bind(this))
  }

    /**
     * 获取分页数据
     * @param {String} collection 表名
     * @param (Object) selector 查询过滤条件
     * @param {Object} pageRequest 分页排序信息
     * @returns {*|promise}
     */
  findPagingData (collection, selector, pageRequest) {
    let me = this
    me.addDefaultCondition(selector)
    return new Promise(function (resolve, reject) {
      let num = 0
      me.getCount(collection, selector).then(function (count) {
        let start = parseInt(pageRequest.start)
        let limit = parseInt(pageRequest.limit)
        num = count
        return me.pagingQuery(collection, selector, pageRequest.sort, start, limit)
      }).then(function (data) {
        resolve({
          total: num,
          records: data
        })
      }).catch(function (err) {
        reject(new Error(err))
      })
    })
  }

    /**
     * 获取分页数据
     * @param {String} collection 表名
     * @param (Object) selector 查询过滤条件
     * @param {Object} pageRequest 分页排序信息
     * @returns {*|promise}
     */
  findPagingSort (collection, selector, start, limit, sort, sortby) {
    let me = this
    me.addDefaultCondition(selector)
    let sortInfo = {}
    if (sort) {
      if (sortby === '-1') {
        sortInfo[sort] = -1
      } else {
        sortInfo[sort] = 1
      }
    }
    return new Promise(function (resolve, reject) {
      let num = 0
      me.getCount(collection, selector).then(function (count) {
        let s = parseInt(start)
        let l = parseInt(limit)
        num = count
        return me.pagingQuery(collection, selector, sortInfo, s, l)
      }).then(function (data) {
        resolve({
          total: num,
          records: data
        })
      }).catch(function (err) {
        reject(new Error(err))
      })
    })
  }

  getCount (collection, selector) {
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).find(selector).count(function (err, count) {
        if (err) reject(err)
        resolve(count)
      })
    }.bind(this))
  }

  update (collection, selector, newData) {
    let currentTime = this.getProcessedCurrentTime()
    if (typeof (selector) === 'string') {
      selector = {
        _id: ObjectID.createFromHexString(selector)
      }
    }
    newData['updateTime'] = currentTime
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).update(selector, {
        $set: newData
      }, {
        w: 1,
        upsert: true
      }, function (err, datas) {
        if (err) reject(err)
        resolve(datas)
      })
    }.bind(this))
  }

  updateAdv (collection, selector, updateObj) {
    let currentTime = this.getProcessedCurrentTime()
    if (typeof (selector) === 'string') {
      selector = {
        _id: ObjectID.createFromHexString(selector)
      }
    }
    if (updateObj.$set) {
      updateObj.$set['updateTime'] = currentTime
    } else {
      updateObj['$set'] = {
        updateTime: currentTime
      }
    }
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).update(selector, updateObj, {
        w: 1,
        upsert: true
      }, function (err, data) {
        if (err) reject(err)
        resolve(data)
      })
    }.bind(this))
  }

  updateBatch (collection, selector, newData) {
    let currentTime = this.getProcessedCurrentTime()
    newData['updateTime'] = currentTime
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).update(selector, {
        $set: newData
      }, {
        w: 1,
        upsert: false,
        multi: true
      }, function (err, datas) {
        if (err) reject(err)
        resolve(datas)
      })
    }.bind(this))
  }

  remove (collection, selector) {
    if (typeof (selector) === 'string') {
      selector = {
        _id: ObjectID.createFromHexString(selector)
      }
    }
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).remove(selector, {
        w: 1
      }, function (err, data) {
        if (err) reject(err)
        resolve(data)
      })
    }.bind(this))
  }

    /**
     * 查询并修改,该操作为一个原子操作
     *  @param remove:boolean 返回之前就删除对象
     *  @param new:true 返回已更改的对象
     *  @param fields 指定返回的字段，默认为全部
     *  @param upsert:boolean 匹配的不存在，就创建并插入数据
     */
  findAndModify (collection, selector, newData, sort) {
    if (!sort) {
      sort = {
        createTime: -1
      }
    }
    if (typeof (selector) === 'string') {
      selector = {
        _id: ObjectID.createFromHexString(selector)
      }
    }
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).findAndModify(selector, sort, newData, {
        w: 1,
        new: true,
        upsert: true
      }, function (err, data) {
        if (err) reject(err)
        resolve(data)
      })
    }.bind(this))
  }
        /**
         * 查询并删除,该操作为一个原子操作
         */
  findAndRemove (collection, selector, sort) {
    if (!sort) {
      sort = {
        createTime: -1
      }
    }
    if (typeof (selector) === 'string') {
      selector = {
        _id: ObjectID.createFromHexString(selector)
      }
    }
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).findAndRemove(selector, sort, function (err, data) {
        if (err) reject(err)
        resolve(data)
      })
    }.bind(this))
  }

  distinct (collection, field) {
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).distinct(field, function (err, data) {
        if (err) reject(err)
        resolve(data)
      })
    }.bind(this))
  }

  group (collection, keys, condition, initial, reduce) {
    return new Promise(function (resolve, reject) {
      this._db.collection(collection).group(keys, condition, initial, reduce, function (err, data) {
        if (err) reject(err)
        resolve(data)
      })
    }.bind(this))
  }

    /**
     * 默认查询加上 isDeleted: false
     * @param {Object} selector 查询参数
     */
  addDefaultCondition (selector) {
        // selector['isDeleted'] = false
  }

    /**
     * Mongodb的时间有偏差，加上偏差的时间，得到处理过的当前时间
     * @returns {Date}
     */
  getProcessedCurrentTime () {
    let date = new Date()
    let newHour = date.getHours() + 8
    date.setHours(newHour)
    return date
  }
}

let DbOperation = {

  getConfigInstance: function () {
    if (configInstance === null) {
      configInstance = new MongoDbDao()
    }
    return configInstance
  },

  getWorkInstance: function () {
    if (workInstance === null) {
      workInstance = new MongoDbDao()
    }
        // console.info(workInstance)
    return workInstance
  }

}

DbOperation.getConfigInstance()
DbOperation.getWorkInstance()

module.exports = DbOperation
