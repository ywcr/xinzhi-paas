/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2017-03-23
 * @author YangYuBiao
 */

'use strict'
const apiFactory = require('../services/api_factory')
const imageScanConfig = require('../configs/image_scan')
const registrieApi = require('../registry/index')
const SpecRegistryService = require('../services/docker_registry')
const securityUtil = require('../utils/security')
const logger = require('../utils/logger.js').getLogger("imageScan")
const algorithm = 'aes-256-ctr'
const parse = require('co-busboy')
const formStream = require('formstream')
const mime = require('mime')
const harborAPI = require('../registry/lib/harborAPIs')

function getImageInfo(user, repoName, tag) {
  const auth = securityUtil.decryptContent(user.registryAuth)
  const harbor = new harborAPI(null, auth)
  return new Promise((resolve, reject) => harbor.getManifest(repoName, tag, (err, statusCode, result) => {
    if (err) {
      reject(err)
    } else if (statusCode > 300) {
      err = new Error(`call registry v2 api failed`)
      err.status = statusCode
      reject(err)
    } else {
      resolve(result)
    }
  }))
}

function postToSecuredWithManifest(user, action, info, params) {
  const secured = apiFactory.getImageScanApi(user)
  const manifest = info.manifest
  info.manifest = JSON.stringify(manifest)
  return secured.createBy([action], params, info)
}

exports.getScanStatus = function* () {
  const body = this.query
  if (!body.imageName || !body.tag) {
    const err = new Error('imageName and tag is require')
    err.status = 400
    throw err
  }
  const user = this.session.loginUser
  const info = yield getImageInfo(user, body.imageName, body.tag)
  const status = yield postToSecuredWithManifest(user, 'scan-status', {manifest: info.manifest})
  this.body = status
}

exports.getLayerInfo = function* () {
  const body = this.query
  if (!body.imageName || !body.tag) {
    const err = new Error('imageName and tag is require')
    err.status = 400
    throw err
  }
  const user = this.session.loginUser
  const info = yield getImageInfo(user, body.imageName, body.tag)
  const layerInfo = yield postToSecuredWithManifest(user, 'layer-info', {manifest: info.manifest})
  this.body = layerInfo
}

exports.getLyins = function* () {
  const blobSum = this.query.blob_sum
  if (!blobSum) {
    const err = new Error('blob_sum is require')
    err.status = 400
    throw err
  }
  const fullName = this.query.full_name
  if (!fullName) {
    const err = new Error('full_name is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getImageScanApi(this.session.loginUser)
  const response = yield api.getBy(['level1-result'], { blob_sum: blobSum, full_name: fullName })
  this.body = response
}

exports.getClair = function* () {
  const blobSum = this.query.blob_sum
  if (!blobSum) {
    const err = new Error('blob_sum is require')
    err.status = 400
    throw err
  }
  const fullName = this.query.full_name
  if (!fullName) {
    const err = new Error('full_name is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getImageScanApi(this.session.loginUser)
  const response = yield api.getBy(['level2-result'], { blob_sum: blobSum, full_name: fullName })
  this.body = response
}

exports.scan = function* () {
  const body = this.request.body
  if (!body.imageName || !body.tag || !body.cluster_id) {
    const err = new Error('registry, imageName, tag, cluster_id is require')
    err.status = 400
    throw err
  }
  const user = this.session.loginUser
  const info = yield getImageInfo(user, body.imageName, body.tag)
  const result = yield postToSecuredWithManifest(user, 'scan', info, {cluster_id: body.cluster_id})
  this.body = result
}

exports.uploadFile = function* () {
  const parts = parse(this, {
    autoFields: true
  })
  if (!parts) {
    const err = new Error('The file is require')
    err.status = 400
    throw err
  }
  const api = apiFactory.getImageScanApi(this.session.loginUser)
  const cluster = this.params.cluster
  const fileStream = yield parts
  const stream = formStream()
  if (!fileStream || !fileStream.filename) {
    const err = new Error('The file is require')
    err.status = 400
    throw err
  }
  const fileName = fileStream.filename
  const extendName = fileName.substring(fileName.lastIndexOf('.') + 1)
  if (extendName != 'tar') {
    const err = new Error('The file must be *.tar')
    err.status = 400
    throw err
  }
  const mimeType = mime.lookup(fileStream.filename)
  stream.stream(fileStream.filename, fileStream, fileName, mimeType)
  let response = yield api.uploadFile(['scan-rules'], null, stream, stream.headers())
  this.body = response
}

function thunkToPromise(fn, self) {
  let isCalled = false
  return function () {
    const arg = Array.prototype.slice.apply(arguments)
    if (isCalled) return
    isCalled = true
    return new Promise((resolve, reject) => {
      arg.push(function () {
        isCalled = false
        resolve(arguments)
      })
      arg.push(true)
      fn.apply(self, arg)
    }).catch(err => {
      return err
    })
  }
}



// Get registry server information
function* _getRegistryServerInfo(session, user, id) {
  var serverInfo = {}
  // Try to get from session first
  if (session.registries && session.registries[id]) {
    serverInfo = {
      "server": session.registries[id].server,
      "authServer": session.registries[id].authServer,
      "username": session.registries[id].username,
      "password": session.registries[id].password
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
            "server": result.data[i].url,
            "authServer": result.data[i].auth_url,
            "username": result.data[i].username,
            "password": result.data[i].encrypted_password
          }
          serverInfo = session.registries[id]
          break
        }
      }
    }
  }
  return serverInfo
}
