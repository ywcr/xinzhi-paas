/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * OAuth tools
 *
 * v0.1 - 2016-10-08
 * @author Zhangpc
 */
'use strict'

const config = require('../../../configs')

exports.getAuthHeader = function (authInfo,type,object) {
  if (!authInfo) {
    return {}
  }
  if (authInfo.type === 'basic') {
    return {
      "authorization": `Basic ${Buffer(authInfo.user + ':' + authInfo.password).toString('base64')}`
    }
  }
  const auth = {}
  if (authInfo.user) {
    auth.username = authInfo.user
  }
  if (authInfo.token) {
    auth.authorization = `token ${authInfo.token}`
  }
  if (authInfo.teamspace) {
    auth.teamspace = authInfo.teamspace
  }
  if (authInfo.onbehalfuser) {
    auth.onbehalfuser = authInfo.onbehalfuser
  }
  if(type==1){
    auth['Content-Type'] = object.data.contentType
  }
  // TenxCloud System Signature for payment etc.
  const tenxSysSign = authInfo[config.tenxSysSign.key]
  if (tenxSysSign) {
    auth[config.tenxSysSign.key] = tenxSysSign
  }
  return auth
}