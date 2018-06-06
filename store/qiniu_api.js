/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
*/

/* Qiniu API for upload files
 * Code reference: https://github.com/qiniu/nodejs-sdk.v6
 *
 * 2016-12-16
 * @author Lei
*/
'use strict'

var qn = require('qn')
var utility = require('utility')
var logger = require('../utils/logger.js').getLogger('qiniu_api')
var storeConfig = require('../configs/_standard/qiniu')

// 5 mins to make token expired
const ExpireTime = 300
/*
 * Qiniu upload APIs
 */
function QiniuAPI(bucket) {
  this.qiniuConfig = {}
  switch (bucket) {
    case 'ticket':
      if (storeConfig.qn_access_upload && storeConfig.qn_access_upload.bucket === 'tenxcloud-upload') {
        this.qiniuConfig = storeConfig.qn_access_upload
      }
      break
    case 'icon':
      if (storeConfig.qn_access_icon && storeConfig.qn_access_icon.bucket === 'tenxcloud-icon') {
        this.qiniuConfig = storeConfig.qn_access_icon
      }
      break
    case 'avatars':
      if (storeConfig.qn_access_avatar && storeConfig.qn_access_avatar.bucket === 'avatars') {
        this.qiniuConfig = storeConfig.qn_access_avatar
      }
      break
    case 'volume':
      if (storeConfig.qn_volume_private && storeConfig.qn_volume_private.bucket === 'tenx-volume') {
        this.qiniuConfig = storeConfig.qn_volume_private
      }
      break
    case 'certificate':
      if (storeConfig.qn_certification && storeConfig.qn_certification.bucket === 'tenx-enterprise-certification') {
        this.qiniuConfig = storeConfig.qn_certification
      }
      break
    default:
      logger.error('Invalid qiniu bucket: ' + bucket)
      return
  }
  // Add other options
  this.qiniuConfig.scope = this.qiniuConfig.bucket
  // Create the client
  this.client = qn.create(this.qiniuConfig)
}

/*
Get the token to upload file
*/
QiniuAPI.prototype.getUpToken = function (fileName) {
  if (!this.qiniuConfig.scope || !fileName) {
    logger.error('Invalid configuration or no file name, return empty token')
    return ''
  }
  // Return upload token to frontend
  return this.client.uploadToken({
    // Add file name to scope as key
    scope: this.qiniuConfig.scope + ':' + fileName,
    // Set deadline
    deadline: utility.timestamp() + ExpireTime
  })
}

QiniuAPI.prototype.getQiniuConfig = function() {
  return this.qiniuConfig
}

// Testing purpose for now
QiniuAPI.prototype.uploadFile = function (fileName, callback) {
  let method = 'uploadFile'
  if (!this.qiniuConfig.scope || !fileName) {
    logger.error('Invalid configuration or no file name, return empty token')
    return ''
  }

  let token = this.getUpToken(fileName)
  // upload a file with custom key
  let self = this
  setTimeout(function() {
    // token should not expire
    // key should match
    // NOTE: Current qn module doesn't support to use custom token in options, so need to update up.js to test token expired
    self.client.uploadFile(fileName, {token: token, key: fileName}, function (err, result) {
      if (err) {
        logger.error(method, 'Failed to update to qiniu: ' + JSON.stringify(err))
      }
      logger.info(method, JSON.stringify(result))
      if (callback) {
        callback(err, result)
      }
    })
  }, 10000)
}

module.exports = QiniuAPI
