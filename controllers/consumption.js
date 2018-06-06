/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App manage controller
 *
 * v0.1 - 2016-12-07
 * @author mengyuan
 */

'use strict'

const apiFactory = require('../services/api_factory')

exports.getDetail = function* () {      
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  let query = {}
  if (this.query.from) {
    query.from = this.query.from
  }
  if (this.query.size) {
    query.size = this.query.size
  }
  if (this.query.timeBegin) {
    query.timeBegin = this.query.timeBegin
  }
  if (this.query.timeEnd) {
    query.timeEnd = this.query.timeEnd
  }
  if (this.query.type && this.query.type != 'all') {
    query.type = this.query.type
  }
  const result = yield api.consumptions.getBy(['detail'], query)
  this.body = {
    data: result.data
  }
}

exports.getTrend = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.consumptions.getBy(['trend'])
  this.body = {
    data: result.data
  }
}

exports.getSummaryInDay = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  let query = {}
  if (this.query.source) {
    query.source = this.query.source
  }
  if (this.query.month) {
    query.month = this.query.month
  }
  const result = yield api.consumptions.getBy(['summary'], query)
  this.body = {
    data: result.data
  }
}
// Leave payment history here, as enterprise version also requires it
exports.getChargeRecord = function* () {
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  let query = {}
  if (this.query.from) {
    query.from = this.query.from
  }
  if (this.query.size) {
    query.size = this.query.size
  }
  const result = yield spi.payments.getBy(['history'], query)
  this.body = {
    data: result.data
  }
}

exports.getNotifyRule = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.consumptions.getBy(['notify-rule'])
  this.body = {
    data: result.data
  }
}

exports.setNotifyRule = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.consumptions.updateBy(['notify-rule'], null, this.request.body)
  this.body = {
    data: result.data
  }
}