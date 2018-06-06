/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Payment for wechat
 *
 * v0.1 - 2016-12-14
 * @author Zhangpc
 */
'use strict'

const md5 = require('md5')
const sha1 = require('sha1')
const urllib = require('urllib')
const _ = require('lodash')
const xml2js = require('xml2js')
const url_mod = require('url')

const signTypes = {
  MD5: md5,
  SHA1: sha1
}

const RETURN_CODES = {
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL'
}

const URLS = {
  UNIFIED_ORDER: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
  ORDER_QUERY: 'https://api.mch.weixin.qq.com/pay/orderquery',
  REFUND: 'https://api.mch.weixin.qq.com/secapi/pay/refund',
  REFUND_QUERY: 'https://api.mch.weixin.qq.com/pay/refundquery',
  DOWNLOAD_BILL: 'https://api.mch.weixin.qq.com/pay/downloadbill',
  SHORT_URL: 'https://api.mch.weixin.qq.com/tools/shorturl',
  CLOSE_ORDER: 'https://api.mch.weixin.qq.com/pay/closeorder'
}

/**
 * 微信支付类
 *
 * @class Payment
 */
class Payment {
  /**
   * Creates an instance of Payment.
   *
   * @param {Object} config
   *
   * @memberOf Payment
   */
  constructor(config) {
    this.appId = config.appId
    this.partnerKey = config.partnerKey
    this.mchId = config.mchId
    this.subMchId = config.subMchId
    this.notifyUrl = config.notifyUrl
    this.passphrase = config.passphrase || config.mchId
    this.pfx = config.pfx
  }

  getBrandWCPayRequestParams(order) {
    const default_params = {
      appId: this.appId,
      timeStamp: this._generateTimeStamp(),
      nonceStr: this._generateNonceStr(),
      signType: 'MD5'
    }

    order = this._extendWithDefault(order, [
      'notify_url'
    ])

    return this.unifiedOrder(order).then(data => {
      const params = _.extend(default_params, {
        package: 'prepay_id=' + data.prepay_id
      })

      params.paySign = this._getSign(params)

      if (order.trade_type == 'NATIVE') {
        params.codeUrl = data.code_url
      }

      return params
    })
  }

  _httpRequest(url, data) {
    return urllib.request(url, {
      method: 'POST',
      data
    }).then(result => result.data)
  }

  _httpsRequest(url, data) {
    const parsed_url = url_mod.parse(url)
    const url_obj = {
      host: parsed_url.host,
      port: 443,
      path: parsed_url.path,
    }
    return urllib.request(url_obj, {
      pfx: this.pfx,
      passphrase: this.passphrase,
      method: 'POST',
      data
    }).then(result => result.data)
  }

  _signedQuery(url, params, options) {
    const required = options.required || []
    params = this._extendWithDefault(params, [
      'appid',
      'mch_id',
      'sub_mch_id',
      'nonce_str'
    ])

    params = _.extend({
      'sign': this._getSign(params)
    }, params)

    if (params.long_url) {
      params.long_url = encodeURIComponent(params.long_url)
    }

    for (var key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        params[key] = params[key].toString()
      }
    }

    const missing = []
    required.forEach(key => {
      let alters = key.split('|')
      for (let i = alters.length - 1; i >= 0; i--) {
        if (params[alters[i]]) {
          return
        }
      }
      missing.push(key)
    })

    if (missing.length) {
      return new Promise((resolve, reject) => {
        let err = new Error('missing params ' + missing.join(','))
        reject(err)
      })
    }

    const request = (options.https ? this._httpsRequest : this._httpRequest).bind(this);
    return request(url, this.buildXml(params)).then(data => this.validate(data))
  }

  unifiedOrder(params) {
    var requiredData = ['body', 'out_trade_no', 'total_fee', 'spbill_create_ip', 'trade_type']
    if (params.trade_type == 'JSAPI') {
      requiredData.push('openid')
    } else if (params.trade_type == 'NATIVE') {
      requiredData.push('product_id')
    }
    params.notify_url = params.notify_url || this.notifyUrl
    return this._signedQuery(URLS.UNIFIED_ORDER, params, {
      required: requiredData
    })
  }

  orderQuery(params) {
    return this._signedQuery(URLS.ORDER_QUERY, params, {
      required: ['transaction_id|out_trade_no']
    })
  }

  refund(params) {
    params = this._extendWithDefault(params, [
      'op_user_id'
    ])

    return this._signedQuery(URLS.REFUND, params, {
      https: true,
      required: ['transaction_id|out_trade_no', 'out_refund_no', 'total_fee', 'refund_fee']
    })
  }

  refundQuery(params) {
    return this._signedQuery(URLS.REFUND_QUERY, params, {
      required: ['transaction_id|out_trade_no|out_refund_no|refund_id']
    })
  }

  downloadBill(params) {
    return this._signedQuery(URLS.DOWNLOAD_BILL, params, {
      required: ['bill_date', 'bill_type']
    }).catch(err => {
      if (err.name == 'XMLParseError') {
        return this.parseCsv(err.xml)
      }
      throw err
    })
  }

  shortUrl(params) {
    return this._signedQuery(URLS.SHORT_URL, params, {
      required: ['long_url']
    })
  }

  closeOrder(params) {
    return this._signedQuery(URLS.CLOSE_ORDER, params, {
      required: ['out_trade_no']
    })
  }

  parseCsv(text) {
    const rows = text.trim().split(/\r?\n/)

    function toArr(rows) {
      const titles = rows[0].split(',')
      const bodys = rows.splice(1)
      const data = []

      bodys.forEach(row => {
        let rowData = {}
        row.split(',').forEach(function (cell, i) {
          rowData[titles[i]] = cell.split('`')[1]
        })
        data.push(rowData)
      })
      return data
    }

    return {
      list: toArr(rows.slice(0, rows.length - 2)),
      stat: toArr(rows.slice(rows.length - 2, rows.length))[0]
    }
  }

  buildXml(obj) {
    const builder = new xml2js.Builder()
    const xml = builder.buildObject({ xml: obj })
    return xml
  }

  validate(xml) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xml, {
        trim: true,
        explicitArray: false
      }, (err, json) => {
        let error = null
        let data
        if (err) {
          err.name = 'XMLParseError'
          err.xml = xml
          return reject(err)
        }

        data = json ? json.xml : {}
        error = this.validateObj(data)
        if (error) {
          return reject(error)
        }
        resolve(data)
      })
    })
  }

  validateObj(data) {
    let error = null
    if (!data) {
      error = new Error('InvalidData')
      error.name = 'InvalidData'
    } else if (data.return_code == RETURN_CODES.FAIL) {
      error = new Error(data.return_msg)
      error.name = 'ProtocolError'
    } else if (data.result_code == RETURN_CODES.FAIL) {
      error = new Error(data.err_code)
      error.name = 'BusinessError'
    } else if (this.appId !== data.appid) {
      error = new Error()
      error.name = 'InvalidAppId'
    } else if (this.mchId !== data.mch_id) {
      error = new Error()
      error.name = 'InvalidMchId'
    } else if (this.subMchId && this.subMchId !== data.sub_mch_id) {
      error = new Error()
      error.name = 'InvalidSubMchId'
    } else if (this._getSign(data) !== data.sign) {
      error = new Error()
      error.name = 'InvalidSignature'
    }
    return error
  }

  /**
   * 使用默认值扩展对象
   * @param  {Object} obj
   * @param  {Array} keysNeedExtend
   * @return {Object} extendedObject
   */
  _extendWithDefault(obj, keysNeedExtend) {
    const defaults = {
      appid: this.appId,
      mch_id: this.mchId,
      sub_mch_id: this.subMchId,
      nonce_str: this._generateNonceStr(),
      notify_url: this.notifyUrl,
      op_user_id: this.mchId
    }
    const extendObject = {}
    keysNeedExtend.forEach(k => {
      if (defaults[k]) {
        extendObject[k] = defaults[k]
      }
    })
    return _.extend(extendObject, obj)
  }

  _getSign(pkg, signType) {
    pkg = _.clone(pkg)
    delete pkg.sign
    signType = signType || 'MD5'
    let string1 = this._toQueryString(pkg)
    let stringSignTemp = string1 + '&key=' + this.partnerKey
    let signValue = signTypes[signType](stringSignTemp).toUpperCase()
    return signValue
  }

  _toQueryString(object) {
    return Object.keys(object).filter(key => {
      return object[key] !== undefined && object[key] !== ''
    }).sort().map(key => {
      return key + '=' + object[key]
    }).join('&')
  }

  _generateTimeStamp() {
    return parseInt(+new Date() / 1000, 10) + ''
  }

  /**
   * [_generateNonceStr description]
   * @param  {[type]} length [description]
   * @return {[type]}        [description]
   */
  _generateNonceStr(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const maxPos = chars.length
    let noceStr = ''
    let i
    for (i = 0; i < (length || 32); i++) {
      noceStr += chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return noceStr
  }
}

exports.Payment = Payment