/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Setting manage controller
 *
 * v0.1 - 2017-03-09
 * @author Yangyubiao
 */

'use strict'

const apiFactory = require('../services/api_factory.js')
const url = require('url')
const config = require('../configs')
const devOps = require('../configs/devops')
const constant = require('../constants')
const initGlobalConfig = require('../services/init_global_config')
const email = require('../utils/email')

exports.changeGlobalConfig = function* () {
  if(this.session.loginUser.role != constant.ADMIN_ROLE) {
    const err = new Error('Not admin user')
    err.status = 400
    throw err
  }
  const cluster = this.params.cluster
  const type = this.params.type
  const entity = this.request.body
  // entity.configDetail = JSON.stringify(entity.detail)
  if (type == 'cicd') {
    this.body = yield cicdConfigFunc.apply(this, [entity])
  }
  if (type == 'harbor') {
    this.body = yield harborConfigFunc.apply(this, [entity])
  }
  if (type == 'mail') {
    this.body = yield mailConfigFunc.apply(this, [entity])
  }
  if (type == 'rbd') {
    this.body = yield storageConfigFunc.apply(this, [entity])
  }
  yield initGlobalConfig.initGlobalConfig()
}

function* cicdConfigFunc(entity) {
  const api = apiFactory.getApi(this.session.loginUser)
  let body = {}
  let cicdEntity = {
    configID: entity.cicdID,
    configDetail: {
      external_protocol: entity.cicdDetail.protocol,
      external_host: entity.cicdDetail.url,
      statusPath: devOps.statusPath,
      logPath: devOps.logPath,
      host: devOps.host,
      protocol: devOps.protocol
    }
  }
  let apiHost = entity.apiServerDetail.url
  let urlObject = url.parse(apiHost)
  apiHost = urlObject.hostname
  let protocol = urlObject.protocol.replace(':', '')
  let apiServerEntity = {
    configID: entity.apiServerID,
    configDetail: {
      protocol: config.tenx_api.protocol,
      host: config.tenx_api.host,
      external_protocol: protocol,
      external_host: apiHost
    }
  }
  if (entity.cicdID) {
    const config = global.globalConfig.cicdConfig
    cicdEntity.configDetail.statusPath = config.statusPath
    cicdEntity.configDetail.logPath = config.logPath
    cicdEntity.configDetail.host = config.host
    cicdEntity.configDetail.protocol = config.protocol
    cicdEntity.configDetail = JSON.stringify(cicdEntity.configDetail)
    body.cicd = yield api.configs.updateBy(['cicd'], null, cicdEntity)
  } else {
    cicdEntity.configDetail = JSON.stringify(cicdEntity.configDetail)
    body.cicd = yield api.configs.createBy(['cicd'], null, cicdEntity)
  }
  if (entity.apiServerID) {
    const config = global.globalConfig.tenx_api
    apiServerEntity.configDetail.protocol = config.protocol
    apiServerEntity.configDetail.host = config.host
    apiServerEntity.configDetail = JSON.stringify(apiServerEntity.configDetail)
    body.apiServer = yield api.configs.updateBy(['apiServer'], null, apiServerEntity)
  } else {
    apiServerEntity.configDetail = JSON.stringify(apiServerEntity.configDetail)
    body.apiServer = yield api.configs.createBy(['apiServer'], null, apiServerEntity)
  }
  return body
}


function* harborConfigFunc(entity) {
  const api = apiFactory.getApi(this.session.loginUser)
  const type = 'harbor'
  entity.configDetail = {
    url: entity.detail.url
  }
  let response
  if (entity.configID) {
    entity.configDetail = JSON.stringify(entity.configDetail)
    response = yield api.configs.updateBy([type], null, entity)
  } else {
    entity.configDetail = JSON.stringify(entity.configDetail)
    response = yield api.configs.createBy([type], null, entity)
  }
  return response
}

function* mailConfigFunc(entity) {
  const api = apiFactory.getApi(this.session.loginUser)
  const type = 'mail'
  entity.configDetail = {
    secure: entity.detail.secure,
    senderMail: entity.detail.senderMail,
    senderPassword: entity.detail.senderPassword,
    mailServer: entity.detail.mailServer,
    service_mail: entity.detail.mailServer,
  }
  let response
  if (entity.configID) {
    // const config = global.globalConfig.mail_server
    // entity.configDetail.secure = config.secure
    entity.configDetail = JSON.stringify(entity.configDetail)
    response = yield api.configs.updateBy([type], null, entity)
  } else {
    entity.configDetail = JSON.stringify(entity.configDetail)
    response = yield api.configs.createBy([type], null, entity)
  }
  return response
}

function* storageConfigFunc(entity) {
  const api = apiFactory.getApi(this.session.loginUser)
  const type = 'rbd'
  entity.configDetail = {
    name: config.storageConfig.name,
    url: entity.detail.url,
    config: {
      monitors: entity.detail.config.monitors,
      pool: config.storageConfig.pool,
      user: config.storageConfig.user,
      keyring: config.storageConfig.keyring,
      fsType: config.storageConfig.fsType
    },
    agent:config.storageConfig.agent
  }
  let response
  if (entity.configID) {
    let config = {}
    global.globalConfig.storageConfig.some(item => {
      if (item.ConfigID == entity.configID) {
        config = item
        return true
      }
    })
    config = config.ConfigDetail
    entity.configDetail.name = config.name
    entity.configDetail.config = config.config
    entity.configDetail.config.monitors = entity.detail.config.monitors
    entity.configDetail.agent = config.agent
    entity.configDetail = JSON.stringify(entity.configDetail)
    config.url =  entity.detail.url
    config.config.monitors = entity.detail.config.monitors
    response = yield api.configs.updateBy([type], null, entity)
  } else {
    entity.configDetail = JSON.stringify(entity.configDetail)
    response = yield api.configs.createBy([type], null, entity)
  }
  return response
}

exports.getGlobalConfig = function* () {
  if (this.session.loginUser.role != constant.ADMIN_ROLE) {
    const err = new Error('Not admin user')
    err.status = 400
    throw err
  }
  const cluster = this.params.cluster
  const spi = apiFactory.getTenxSysSignSpi()
  const response = yield spi.configs.get()
  let cicdConfigFound = false
  let apiConfigFound = false
  if (response && response.data) {
    response.data.forEach(function(item) {
      if (item.ConfigType === 'cicd') {
        cicdConfigFound = true
      } else if (item.ConfigType === 'apiServer') {
        apiConfigFound = true
      }
    })
  }
  // If any config missing, will use the one from global config
  let globalConfig = global.globalConfig
  if (!cicdConfigFound) {
    response.data.push({
      "ConfigType": "cicd",
      "ConfigDetail": JSON.stringify(globalConfig.cicdConfig),
    })
  }
  if (!apiConfigFound) {
    response.data.push({
      "ConfigType": "apiServer",
      "ConfigDetail": JSON.stringify(globalConfig.tenx_api),
    })
  }
  this.status = response.code
  this.body = response
}

exports.isValidConfig = function* () {
  if (this.session.loginUser.role != constant.ADMIN_ROLE) {
    const err = new Error('Not admin user')
    err.status = 400
    throw err
  }
  const type = this.params.type
  const entity = this.request.body
  let response = {}
  if(type == 'rbd') {
    response = yield isValidStorageConfig.apply(this, [entity])
  }
  else if(type == 'harbor') {
    response = yield isValidHarborConfig.apply(this, [entity])
  }
  this.body = response
  return
}

function* isValidStorageConfig (entity) {
  const storageConfig = {
    name: config.storageConfig.name,
    url: entity.url,
    config: {
      monitors: entity.config.monitors,
      pool: config.storageConfig.pool,
      user: config.storageConfig.user,
      keyring: config.storageConfig.keyring,
      fsType: config.storageConfig.fsType
    },
    agent:config.storageConfig.agent
  }
  const api = apiFactory.getApi(this.session.loginUser)
  const response = yield api.configs.createBy(['rbd', 'isvalidconfig'], null, storageConfig)
  return response
}

function* isValidHarborConfig(entity) {
  const api = apiFactory.getApi(this.session.loginUser)
  const harborConfig = {
    url: entity.url
  }
  const response = yield api.configs.createBy(['registry', 'isvalidconfig'], null, harborConfig)
  return response
}

exports.sendVerification = function* () {
	const method = 'configs.email.sendVerification'
	const loginUser = this.session.loginUser
    const Body = this.request.body
	yield email.sendGlobalConfigVerificationEmail(Body,loginUser.user, loginUser.email)
	this.body = {}
}