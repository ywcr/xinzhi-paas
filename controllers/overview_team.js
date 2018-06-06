/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User manage controller
 *
 * v0.1 - 2016-11-01
 * @author shouhong.zhang
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.getTeamOverview = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = 
      yield [api.overview.getBy(["team-operations"]), 
             api.overview.getBy(["team-detail"]),
             api.overview.getBy(["team-consumption"]),]
  let operations = {}
  if (result && result[0] && result[0].data) {
    operations = result[0].data
  }
  let teamdetail = {}
  if (result && result[1] && result[1].data) {
    teamdetail = result[1].data
  }
  let teamconsumption = {}
  if (result && result[2] && result[2].data) {
    teamconsumption = result[2].data
  }
  this.body = {
    operations,
    teamdetail,
    teamconsumption,
  }
}

exports.getTeamDetail = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["team-detail"])
  const data = result || {}
  this.body = {
    data
  }
}

exports.getTeamOperations = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.overview.getBy(["team-operations"])
  const data = result || {}
  this.body = {
    data
  }
}