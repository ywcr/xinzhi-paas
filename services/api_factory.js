/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * API factory
 *
 * v0.1 - 2016-09-13
 * @author Zhangpc
 */
'use strict'
const tenxApi = require('../tenx_api/v2')
const config = require('../configs')
config.tenx_api = global.globalConfig.tenx_api 
const devopsConfig = global.globalConfig.cicdConfig
const imageScanConfig = require('../configs/image_scan')
const registriyApi = require('../registry')
// getmobile
exports.getmobile = function (phone,value) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.hostphone+'&mobile='+phone+'&content='+value
  }
  // const api = new tenxApi(apiConfig)
  return 'ok'
}
exports.getApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api
}

exports.getK8sApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.clusters
}

/*
API factory to handle thirdparty docker registry integration
*/
exports.getManagedRegistryApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.registries
}

/*
API factory to handle application templates
*/
exports.getTemplateApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.templates
}

/*
API factory to handle DevOps service
*/
exports.getDevOpsApi = function (loginUser) {
  const apiConfig = {
    protocol: devopsConfig.protocol,
    host: devopsConfig.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.devops
}

exports.getRegistryApi = function (registryConfig) {
  const api = new tenxApi(registryConfig)
  return api.registries
}

exports.getSpi = function (loginUser, specifyConfig) {
  let _config = specifyConfig || config.tenx_api
  const spiConfig = {
    protocol: _config.protocol,
    host: _config.host,
    api_prefix: 'spi',
    auth: loginUser
  }
  const spi = new tenxApi(spiConfig)
  return spi
}

// Spi with tenxSysSign in header for payment etc.
exports.getTenxSysSignSpi = function (loginUser) {
  if (!loginUser) loginUser = {}
  const config = require('../configs')
  config.tenx_api = global.globalConfig.tenx_api
  const tenxSysSign = config.tenxSysSign
  loginUser[tenxSysSign.key] = tenxSysSign.value
  const spiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    api_prefix: 'spi',
    auth: loginUser
  }
  const spi = new tenxApi(spiConfig)
  return spi
}

exports.getImageScanApi = function(loginUser) {
  const apiConfig = {
    protocol: imageScanConfig.protocol,
    host: imageScanConfig.host,
    port: imageScanConfig.port,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.images
}

exports.getRegistryApi = function() {
  const api = new registriyApi()
  return api
}

exports.getLabelsApi = function(loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.labels
}

exports.getOemInfoApi = function (loginUser) {
  const apiConfig = {
    protocol: config.tenx_api.protocol,
    host: config.tenx_api.host,
    auth: loginUser
  }
  const api = new tenxApi(apiConfig)
  return api.oem
}

