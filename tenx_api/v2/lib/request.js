/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Request api tools
 * support promise and callback
 *
 * v0.1 - 2016-09-13
 * @author Zhangpc
 */
'use strict'

const urllib = require('urllib')
const _ = require('lodash')
const errors = require('./errors')
const oauth = require('./oauth')
const DEFAULT_PROTOCOL = 'http'
const DEFAULT_API_PRIFIX = 'api'
const DEFAULT_VERSION = 'v2'

// 1. Github or other system maybe quite slow
// 2. Petset scale might be slow
const DEFAULT_TIMEOUT = 1000 * 60
const DEFAULT_DATATYPE = 'json'
const logger = require('../../../utils/logger').getLogger(`tenx_api/request`)

module.exports = (protocol, host, api_prefix, version, auth, timeout) => {
  !protocol && (protocol = DEFAULT_PROTOCOL)
  !api_prefix && (api_prefix = DEFAULT_API_PRIFIX)
  !version && (version = DEFAULT_VERSION)
  !timeout && (timeout = DEFAULT_TIMEOUT)

  const _getUrl = (object) => `${protocol}://${host}/${api_prefix}/${version}${object.endpoint}`

  const _isSuccess = (statusCode) => statusCode < 300

  const _makeRequest = (object, callback) => {
    object = _.clone(object)
    let url = _getUrl(object)
    const options = {}
    // options.method = object.method
    // options.dataType = object.dataType || DEFAULT_DATATYPE
    // options.contentType = object.contentType || DEFAULT_DATATYPE
    // options.timeout = object.timeout || timeout
    // options.headers = object.headers
    // options.data = object.data
    options.method = object.method
    options.dataType = object.dataType || DEFAULT_DATATYPE
    options.contentType = object.contentType || DEFAULT_DATATYPE
    options.timeout = object.timeout || timeout
    options.headers = object.headers
    options.data = object.data

    if (object.options) {
      options.headers = _.merge(options.headers, object.options)
    }

    // For file upload, volume etc...
    if (object.stream) {
      options.stream = object.stream
      options.timeout = 36000000
      delete options.contentType
    } else {
      object.contentType = options.contentType
      object.dataType = options.dataType
    }
    logger.debug(`<-- [${options.method || 'GET'}] ${url}`)
    logger.debug(`--> [options]`, options)
    if (!callback) {
      return urllib.request(url, options).then(
        function done(result) {
          if(result.res.data && result.res.data.code && result.res.data.code!=200){
            result.res.statusCode = result.res.data.code
            // var err = {statusCode : result.res.data.code}
            throw errors.get(result.res);
          }else{
            logger.debug(`--> [${options.method || 'GET'}] ${url}`)
            logger.debug(`api result: ${JSON.stringify(result.data)}`)
            if (_isSuccess(result.res.statusCode)) {
              // data maybe null
              if (!result.data) {
                result.data = {}
              }
              result.data.statusCode = result.res.statusCode
              return result.data
            }
            throw errors.get(result.res)
          }
        },
        function fail(err) {
          err.statusCode = err.res.statusCode
          throw errors.get(err)
        }
      )
    }

    urllib.request(url, object, (err, data, res) => {
      if (err) {
        err.statusCode = err.res.statusCode
        err = errors.get(err)
        return callback(err)
      }

      if (_isSuccess(res.statusCode)) {
        data.statusCode = res.statusCode
        return callback(null, data)
      }

      callback(errors.get(res))
    })
  }

  return (object, callback) => {
    if(object.endpoint == '/oem/files'){
      object = _.merge({}, object, { "headers": oauth.getAuthHeader(auth,1,object) })    
    }else{
      object = _.merge({}, object, { "headers": oauth.getAuthHeader(auth) })    
    }
    return _makeRequest(object, callback)
  }
}