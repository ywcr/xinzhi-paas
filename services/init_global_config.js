/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * initGlobalConfig services
 * v0.1 - 2017-03-13
 * @author Yangyubiao
 */

'use strict'

const url = require('url')
const config = require('../configs')
const devops = require('../configs/devops')
const logger = require('../utils/logger').getLogger('initGlobalConfig')

global.globalConfig = {
  mail_server: {
    auth: {}
  },
  registryConfig: {},
  cicdConfig: {
    host: devops.host,
    protocol: devops.protocol,
    external_host: devops.external_host,
    external_protocol: devops.external_protocol,
    statusPath: devops.statusPath,
    logPath: devops.logPath
  },
  tenx_api: {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    external_host: config.tenx_api.external_host,
    external_protocol: config.tenx_api.external_protocol
  },
  storageConfig: []
}

const apiFactory = require('./api_factory.js')

exports.initGlobalConfig = function* () {
  const spi = apiFactory.getTenxSysSignSpi()
  const result = yield spi.configs.get()
  const configs = result.data
  if (!configs) {
    logger.error('未找到可用配置信息')
    return
  }
  let globalConfig = global.globalConfig
  const ConfigArray = {}
  globalConfig.storageConfig = []
  configs.forEach(item => {
    const configType = item.ConfigType
    let configDetail = JSON.parse(item.ConfigDetail)
    if (configType == 'mail' && configDetail.mailServer) {
      let arr = configDetail.mailServer.split(':')
      let port = arr[1]
      let host = arr[0]
      //使用引用类型
      globalConfig.mail_server.secure = configDetail.secure
      globalConfig.mail_server.host = host
      globalConfig.mail_server.port = port || 25
      globalConfig.mail_server.auth.user = configDetail.senderMail
      globalConfig.mail_server.auth.pass = configDetail.senderPassword
      globalConfig.mail_server.service_mail = configDetail.senderMail
      ConfigArray.Mail='NotEmpty'
    }
    if (configType == 'harbor') { // Use harbor from v2.6.0
      /*globalConfig.registryConfig.protocol = configDetail.protocol
      globalConfig.registryConfig.host = configDetail.host
      globalConfig.registryConfig.port = configDetail.port
      globalConfig.registryConfig.v2Server = configDetail.v2Server
      globalConfig.registryConfig.v2AuthServer = configDetail.v2AuthServer
      globalConfig.registryConfig.user = configDetail.user
      globalConfig.registryConfig.password = configDetail.password*/
      globalConfig.registryConfig.url = configDetail.url
      ConfigArray.Registry='NotEmpty'
    }
    // Use db settings if env is empty
    if (configType == 'cicd' && globalConfig.cicdConfig.host == "") {
      let host
      let protocol
      if (devops.host) {
        host = devops.host
        protocol = devops.protocol
      }
      else if (configDetail.url) {
        host = configDetail.url
        const arr = host.split('://')
        protocol = arr[0]
        host = arr[1]
      } else if (configDetail.host) {
        host = configDetail.host
        protocol = configDetail.protocol
      }
      globalConfig.cicdConfig.protocol = protocol //configDetail.protocol
      globalConfig.cicdConfig.host = host //configDetail.host
      globalConfig.cicdConfig.external_protocol = devops.external_protocol
      if (!devops.external_protocol) {
        globalConfig.cicdConfig.external_protocol = protocol
      }
      globalConfig.cicdConfig.external_host = devops.external_host
      if (!devops.external_host) {
        globalConfig.cicdConfig.external_host = host
      }
      globalConfig.cicdConfig.statusPath = devops.statusPath //configDetail.statusPath,
      globalConfig.cicdConfig.logPath = devops.logPath //configDetail.logPath
    }
    if (configType === 'rbd') {
      item.ConfigDetail = configDetail
      globalConfig.storageConfig.push(item)
      ConfigArray.Rbd='NotEmpty'
    }
  })
  if (ConfigArray.Mail!=='NotEmpty'){
      globalConfig.mail_server={
      auth: {}
    }
  }
  if (ConfigArray.Registry!=='NotEmpty'){
      globalConfig.registryConfig={}
  }
  if (ConfigArray.Rbd!=='NotEmpty'){
      globalConfig.storageConfig=[]
  }
  logger.info('api-server config: ', globalConfig.tenx_api.host)
  logger.info('registry config: ', globalConfig.registryConfig.url)
  logger.info('devops config: ', globalConfig.cicdConfig.protocol + '://' + globalConfig.cicdConfig.host)
  logger.info('mailbox config: ', globalConfig.mail_server.host)
}
