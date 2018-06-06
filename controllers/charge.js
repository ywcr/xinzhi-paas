/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Charge controller
 *
 * v0.1 - 2017-02-27
 * @author shouhong.zhang
 */
'use strict'

const apiFactory = require('../services/api_factory')

exports.chargeUser = function* () {
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const chargeInfo = this.request.body
  if (!chargeInfo || !chargeInfo.namespaces || !chargeInfo.amount) {
    const err = new Error('namespaces and amount are required.')
    err.status = 400
    throw err
  }
  const result = yield spi.payments.createBy(['user'], null, chargeInfo)
  this.body = result
}

exports.chargeTeamspace = function* () {
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const chargeInfo = this.request.body
  if (!chargeInfo || !chargeInfo.namespaces || !chargeInfo.amount) {
    const err = new Error('namespaces and amount are required.')
    err.status = 400
    throw err
  }
  const result = yield spi.payments.createBy(['teamspace'], null, chargeInfo)
  this.body = result
}