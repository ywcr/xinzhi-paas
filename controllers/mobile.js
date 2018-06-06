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

