/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Index controller
 *
 * v0.1 - 2016-09-22
 * @author YangYuBiao
 */

'use strict'
let yaml = require('js-yaml')
const parse = require('co-busboy')
const fs = require('fs')
const formStream = require('formstream')
const mime = require('mime')
const http = require('http')
const apiFactory = require('../services/api_factory')
const config = require('../configs')
const constants = require('../configs/constants')
const standardFlag = config.running_mode === constants.STANDARD_MODE

exports.getVolumeListByPool = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const storageName = this.query.storagename
  let response
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  if(storageName == '0') {
    response = yield volumeApi.getBy([cluster, 'volumes'])
  } else {
    response = yield volumeApi.getBy([cluster, 'volumes'], {
      storageName: storageName
    })
  }
  this.status = response.code
  this.body = response
}
exports.getVolumePort = function* () {
  const cluster = this.params.cluster
  const query = this.query ||{}
  let response
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
    response = yield volumeApi.getBy([cluster,'apps','checkport'],query)
  this.status = response.code
  this.body = response
}
exports.deleteVolume = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const volumeArray = this.request.body
  if (!volumeArray) {
    this.status = 400
    this.body = {
      message: 'error'
    }
    return
  }
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  let response = yield volumeApi.batchDeleteBy([cluster, 'volumes', 'batch-delete'], null, volumeArray)
  this.status = 200
  this.body = {}
}


exports.createVolume = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const reqData = this.request.body
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  if (!standardFlag) {
    const statusRes = yield volumeApi.getBy([cluster, 'volumes', 'pool-status'])
    const poolStatus = statusRes.data
    poolStatus.used = parseInt(poolStatus.used)
    poolStatus.available = parseInt(poolStatus.available)
    let total = parseInt(poolStatus.total)
    poolStatus.allocated = parseInt(poolStatus.allocated)
    if(poolStatus.total.toLowerCase().indexOf('g') > 0){
      poolStatus.total = total * 1024
    } else {
      poolStatus.total = total 
    }
    poolStatus.unallocated = poolStatus.total - poolStatus.allocated
    let selectSize = reqData.driverConfig.size
    if (selectSize > poolStatus.unallocated) {
      poolStatus.select = selectSize
      this.status = 403
      this.body = {
        statusCode: 403,
        message: 'The cluster storage resource is not enough',
        data: poolStatus
      }
      return
    }
  }
  let response = yield volumeApi.createBy([cluster, 'volumes'], null, reqData)
  this.status = response.code
  this.body = response
}
exports.createpvcs = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const reqData = this.request.body
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  if (reqData.type == 'rbd') {
    const statusRes = yield volumeApi.getBy([cluster, 'volumes', 'pool-status'])
    const poolStatus = statusRes.data
    poolStatus.used = parseInt(poolStatus.used)
    poolStatus.available = parseInt(poolStatus.available)
    let total = parseInt(poolStatus.total)
    poolStatus.allocated = parseInt(poolStatus.allocated)
    if(poolStatus.total.toLowerCase().indexOf('g') > 0){
      poolStatus.total = total * 1024
    } else {
      poolStatus.total = total 
    }
    poolStatus.unallocated = poolStatus.total - poolStatus.allocated
    // let selectSize = reqData.driverConfig.size
    // storageConfig
    // console.log(reqData,'zzzzzzzzzzzzzz')
    // if (selectSize > poolStatus.unallocated) {
    //   poolStatus.select = selectSize
    //   this.status = 403
    //   this.body = {
    //     statusCode: 403,
    //     message: 'The cluster storage resource is not enough',
    //     data: poolStatus
    //   }
    //   return
    // }
  }
  let response = yield volumeApi.createBy([cluster, 'pvcs'], null, reqData)
  this.status = response.code
  this.body = response
}
exports.formateVolume = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  let reqData = this.request.body

  if (!reqData.type || !reqData.name) {
    this.status = 400
    this.body = { message: 'error' }
  }
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield volumeApi.updateBy([cluster, 'volumes', reqData.name, 'format'], null, {
    fsType: reqData.fsType,
  })
  this.status = response.code
  this.body = response
}

exports.resizeVolume = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const reqData = this.request.body
  if (!reqData.name || !reqData.size) {
    this.status = 400
    this.body = { message: 'error' }
  }
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield volumeApi.updateBy([cluster, 'volumes', reqData.name, 'expansion'], null, {
    size: reqData.size
  })
  this.status = response.code
  this.body = response
}
exports.getVolumeDetail = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const volumeName = this.params.name
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  const query = this.query||{}
  const response = yield volumeApi.getBy([cluster, 'volumes', volumeName, 'consumption'],query)
  this.status = response.code
  this.body = {
    body: response.data
  }
}


exports.beforeUploadFile = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const volumeName = this.params.name
  const reqData = this.request.body
  if (!reqData.fileName || !reqData.size) {
    this.status = 400
    this.body = { message: 'error' }
    return
  }
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield volumeApi.createBy([cluster, 'volumes', volumeName, 'beforimport'], null, reqData)
  this.status = response.code
  this.body = response
}

exports.uploadFile = function* () {
  const parts = parse(this, {
    autoFields: true
  })
  if (!parts) {
    this.status = 400
    this.message = { message: 'error' }
    return
  }
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  const cluster = this.params.cluster
  const fileStream = yield parts
  const pool = parts.field.pool
  const isUnzip = parts.field.isUnzip
  const format = parts.field.format
  const volumeName = parts.field.volumeName
  const backupId = parts.field.backupId
  const stream = formStream()
  const mimeType = mime.lookup(fileStream.filename)
  stream.stream(fileStream.filename, fileStream, fileStream.filename, mimeType)
  let response = yield volumeApi.uploadFile([cluster, volumeName, backupId, 'import'], { isUnzip }, stream, stream.headers())
  this.status = response.code
  this.body = response
}


exports.getFileHistory = function* () {
  const volumeName = this.params.name
  const pool = this.params.pool
  const cluster = this.params.cluster
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  let response = yield volumeApi.getBy([cluster, volumeName, 'filehistory'])
  this.status = response.code
  this.body = response
}

exports.getBindInfo = function* () {
  const pool = this.params.pool
  const cluster = this.params.cluster
  const volumeName = this.params.name
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield volumeApi.getBy([cluster, 'volumes', volumeName, 'bindinfo'], null)
  this.status = response.code
  this.body = response
}

exports.getAvailableVolume = function*() {
  const cluster = this.params.cluster
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield volumeApi.getBy([cluster, 'volumes', 'available'], null)
  this.status = response.code
  this.body = response
}

exports.getPoolStatus = function*() {
  const cluster = this.params.cluster
  const volumeApi = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield volumeApi.getBy([cluster, 'volumes', 'pool-status'], null)
  this.status = response.code
  this.body = response
}

exports.createSnapshot=function*() {
  const snapshot=this.request.body
  const volumeName = this.params.name
  if (!snapshot.snapshotName||!volumeName) {
      this.status = 400
      this.body = {
          message: 'snapname and volumeName is empty'
      }
      return
  }
  const cluster = this.params.cluster
  const snapApi=apiFactory.getK8sApi(this.session.loginUser)
  const response=yield snapApi.createBy([cluster,'volumes',volumeName,'snapshot'],null,this.request.body)
  this.status = response.code
  this.body = response
}

exports.deleteSnapshot=function* () {
  const snapshotArray = this.request.body
  if (!snapshotArray) {
      this.status = 400
      this.body = {
          message: 'error'
      }
      return
  }
  const cluster = this.params.cluster
  const snapApi=apiFactory.getK8sApi(this.session.loginUser)
  const response=yield snapApi.batchDeleteBy([cluster,'volumes','snapshot','delete'],null,this.request.body)
  this.status = response.code
  this.body = response
}
exports.listSnapshots=function* () {
  const cluster = this.params.cluster
  const snapApi=apiFactory.getK8sApi(this.session.loginUser)
  const response=yield snapApi.getBy([cluster,'volumes','snapshot','list'],null)
  this.status = response.code
  this.body = response
}
exports.getCalamariUrl=function* () {
  const cluster = this.params.cluster
  const snapApi=apiFactory.getK8sApi(this.session.loginUser)
  const response=yield snapApi.getBy([cluster,'volumes','calamari'],null)
  this.status = response.code
  this.body = response
}
exports.setCalamariUrl=function*() {
	const calamari=this.request.body
	if (!calamari.calamariUrl) {
		this.status = 400
		this.body = {
			message: 'calamariUrl is empty'
		}
		return
	}
	const cluster = this.params.cluster
	const snapApi=apiFactory.getK8sApi(this.session.loginUser)
	const response=yield snapApi.createBy([cluster,'volumes','calamari'],null,this.request.body)
	this.status = response.code
	this.body = response
}



exports.rollbackSnapshot=function* () {
  const snapshot=this.request.body
  const volumeName = this.params.name
  if (!snapshot.snapshotName||!volumeName) {
      this.status = 400
      this.body = {
          message: 'snapname and volumeName is empty'
      }
      return
  }
  const cluster = this.params.cluster
  const snapApi=apiFactory.getK8sApi(this.session.loginUser)
  const response=yield snapApi.createBy([cluster,'volumes',volumeName,'snapshot','rollback'],null,this.request.body)
  this.status = response.code
  this.body = response
}


exports.cloneSnapshot=function* () {
	const snapshot=this.request.body
	const volumeName = this.params.name
	if (!snapshot.snapshotName||!volumeName) {
		this.status = 400
		this.body = {
			message: 'snapname and volumeName is empty'
		}
		return
	}
	const cluster = this.params.cluster
	const snapApi=apiFactory.getK8sApi(this.session.loginUser)
	const response=yield snapApi.createBy([cluster,'volumes',volumeName,'snapshot','clone'],null,this.request.body)
	this.status = response.code
	this.body = response
}


// exports.exportFile = function* () {
//   const pool = this.params.pool
//   const cluster = this.params.cluster
//   const volumeName = this.params.name
//   const option = {
//     protocol: 'http:',
//     hostname: 'localhost',
//     port: 8000,
//     headers: {
//       "user": 'zhangpc',
//       "token": 'jgokzgfitsewtmbpxsbhtggabvrnktepuzohnssqjnsirtot',
//       "namespace": 'zhangpc'
//     },
//     path: '/api/v1/volumes/pool/cluster/name/exportfile'
//   }
//   const request = http.request(option, res => {
//     res.setEncoding('utf8')
//     res.on('data', data => {
//       this.res.write(data.toString())
//     })
//     res.on('end', (a) => {
//       this.res.end()
//     })
//   })
//   request.on('error', error => {
//     this.res.end(`{ "message": "${JSON.stringify(error)}" }`)
//   })
// }
