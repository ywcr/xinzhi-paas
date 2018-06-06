/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Integration controller
 *
 * v0.1 - 2016-11-24
 * @author GaoJian
 */
'use strict'
const Service = require('../kubernetes/objects/service')
const apiFactory = require('../services/api_factory')

exports.getAllIntegrations = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.integrations.getBy(['']);
  this.body = {
    result,
  }
}

exports.createIntegrations = function* () {
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.integrations.createBy(['vsphere'], null, body);
  this.body = {
    result,
  }
}

exports.getIntegrationConfig = function* () {
  const id = this.params.id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.integrations.getBy(['vsphere', id]);
  this.body = {
    result,
  }
}

exports.updateIntegrationConfig = function* () {
  const id = this.params.id
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.integrations.updateBy(['vsphere', id], null, body);
  this.body = {
    result,
  }
}

exports.deleteIntegrations = function* () {
  const id = this.params.id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.integrations.deleteBy([id]);
  this.body = {
    result,
  }
}

exports.getIntegrationDateCenter = function* () {
  const id = this.params.id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.integrations.getBy(['vsphere', id, 'datacenters']);
  this.body = {
    result,
  }
}

exports.getIntegrationVmList = function* () {
  const id = this.params.id
  const dcPath = this.query.dcPath
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.integrations.getBy(['vsphere', id, 'vm'], {'dc': dcPath});
  this.body = {
    result,
  }
}

exports.manageIntegrationsVmDetail = function* () {
  const id = this.params.id
  const dcPath = this.query.dcPath
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.integrations.createBy(['vsphere', id, 'vm', 'administration'], {'dc': dcPath}, body);
  this.body = {
    result,
  }
}

exports.getCreateVmConfig = function* () {
  const id = this.params.id
  const dcPath = this.query.dcPath
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.integrations.getBy(['vsphere', id, 'vm', 'clone'], {'dc': dcPath});
  this.body = {
    result,
  }
}

exports.createIntegrationVm = function* () {
  const id = this.params.id
  const dcPath = this.query.dcPath
  const body = this.request.body
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.integrations.createBy(['vsphere', id, 'vm', 'clone'], {'dc': dcPath}, body);
  this.body = {
    result,
  }
}

exports.getIntegrationPods = function* () {
  const id = this.params.id
  const dcPath = this.query.dcPath
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.integrations.getBy(['vsphere', id, 'hostsystem'], {'dc': dcPath});
  this.body = {
    result,
  }
}
