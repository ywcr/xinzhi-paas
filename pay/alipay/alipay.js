"use strict"

const url = require('url')
const inherits = require('util').inherits
const EventEmitter = require('events').EventEmitter

const AliPaySubmit = require('./alipay_submit.js')
const AliPayNotify = require('./alipay_notify.js')
const logger = require('../../utils/logger.js').getLogger('AliPay')


const default_alipay_config = {
	partner:'' //合作身份者id，以2088开头的16位纯数字
	,key:''//安全检验码，以数字和字母组成的32位字符
	,seller_email:'' //卖家支付宝帐户 必填
	,host:'' //域名
	,cacert:'cacert.pem'//ca证书路径地址，用于curl中ssl校验 请保证cacert.pem文件在当前文件夹目录中
	,transport:'http' //访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
	,input_charset:'utf-8'//字符编码格式 目前支持 gbk 或 utf-8
	,sign_type:'MD5'//签名方式 不需修改
	,create_direct_pay_by_user_return_url : ''
	,create_direct_pay_by_user_notify_url: '',
  extra_common_param:''
}

class AliPay extends EventEmitter {
  constructor(aliPayConfig) {
    super()
    this.aliPayConfig = aliPayConfig
    this.aliPayConfig = Object.assign(default_alipay_config, aliPayConfig)
  }

  // 构造请求表单
  createDirectPayByUser(data) {
    const submit = new AliPaySubmit(this.aliPayConfig)
    let params = {
      service: 'create_direct_pay_by_user'
      , partner: this.aliPayConfig.partner
      , payment_type: '1' //支付类型
      , notify_url: url.resolve(this.aliPayConfig.host, this.aliPayConfig.create_direct_pay_by_user_notify_url)//服务器异步通知页面路径,必填，不能修改, 需http://格式的完整路径，不能加?id=123这类自定义参数
      , return_url: url.resolve(this.aliPayConfig.host, this.aliPayConfig.create_direct_pay_by_user_return_url)//页面跳转同步通知页面路径 需http://格式的完整路径，不能加?id=123这类自定义参数，不能写成http://localhost/
      , seller_email: this.aliPayConfig.seller_email //卖家支付宝帐户 必填
      , _input_charset: this.aliPayConfig['input_charset'].toLowerCase().trim(),
      extra_common_param: this.aliPayConfig['extra_common_param']
    }
    params = Object.assign(params, data)
    const requestForm = submit.buildRequestForm(params, 'get', '提交')
    return requestForm
  }

  payReturn(data) {
    //计算验证结果
    const aliPayNotify = new AliPayNotify(this.aliPayConfig)
    const self = this
    return aliPayNotify.verifyReturn(data).then(isOk => {
      if(isOk) {
        const outTradeNo = data['out_trade_no']
        const tradeNo = data['trade_no']
        const tradeStatus = data['trade_status']
        if(tradeStatus === 'TRADE_FINISHED') {
          self.emit('trade_finished', outTradeNo, tradeNo)
        } else if(tradeStatus === 'TRADE_SUCCESS') {
          self.emit('trade_success', outTradeNo, tradeNo)
        }
        return true
      }
      self.emit('verify_fail')
      return 'verify_fail'
    }).catch(err => {
      logger.error('trade_fail', err)
      return err
    })
  }
}
module.exports = AliPay
