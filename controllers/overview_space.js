/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User manage controller
 *
 * v0.1 - 2016-11-21
 * @author shouhong.zhang
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getSpaceOverview = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = 
      yield [api.overview.getBy(["space-operations"]), 
             api.overview.getBy(["templates"]),
             api.overview.getBy(["warnings"])]
  let operations = {}
  if (result && result[0] && result[0].data) {
    operations = result[0].data
  }
  let templates = {}
  if (result && result[1] && result[1].data) {
    templates = result[1].data
  }
  let warnings = {}
  if (result && result[2] && result[2].data) {
    warnings = result[2].data
  }
  this.body = {
    operations,
    templates,
    warnings,
  }
}

exports.getSpaceOperations = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["space-operations"])
  const data = result || {}
  this.body = {
    data
  }
}

exports.getSpaceTemplateStats = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["templates"])
  const data = result || {}
  this.body = {
    data
  }
}

exports.getSpaceWarnings = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["warnings"])
  const data = result || {}
  this.body = {
    data
  }
}