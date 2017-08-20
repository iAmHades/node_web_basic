/**
 * Created by Hades on 15/6/23.
 */
var constants = {

  /**
   * 微信常用变量
   */
  WeixinConstants: {
    // 应用ID
    APPID: '',
    // 应用密钥
    APPSECRET: '',
    // Token 令牌
    TOKEN: '',
    // 消息加解密密钥
    ENCODINGAESKEY: '',
    // 商户号
    MCHID: '',
    // 回调地址
    NOTIFYURL: '',
    // 证书
    PFX: process.cwd() + '/cert/apiclient_cert.p12',
    // 密钥设置
    PARTNERKEY: ''
  },
  /**
   * 百度地图常用变量
   */
  BaiduConstants: {
    MAPAK: ''
  },
  /**
   *  银联常用变量
   */
  UnionConstants: {
    VERSION: '5.1.0',
    ENCODING: 'utf-8',
    SIGNMETHOD: '01',
    FRONTTRANSURL: '',
    FRONTURL: '',
    FRONTURL1: '',
    BACKURL: '',
    MERID: '',
    SIGNCERTPATH: '',
    SIGNCERTPWD: '',
    SECUREKEY: ''
  },
  /**
   * 腾讯常用变量
   */
  TxConstants: {
    key: ''
  },
  /**
   * 微信模版id
   */
  TemplateConstants: {
    WX_TEMPLATE_NEWORDER: ''
  },

  /**
   * Mongodb数据库
   */
  MongodbConstants: {
    db_dbhost: '',
    db_dbport: 0,
    db_dbname: '',
    db_dbpass: ''
  },

  /**
   * Redis
   */
  RedisConstants: {
    rd_redisport: 0,
    rd_redishost: '',
    rd_redispass: ''
  }

}
module.exports = constants
