/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/* LDAP controller
 *
 * v0.1 - 2017-05-20
 * @author Zhangpc
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getLdap = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.configs.getBy(['ldap'])
  this.body = {
    data: result.data
  }
}

exports.upsertLdap = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body
  const ldap = yield api.configs.getBy(['ldap'])
  const isvalidconfig = yield api.configs.createBy(['ldap', 'isvalidconfig'], null, JSON.parse(body.configDetail))
  let result
  const configID = ldap.data.configID
  if (configID) {
    // update ldap
    body.configID = configID
    result = yield api.configs.updateBy(['ldap'], null, body)
  } else {
    // insert ldap
    result = yield api.configs.createBy(['ldap'], null, body)
  }
  this.body = result
}

exports.syncLdap = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api['user-directory'].createBy(['ldap'])
  this.body = {
    data: result.data
  }
}

exports.removeLdap = function* () {
  const loginUser = this.session.loginUser
  const query = this.query
  const api = apiFactory.getApi(loginUser)
  const result = yield api['user-directory'].deleteBy(['ldap'], query)
  this.body = {
    data: result.data
  }
}