/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Version controller
 *
 * v0.1 - 2017-02-22
 * @author Zhangpc
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.checkVersion = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  const specifyConfig = {
    protocol: 'https',
    host: 'api.tenxcloud.com',
    
  }
  const spi = apiFactory.getSpi(loginUser, specifyConfig)
  try {
    const result = yield spi.versions.get(query)
    this.body = {
      query,
      data: result.data
    }
  } catch (error) {
    let statusCode = error.statusCode
    if (statusCode >= 500) {
      this.status = 504
      this.body = {
        statusCode: 504,
        message: 'Gateway Timeout'
      }
      return
    }
    throw error
  }
}