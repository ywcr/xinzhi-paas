/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Middleware for wechat payment
 *
 * v0.1 - 2016-12-15
 * @author Zhangpc
 */
'use strict'

const Payment = require('./payment').Payment
const rawBody = require('raw-body')

function getRawBody(request) {
  let body = request.body
  if (body) {
    return new Promise((resolve, reject) => {
      resolve(body)
    })
  }

  const opts = {
    length: request.headers['content-length'],
    encoding: 'utf8'
  }
  // raw-body returns a Promise when no callback is specified
  return rawBody(request, opts).catch(err => {
    err.name = 'BadMessage' + err.name
    throw err
  })
}

/**
 * 中间件处理通知类
 * @class Notify
 * @constructor
 * @param {String} partnerKey
 * @param {String} appId
 * @param {String} mchId
 * @param {String} notifyUrl
 * @param {String} pfx appkey
 * @chainable
 */
class Notify {
  /**
   * Creates an instance of Notify.
   *
   * @param {Object} config
   *
   * @memberOf Notify
   */
  constructor(config) {
    this.payment = new Payment(config)
  }

  done() {
    const _this = this
    return function* (next) {
      if (this.method !== 'POST') {
        let error = new Error()
        error.name = 'NotImplemented'
        return _this.fail.apply(this, [error, _this])
      }
      try {
        const body = yield getRawBody(this.request)
        const message = yield _this.payment.validate(body)
        this.request.wechat_pay_notify_message = message
        this.reply = data => {
          if (data instanceof Error) {
            _this.fail.apply(this, [data, _this])
          } else {
            _this.success.apply(this, [data, _this])
          }
        }
        yield next
      } catch (err) {
        _this.fail.apply(this, [err, _this])
      }
    }
  }

  fail(error, _this) {
    this.body = _this.payment.buildXml({
      return_code: 'FAIL',
      return_msg: error.name
    })
  }

  success(result, _this) {
    this.body = _this.payment.buildXml({
      return_code: 'SUCCESS'
    })
  }
}

const middleware = config => {
  return {
    getNotify: () => new Notify(config)
  }
}

middleware.Notify = Notify

module.exports = middleware