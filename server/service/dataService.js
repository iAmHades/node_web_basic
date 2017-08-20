'use strict'
let configData = require('../storage/mongodbDao').getConfigInstance()
const mongodbDao = require('../storage/mongodbDao').getWorkInstance()
const redisDao = require('../storage/redisDao')
const Promise = require('bluebird')
let constants = require('../helpers/constants')

class DataService {
  // 商户做单 支付给平台的积分和现金  或者其他对平台账户的修改
  getConfigData() {
    let type
      // 数据库配置信息
    let dbConfig
      // redis配置信息
    let rdConfig
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'PRODUCTION') {
      type = '2'
    } else if (process.env.NODE_ENV === 'develop' || process.env.NODE_ENV === 'DEVELOP') {
      type = '1'
    } else if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'TEST') {
      type = '0'
    } else {
      type = '1'
    }
    return configData.init().then(function(data) {
      // 有配置数据库的连接信息的情况
      if (data) {
        return configData.findOne('configInOne', {
            type: type,
            isDeleted: false
          }).then(function(data) {
            if (data) {
              if (type === '2') {
                // 正式配置
                dbConfig = {
                  dbhost1: data.db_dbhost1,
                  dbport1: data.db_dbport1,
                  dbhost2: data.db_dbhost2,
                  dbport2: data.db_dbport2,
                  dbname: data.db_dbname,
                  replSetName: data.db_replSetName,
                  dbusername: data.db_dbusername,
                  dbpwd: data.db_dbpwd
                }
                rdConfig = {
                  redisport: data.rd_redisport,
                  redishost: data.rd_redishost,
                  redispass: data.rd_redispass
                }
              } else {
                // 开发测试配置
                dbConfig = {
                  dbhost: data.db_dbhost,
                  dbport: data.db_dbport,
                  dbname: data.db_dbname
                }
                rdConfig = {
                  redisport: data.rd_redisport,
                  redishost: data.rd_redishost,
                  redispass: data.rd_redispass
                }
              }
              return mongodbDao.init(dbConfig).then(function(data) {
                redisDao.init(rdConfig)
                return Promise.resolve(true)
              })
            } else {
              console.info('Not find config data')
              return Promise.resolve(false)
            }
          })
          // 没有配置数据库的连接信息，该模式下只能开发用
      } else {
        dbConfig = {
          dbhost: constants.MongodbConstants.db_dbhost,
          dbport: constants.MongodbConstants.db_dbport,
          dbname: constants.MongodbConstants.db_dbname
        }
        rdConfig = {
          redisport: constants.RedisConstants.rd_redisport,
          redishost: constants.RedisConstants.rd_redishost,
          redispass: constants.RedisConstants.rd_redispass
        }
        return mongodbDao.init(dbConfig).then(function(data) {
          redisDao.init(rdConfig)
          return Promise.resolve(true)
        })
      }
    })
  }
}

module.exports = new DataService()