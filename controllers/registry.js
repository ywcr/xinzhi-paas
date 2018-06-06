/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Registry controller
 *
 * v0.1 - 2016-10-08
 * @author Zhangpc
 * @author Lei 3rdparty docker registry integration
 */
'use strict'

const apiFactory           = require('../services/api_factory')
const registryService      = require('../services/tenx_registry')
const SpecRegistryService  = require('../services/docker_registry')
const registryConfigLoader = require('../registry/registryConfigLoader')

const securityUtil        = require('../utils/security')
const logger              = require('../utils/logger.js').getLogger("registry")
const crypto              = require('crypto')
const algorithm           = 'aes-256-ctr'

exports.getImages = function* () {
  const registry = this.params.registry
  const loginUser = this.session.loginUser
  const query = this.query || {}
  var q = query.q || ""
  const registryUser = loginUser.teamspace || loginUser.user
  var validConfig = yield _getValidTenxCloudHub(loginUser)

  const result = yield registryService.getImages(registryUser, q)
  this.body = {
    server: validConfig ? validConfig.v2Server : registryService.getOfficialTenxCloudHub().v2Server,
    data: result
  }
}

exports.getPrivateImages = function* () {
  const loginUser = this.session.loginUser
  let result
  const registryUser = loginUser.teamspace || loginUser.user
  var validConfig = yield _getValidTenxCloudHub(loginUser)
  if (!validConfig || !validConfig.host) {
    this.body = {}
    return
  }
  result = yield registryService.getPrivateRepositories(registryUser, 1)

  this.body = {
    server: validConfig.v2Server,
    data: result
  }
}

exports.getFavouriteImages = function* () {
  const loginUser = this.session.loginUser
  const registryUser = loginUser.teamspace || loginUser.user
  var validConfig = yield _getValidTenxCloudHub(loginUser)
  if (!validConfig || !validConfig.host) {
    this.body = {}
    return
  }
  const result = yield registryService.getFavouriteRepositories(registryUser, 1)

  this.body = {
    server: validConfig.v2Server,
    data: result
  }
}

// content-type of body must be application/json
exports.updateImageInfo = function* () {
  const loginUser = this.session.loginUser
  var properties = this.request.body
  var imageObj = {}
  imageObj.name = this.params.image
  Object.keys(properties).forEach(function(key) {
    imageObj[key] = properties[key]
  })
  const registryUser = loginUser.teamspace || loginUser.user
  var validConfig = yield _getValidTenxCloudHub(loginUser)
  if (!validConfig || !validConfig.host) {
    this.body = {}
    return
  }
  const result = yield registryService.updateImageInfo(registryUser, imageObj)

  this.body = {
    data: result
  }
}

exports.getImageTags = function* () {
  const loginUser = this.session.loginUser
  const registry = this.params.registry
  const imageFullName = this.params.user + '/' + this.params.name
  const registryUser = loginUser.teamspace || loginUser.user
  var validConfig = yield _getValidTenxCloudHub(loginUser)

  const result = yield registryService.getImageTags(registryUser, imageFullName)
  this.body = {
    server: validConfig ? validConfig.v2Server : registryService.getOfficialTenxCloudHub().v2Server,
    name: imageFullName,
    data: result
  }
}

exports.getImageConfigs = function* () {
  const loginUser = this.session.loginUser
  const registry = this.params.registry
  const imageFullName = this.params.user + '/' + this.params.name
  const tag = this.params.tag
  const registryUser = loginUser.teamspace || loginUser.user
  var validConfig = yield _getValidTenxCloudHub(loginUser)

  const result = yield registryService.getImageConfigs(registryUser, imageFullName, tag)
  this.body = {
    server: validConfig ? validConfig.v2Server : registryService.getOfficialTenxCloudHub().v2Server,
    name: imageFullName,
    tag,
    data: result
  }
}

exports.getImageInfo = function* () {
  const loginUser = this.session.loginUser
  const registry = this.params.registry
  const imageFullName = this.params.user + '/' + this.params.name
  const tag = this.params.tag
  const registryUser = loginUser.teamspace || loginUser.user
  var validConfig = yield _getValidTenxCloudHub(loginUser)

  const result = yield registryService.getImageInfo(registryUser, imageFullName)
  this.body = {
    server: validConfig ? validConfig.v2Server : registryService.getOfficialTenxCloudHub().v2Server,
    name: imageFullName,
    data: result
  }
}

exports.checkImage = function* () {
  const registry = this.params.registry
  const imageFullName = this.params.user + '/' + this.params.name
  const tag = this.params.tag
  const loginUser = this.session.loginUser
  let owner = loginUser.user
  const registryUser = loginUser.teamspace || loginUser.user
  var validConfig = yield _getValidTenxCloudHub(loginUser)

  const result = yield registryService.getImageInfo(registryUser, imageFullName, true)
  this.body = {
    server: validConfig.v2Server,
    name: imageFullName,
    data: result
  }
}

exports.deleteImage = function* () {
  const loginUser = this.session.loginUser
  const registry = this.params.registry
  const image = this.params.image
  const registryUser = loginUser.teamspace || loginUser.user
  var validConfig = yield _getValidTenxCloudHub(loginUser)
  if (!validConfig || !validConfig.host) {
    this.body = {}
    return
  }
  const result = yield registryService.deleteImage(registryUser, image)
  this.body = {
    server: validConfig.v2Server,
    message: result
  }
}

exports.queryServerStats = function* () {
  const loginUser = this.session.loginUser
  const registry = this.params.registry
  const registryUser = loginUser.teamspace || loginUser.user
  var validConfig = yield _getValidTenxCloudHub(loginUser)
  if (!validConfig || !validConfig.host) {
    this.body = {}
    return
  }
  const result = yield registryService.queryRegistryStats(registryUser)
  this.body = {
    server: validConfig.v2Server,
    data: result
  }
}
/*
Methods below only for tenxcloud hub integration
*/
exports.addTenxCloudHub = function* () {
  const loginUser = this.session.loginUser
  const name = this.params.name
  const reqData = this.request.body
  const api = apiFactory.getApi(loginUser)
  // Encrypt the password before save to database
  if (reqData.username && reqData.password) {
    reqData.encrypted_password = securityUtil.encryptContent(reqData.password, loginUser.token, algorithm)
  }
  const result = yield api.tenxhubs.createBy(null, null, reqData)

  this.status = result.code
  this.body = result
}

exports.removeTenxCloudHub = function* () {
  const loginUser = this.session.loginUser
  const name = this.params.name
  const reqData = this.request.body
  const api = apiFactory.getApi(loginUser)
  const result = yield api.tenxhubs.delete()
  // Clear the cache
  registryService.getTenxHubConfig()[loginUser.user] = null

  this.status = result.code
  this.body = result
}

exports.isTenxCloudHubConfigured = function* () {
  const loginUser = this.session.loginUser
  const tenxhubConfig = yield _getValidTenxCloudHub(loginUser)
  if (tenxhubConfig && tenxhubConfig.host) {
    this.status = 200
    let globalConfigured = tenxhubConfig.globalConfigured || false
    this.body = {
      configured: true,
      global: globalConfigured
    }
    return
  }
  this.status = 200
  this.body = {
    configured: false
  }
}

function* _getValidTenxCloudHub(loginUser) {
  // Global check
  if (registryConfigLoader.GetRegistryConfig() && registryConfigLoader.GetRegistryConfig().host) {
    return registryConfigLoader.GetRegistryConfig()
  } else {
    // User preference check
    if (registryService.getTenxHubConfig()[loginUser.user] && registryService.getTenxHubConfig()[loginUser.user].host) {
      return registryService.getTenxHubConfig()[loginUser.user]
    }
    const api = apiFactory.getApi(loginUser)
    const result = yield api.tenxhubs.get()
    if (result.data && result.data.host) {
      logger.info("Getting user registry for " + loginUser.user + ": " + result.data.host)
      let realPassword = securityUtil.decryptContent(result.data.password, loginUser.token, algorithm)
      result.data.password = realPassword
      registryService.getTenxHubConfig()[loginUser.user] = result.data
      return registryService.getTenxHubConfig()[loginUser.user]
    }
  }
  return null
}
/*
Methods below only for thirdparty(custom) docker registry integration
*/
// Add custom docker registry to the database repository
exports.addPrivateRegistry = function* () {
  const loginUser = this.session.loginUser
  const name = this.params.name
  const reqData = this.request.body
  const api = apiFactory.getManagedRegistryApi(loginUser)
  // Encrypt the password before save to database
  if (reqData.username && reqData.password) {
    reqData.encrypted_password = securityUtil.encryptContent(reqData.password, loginUser.token, algorithm)
  }
  const result = yield api.createBy([name], null, reqData)

  this.status = result.code
  this.body = result
}
// Remove custom docker registry from database repository
exports.deletePrivateRegistry = function* () {
  const loginUser = this.session.loginUser
  const id = this.params.id

  const api = apiFactory.getManagedRegistryApi(loginUser)
  const result = yield api.delete(id)

  this.status = result.code
  this.body = result
}
// List custom docker registries
exports.getPrivateRegistries = function* () {
  const loginUser = this.session.loginUser

  const api = apiFactory.getManagedRegistryApi(loginUser)
  // Get the list of private docker registry
  const result = yield api.get()

  this.status = result.code
  this.body = {
    data: result.data
  }
}
// List repositories of custom docker registry
exports.specListRepositories = function* () {
  const loginUser = this.session.loginUser
  const registryId = this.params.id

  let serverInfo = yield _getRegistryServerInfo(this.session, loginUser, registryId)

  // If find the valid registry info
  if (serverInfo.server) {
    logger.info("Found the matched registry config ...")
    // Get the real password before pass to registry service
    let realPassword = securityUtil.decryptContent(serverInfo.password, loginUser.token, algorithm)
    let registryConfig = JSON.parse(JSON.stringify(serverInfo))
    registryConfig.password = realPassword

    let specRegistryService = new SpecRegistryService(registryConfig)
    var self = this
    var result = yield specRegistryService.getCatalog()

    this.status = result.code
    this.body = result.result
  } else {
    logger.info("No matched registry config found ...")
    this.status = 404
    this.body = "Docker Registry not found"
  }
}
// Get the tags of specified image
exports.specGetImageTags = function* () {
  const loginUser = this.session.loginUser
  const registryId = this.params.id
  const image = this.params.image

  let serverInfo = yield _getRegistryServerInfo(this.session, loginUser, registryId)

  // If find the valid registry info
  if (serverInfo.server) {
    logger.info("Found the matched registry config ...")
    // Get the real password before pass to registry service
    let realPassword = securityUtil.decryptContent(serverInfo.password, loginUser.token, algorithm)
    let registryConfig = JSON.parse(JSON.stringify(serverInfo))
    registryConfig.password = realPassword

    let specRegistryService = new SpecRegistryService(registryConfig)
    var self = this
    var result = yield specRegistryService.getImageTags(image)

    this.status = result.code
    this.body = result.result
  } else {
    logger.info("No matched registry config found ...")
    this.status = 404
    this.body = "Docker Registry not found"
  }
}
// Get the config info of specified image and tag
exports.specGetImageTagInfo = function* () {
  const loginUser = this.session.loginUser
  const registryId = this.params.id
  const image = this.params.image
  const tag = this.params.tag

  let serverInfo = yield _getRegistryServerInfo(this.session, loginUser, registryId)

  // If find the valid registry info
  if (serverInfo.server) {
    logger.info("Found the matched registry config ...")
    // Get the real password before pass to registry service
    let realPassword = securityUtil.decryptContent(serverInfo.password, loginUser.token, algorithm)
    let registryConfig = JSON.parse(JSON.stringify(serverInfo))
    registryConfig.password = realPassword

    let specRegistryService = new SpecRegistryService(registryConfig)
    var self = this
    var result = yield specRegistryService.getImageTagInfo(image, tag)

    this.status = result.code
    this.body = result.result
  } else {
    logger.info("No matched registry config found ...")
    this.status = 404
    this.body = "Docker Registry not found"
  }
}

exports.specGetImageTagSize = function* () {
  const loginUser = this.session.loginUser
  const registryId = this.params.id
  const image = this.params.image
  const tag = this.params.tag

  let serverInfo = yield _getRegistryServerInfo(this.session, loginUser, registryId)

  // If find the valid registry info
  if (serverInfo.server) {
    logger.info("Found the matched registry config ...")
    // Get the real password before pass to registry service
    let realPassword = securityUtil.decryptContent(serverInfo.password, loginUser.token, algorithm)
    let registryConfig = JSON.parse(JSON.stringify(serverInfo))
    registryConfig.password = realPassword

    let specRegistryService = new SpecRegistryService(registryConfig)
    var self = this
    var result = yield specRegistryService.getImageTagSize(image, tag)

    this.status = result.code
    this.body = result.result
  } else {
    logger.info("No matched registry config found ...")
    this.status = 404
    this.body = "Docker Registry not found"
  }
}

// Get registry server information
function* _getRegistryServerInfo(session, user, id){
  var serverInfo = {}
  // Try to get from session first
  if (session.registries && session.registries[id]) {
    serverInfo = {
      "server":     session.registries[id].server,
      "authServer": session.registries[id].authServer,
      "username":   session.registries[id].username,
      "password":   session.registries[id].password
    }
  } else {
    // Get from API server and save to session
    if (!session.registries) {
      session.registries = {}
    }
    const api = apiFactory.getManagedRegistryApi(user)
    // Get the list of private docker registry
    const result = yield api.get()
    if (result.code === 200) {
      for (var i in result.data) {
        if (result.data[i].id === id) {
          // Add registry info to session
          session.registries[id] = {
            "server":     result.data[i].url,
            "authServer": result.data[i].auth_url,
            "username":   result.data[i].username,
            "password":   result.data[i].encrypted_password
          }
          serverInfo = session.registries[id]
          break
        }
      }
    }
  }
  return serverInfo
}
