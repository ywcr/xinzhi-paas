/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for admin
 *
 * v0.1 - 2017-02-13
 * @author shouhong.zhang
 */

'use strict'
const apiFactory = require('../services/api_factory')

// check whether the 'admin' user's password was set
exports.isPasswordSet = function* () {
  const api = apiFactory.getApi()
  const result = yield api.admin.getBy(["ispwset"])
  this.body = result
}

// set the 'admin' user's password
exports.SetPassword = function* () {
  const api = apiFactory.getApi()
  const passinfo = this.request.body
  if (!passinfo || !passinfo.password) {
    const err = new Error('password field is required.')
    err.status = 400
    throw err
  }
  const result = yield api.admin.patch("setpw", passinfo)
  this.body = result
}