
/**
* Licensed Materials - Property of paas.enncloud.cn
* (C) Copyright 2016 TenxCloud. All Rights Reserved.
*
* plugin_proxy controller
*
* v0.1 - 2017-05-19
* @author YangYuBiao
*/
'use strict'

const http = require('http')
const https = require('https')
const apiFactory = require('../services/api_factory')

const prefix = '/api/v1/proxy/namespaces/kube-system/services/'

const reg = /\/proxy\/clusters\/[-a-zA-z0-9_]+\/plugins\//
const clusterReg = /\/clusters\/[-a-zA-z0-9_]+/
const pluginReg = /\/plugins\/[-a-zA-z0-9_]+/
let globalClusterInfo = ''

exports.pluginsProxy = function* () {
  if(this.session.loginUser.role != 2 ) {
    const err = new Error('no admin user')
    err.status = 401
    throw err
  }

  const req = this.req
  let cluster = clusterReg.exec(req.url)
  if(!cluster) {
    const err = new Error('params cluster is require')
    err.status = 400
    throw err
  }
  cluster = cluster[0].substr(cluster[0].lastIndexOf('/') + 1)
  let pluginName = pluginReg.exec(req.url)
  if(!pluginName) {
    const err = new Error('params cluster is require')
    err.status = 400
    throw err
  }
  let clusterInfo = ''
  if(globalClusterInfo && globalClusterInfo.name == cluster) {
    clusterInfo = globalClusterInfo
  } else {
    const api = apiFactory.getK8sApi(this.session.loginUser)
    const result = yield api.getBy([cluster])
    clusterInfo = result.data
    globalClusterInfo = clusterInfo
  }
  if(!clusterInfo) {
    const err = new Error(`Can't find the cluster`)
    err.status = 404
    throw err
  }
  const apiToken = clusterInfo.apiToken
  let host = clusterInfo.apiHost
  let port = 80
  if(host.indexOf(':') > 0) {
    const tempArr = host.split(':')
    host = tempArr[0]
    port = tempArr[1]
  }

  const path = prefix +  req.url.replace(reg, '')
  yield new Promise((resolve, reject) => {
    asProxy(sendRequest({
      headers: Object.assign(req.headers, { 'Authorization': `Bearer ${apiToken}` }),
      path,
      method: req.method,
      host,
      protocol: clusterInfo.apiProtocol,
      port
    }, this.request.body), this, resolve)
  })
}

exports.pluginsStaticProxy = function* () {
  if (this.session.loginUser.role != 2) {
    const err = new Error('no admin user')
    err.status = 401
    throw err
  }
  if (!globalClusterInfo) {
    const err = new Error('cluster is require')
    err.status = 400
    throw err
  }
  const clusterInfo = globalClusterInfo
  const apiToken = clusterInfo.apiToken
  let host = clusterInfo.apiHost
  const req = this.req
  let port = 80
  if (host.indexOf(':') > 0) {
    const tempArr = host.split(':')
    host = tempArr[0]
    port = tempArr[1]
  }

  const path = req.url

  yield new Promise((resolve, reject) => {
    asProxy(sendRequest({
      headers: Object.assign(req.headers, { 'Authorization': `Bearer ${apiToken}` }),
      path,
      method: req.method,
      host,
      protocol: clusterInfo.apiProtocol,
      port
    }, this.request.body), this, resolve)
  })
}

function sendRequest(option, data) {
  const proxy  = option.protocol == 'https' ? https : http
  delete option.protocol
  delete option.headers.host
  delete option.headers.port
  delete option.headers.protocol
  delete option.headers.cookie
  const defaultOptions = {
    port: option.port,
    host: option.host,
    rejectUnauthorized: false
  }
  const proxyOption = Object.assign({}, defaultOptions, option)
  const requestSocket = proxy.request(proxyOption)
  if(data && Object.getOwnPropertyNames(data).length > 0) {
    requestSocket.write(JSON.stringify(data))
  }
  requestSocket.end()
  return requestSocket
}

function asProxy(socket, ctx, callback) {
  const res = ctx.res
  socket.on('response', (socketRes) => {
    const keyArr = Object.getOwnPropertyNames(socketRes.headers)
    ctx.status = socketRes.statusCode
    keyArr.forEach(key => {
      res.setHeader(key, socketRes.headers[key])
    })
    socketRes.pipe(res)
  })
   socket.on('error', (err) => {
     throw err
   })
}


