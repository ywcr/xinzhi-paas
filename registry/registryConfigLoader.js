/*
* Licensed Materials - Property of paas.enncloud.cn
* (C) Copyright 2017 TenxCloud. All Rights Reserved.
*/

/*
 * Load registry configuration from API
 * Load configuration at the server startup or at first call, and will cache the config to avoid API call each time
 * v0.1 - 2017-01-07
 * @author Wang Lei
*/
'use strict'
const logger  = require('../utils/logger').getLogger('registryConfigLoader');
const apiFactory = require('../services/api_factory')

var registryLocalStorage = 'INIT_STATE'

// Get registry configuration from api service
function GetRegistryConfig() {
  if (registryLocalStorage && registryLocalStorage != 'INIT_STATE') {
    return registryLocalStorage
  }
  registryLocalStorage = global.globalConfig.registryConfig
  if (global.globalConfig.registryConfig.url) {
    registryLocalStorage.globalConfigured = true
  }
  return registryLocalStorage
}
exports.GetRegistryConfig = GetRegistryConfig
