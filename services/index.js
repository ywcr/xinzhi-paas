/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Index services for app
 * v0.1 - 2016-11-17
 * @author Zhangpc
 */
'use strict'

const crypto = require('crypto')
const i18n = require('i18next')
const _ = require('lodash')
const apiFactory = require('./api_factory')
const logger = require('../utils/logger').getLogger('services/index')
const constants = require('../constants')
const config = require('../configs')
config.tenx_api = global.globalConfig.tenx_api
config.mail_server = global.globalConfig.mail_server
const devOps = global.globalConfig.cicdConfig
const constantsConfig = require('../configs/constants')
const useragent = require('useragent')
const USER_CURRENT_CONFIG = constants.USER_CURRENT_CONFIG

exports.setUserCurrentConfigCookie = function* (loginUser) {
  const method = 'setUserCurrentConfigCookie'
  // Get default clusters
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.clusters.getBy(['default'])
  const clusters = result.clusters || []
  let clusterID
  if (clusters.length < 1) {
    clusterID = 'default'
  } else {
    clusters.every((cluster => {
      if (cluster.isOk) {
        clusterID = cluster.clusterID
        return false
      }
      return true
    }))
    if (!clusterID) {
      clusterID = clusters[0].clusterID
    }
  }
  const config = `default,default,${clusterID}`
  logger.info(method, `set current config cookie to: ${config}`)
  this.cookies.set(USER_CURRENT_CONFIG, config, {
    httpOnly: false
  })
}

/**
 * Return acceptable type
 *
 * @returns {String}
 */
exports.accepts = function () {
  const _JSON = 'json'
  const HTML = 'html'
  const TEXT = 'text'
  switch (this.accepts(_JSON, HTML, TEXT)) {
    case HTML:
      return HTML
    default:
      const agent = useragent.parse(this.headers['user-agent'])
      // Compatible with IE9-
      if (agent.family === 'IE' && agent.major < 9) {
        return HTML
      }
      return _JSON
  }
}

/**
 * Check clusters for admin
 *
 * @returns {Bool}
 */
exports.isNoCluster = function* () {
  const loginUser = this.session.loginUser
  const k8sApi = apiFactory.getK8sApi(loginUser)
  let clusterList = yield k8sApi.get()
  let clusters = clusterList.clusters || []
  if (clusters.length < 1) {
    return true
  }
  return false
}

/**
 * Add config into user for frontend
 *
 * @param {Object} user
 * @returns {Object}
 */
exports.addConfigsForFrontend = function (user, loginUser) {
  const NODE_ENV = config.node_env
  const NODE_ENV_PROD = constantsConfig.NODE_ENV_PROD
  // Add api config
  const tenxApi = config.tenx_api
  user.tenxApi = {
    protocol: (NODE_ENV === NODE_ENV_PROD ? tenxApi.external_protocol : tenxApi.protocol),
    host: (NODE_ENV === NODE_ENV_PROD ? tenxApi.external_host : tenxApi.host),
  }
  // Add devOps config
  const cicdConfig = _.cloneDeep(devOps)
  if (NODE_ENV === NODE_ENV_PROD) {
    cicdConfig.protocol = cicdConfig.external_protocol
    cicdConfig.host = cicdConfig.external_host
  }
  delete cicdConfig.external_protocol
  delete cicdConfig.external_host
  user.cicdApi = cicdConfig
  // Add if email configured
  const emailConfig = global.globalConfig.mail_server
  user.emailConfiged = !!emailConfig.host
  // Add proxy type
  user.proxy_type = constants.PROXY_TYPE
  // Add registry config
  user.registryConfig = {
    server: global.globalConfig.registryConfig.url
  }
  // Add oem info
  user.oemInfo = global.globalConfig.oemInfo
  // Add harbor info
  if (loginUser) {
    user.harbor = loginUser.harbor || {}
  }
  return user
}

exports.checkWechatAccountIsExist = function* (body) {
  const api = apiFactory.getApi()
  try {
    let result = yield api.users.createBy(['login'], null, body)
    return {
      result,
      exist: true
    }
  } catch (error) {
    return {
      error,
      exist: false
    }
  }
}