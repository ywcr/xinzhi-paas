/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Image scan config file
 *
 * v0.1 - 2017-03-24
 * @author YangYuBiao
 */

'use strict'

const env = process.env

module.exports = {
  protocol: env.IMAGE_SCAN_PROTOCOL || 'http',
  host: env.IMAGE_SCAN_HOST || '192.168.1.24:18080',
  external_protocol: env.IMAGE_SCAN_EXTERNAL_PROTOCOL || 'http',
  external_host: env.IMAGE_SCAN_EXTERNAL_HOST || '192.168.1.24',
}
