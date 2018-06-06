/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 */

'use strict'

const apiFactory = require('../services/api_factory')

exports.getCurrentSetting = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([clusterID, 'networkisolation'])
  this.body = result ? result.data : {}
}

// getCurrentSettingingress
exports.getCurrentSettingingress = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([clusterID, 'networkpolicy/ingress/default'])
  this.body = result ? result.data : {}
  // return this.body
}
// getIngress
exports.getIngress = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([clusterID, 'networkpolicy/ingress'])
  // this.body = result ? result.data : {}
  this.body={
    data:result.data
  }
  // return this.body
}
exports.setIsolationRule = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const rule = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([clusterID, 'networkisolation'], null, rule)
  this.body = result ? result.data : {}
  
}
// setIsolationRuleingress
exports.setIsolationRuleingress = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const rule = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([clusterID, 'networkpolicy/ingress/default'], null, rule)
  // this.body = result ? result.data : {}
  this.body = {
    data:result
  }
}
exports.restoreDefault = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([clusterID, 'networkisolation'])
  this.body = result ? result.data : {}
}
exports.restoreDefaultIngress = function* () {
  const loginUser = this.session.loginUser
  const clusterID = this.params.clusterID
  const name = this.params.name
  // console.log(this.request,'this.request',clusterID,"name",name)
  // const rule = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([clusterID, 'networkpolicy/ingress',name])
  this.body = result ? result.data : {}
  // console.log(this.body,'body-----')
  this.body = {
    data:result.data
  }
}
exports.createTemplateIngress = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.clusters
  const api = apiFactory.getK8sApi(loginUser)
  const template = this.request.body
  if (!template) {
    const err = new Error('Template name/content is required.')
    err.status = 400
    throw err
  }
  const result = yield api.createBy([cluster, 'networkpolicy/ingress'], null,template)
  this.body = {
    data: result
  }
}
exports.networkpolicyIngress = function* () {
  const cluster = this.params.clusters
  // console.log()
  const loginUser = this.session.loginUser
  // {"replicas": 3}
  const body = this.request.body
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.patchBy([cluster, 'networkpolicy/ingress'], null, body);
  this.body = {
    result
  }
}


