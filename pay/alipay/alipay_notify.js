"use strict"

const coreFunc = require('./alipay_core')
const md5Func = require('./alipay_md5')

class AliPayNotify{ 
  constructor(aliPayConfig) {
    this.httpsVerifyUrl = 'https://mapi.alipay.com/gateway.do?service=notify_verify&'
    this.httpVerifyUrl = 'http://notify.alipay.com/trade/notify_query.do?'
    this.aliPayConfig = aliPayConfig
  }
  verifyReturn(data) {
    const self = this
    return new Promise((resolve, reject) => {
      if(Object.keys(data).length == 0) {
        reject(new Error('The query is empty'))
        return
      }
      const isSign = self.getSignVeryfy(data, data.sign)
      if(!isSign) {
        reject(new Error('The sign is not pass the verification'))
        return
      }
      if(data['notify_id']) {
        self.getResponse(data['notify_id']).then(result => {
          if(result.data === 'true') {
            resolve(true)
            return
          }
          reject(new Error('The notify_id is not pass the verification'))
          return
        }).catch(err => {
          reject(err)
        })
      }
      resolve(true)
    })
  }
  getSignVeryfy(params, sign) {
    const paramsFilter = coreFunc.paraFilter(params)
    const paramsSort = coreFunc.argSort(paramsFilter)
    const prestr = coreFunc.createLinkstring(paramsSort) 
    let isSign = false

    const signTypeConfig = this.aliPayConfig['sign_type'].trim().toUpperCase()

    if(signTypeConfig === 'MD5') {
      isSign = md5Func.md5Verify(prestr, sign, this.aliPayConfig.key)
    } 
    return isSign
  }

/**
 * 获取远程服务器ATN结果,验证返回URL
 * @param notify_id 通知校验ID
 * @return 服务器ATN结果
 * 验证结果集：
 * invalid命令参数不对 出现这个错误，请检测返回处理中partner和key是否为空
 * true 返回正确信息
 * false 请检查防火墙或者是服务器阻止端口问题以及验证时间是否超过一分钟
 */
  getResponse(notifyID) {
    const transport = this.aliPayConfig['transport'].trim().toLowerCase()
    const partner = this.aliPayConfig['partner'].trim()
    let veryfyUrl = ''
    if(transport === 'https') {
      veryfyUrl = this.httpsVerifyUrl
    } else {
      veryfyUrl = this.httpVerifyUrl
    }
    veryfyUrl = `${veryfyUrl}&partner=${partner}&notify_id=${notifyID}`
    return coreFunc.getResponse(veryfyUrl, this.aliPayConfig.cacert)
  }
}

module.exports = AliPayNotify
