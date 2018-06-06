/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Utilities functions for k8s
 * v0.1 - 2016-10-28
 * @author Zhangpc
 */
'use strict'

const constants = require('../constants')
const clone = require('lodash/cloneDeep')
const DEFAULT_CONTAINER_RESOURCES = constants.DEFAULT_CONTAINER_RESOURCES
const DEFAULT_CONTAINER_RESOURCES_MEMORY = constants.DEFAULT_CONTAINER_RESOURCES_MEMORY
const ENTERPRISE_MODE = require('../configs/constants').ENTERPRISE_MODE
const mode = require('../configs/model').mode
const enterpriseFlag = ENTERPRISE_MODE == mode

exports.getResources = function (memory, cpu) {
  let resources = clone(DEFAULT_CONTAINER_RESOURCES)
  const intMemory = parseInt(memory || DEFAULT_CONTAINER_RESOURCES_MEMORY)
  switch (intMemory) {
    case 256:
      return resources
    case 512:
      resources.limits.memory = '512Mi'
      resources.requests.memory = '512Mi'
      break
    case 1024:
      resources.limits.memory = '1024Mi'
      resources.requests.memory = '1024Mi'
      break
    case 2048:
      resources.limits.memory = '2048Mi'
      resources.requests.memory = '2048Mi'
      break
    case 4096:
      resources.limits.memory = '4096Mi'
      resources.requests.memory = '4096Mi'
      break
    case 8192:
      resources.limits.memory = '8192Mi'
      resources.requests.memory = '8192Mi'
      break
    case 16384:
      resources.limits.memory = '16384Mi'
      resources.requests.memory = '16384Mi'
      break
    default:
      resources.limits.memory = memory
      resources.requests.memory = memory
  }
  if (enterpriseFlag && cpu) {
    resources.requests.cpu = cpu
    resources.limits.cpu = cpu
  }
  return resources
}
// only enterprise
// add cpu back
// cpu add requests only
// cpu显示问题