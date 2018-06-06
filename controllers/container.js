/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Service manage controller
 *
 * v0.1 - 2016-09-23
 * @author Zhangpc
 */
'use strict'

const apiFactory = require('../services/api_factory')
const constants = require('../constants')
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE

exports.getContainers = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let name = query.name
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  // if (isNaN(size) || size < 1 || size > MAX_PAGE_SIZE) {
  //   size = DEFAULT_PAGE_SIZE
  // }
  if(size != 0){
    var from = size * (page - 1)
    var queryObj = { from, size }
  }else{
    var queryObj = { size }
  }
  if (query.sortOrder) {
    queryObj.sort_by = 'create_time'
    queryObj.sort_order = query.sortOrder
  }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'instances'], queryObj)
  const pods = result.data.instances || []
  pods.map((pod) => {
    pod.images = []
    pod.spec.containers.map((container) => {
      pod.images.push(container.image)
    })
  })
  this.body = {
    cluster,
    data: pods,
    total: result.data.total,
    count: result.data.count,
  }
}

exports.getContainerDetail = function* () {
  const cluster = this.params.cluster
  const containerName = this.params.container_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'instances', containerName, 'detail'])
  const pod = result.data || {}
  // console.log(JSON.stringify(pod),'-----podsssssss')
  pod.images = []
  if (pod.spec) {
    pod.spec.containers.map((container) => {
      pod.images.push(container.image)
    })
  }
  this.body = {
    cluster,
    containerName,
    data: pod
  }
}

exports.getContainerDetailEvents = function* () {
  //this function for user get the events of detail container
  const cluster = this.params.cluster;
  const containerName = this.params.container_name;
  const loginUser = this.session.loginUser;
  const api = apiFactory.getK8sApi(loginUser);
  const result = yield api.getBy([cluster, 'instances', containerName, 'events'])
  const events = result.data || {}
  /*pod.events = []
  if (pod.data) {
    pod.data.map((eventDetail) => {
      pod.events.push(eventDetail)
    })
  }*/
  this.body = {
    cluster,
    containerName,
    data: events
  }
}

exports.getContainerLogs = function* () {
  const cluster = this.params.cluster
  const containerName = this.params.name
  const reqData = this.request.body
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.createBy([cluster, 'instances', containerName, 'logs'], null, reqData)
  this.status = result.code
  this.body = result
}

exports.deleteContainers = function* () {
  const cluster = this.params.cluster
  const instances = this.request.body
  if (!instances) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.batchDeleteBy([cluster, 'instances', 'batch-delete'], null, { instances })
  this.body = {
    cluster,
    data: result
  }
}

exports.exportContainers = function* () {
  const cluster = this.params.cluster
  const instance=this.params.name
  const image = this.request.body
  if (!image || !image.imagename) {
    const err = new Error('imagename is required.')
    err.status = 400
    throw err
  }

  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.createBy([cluster, 'instances',instance,'export'], null, image)
  this.body = {
    cluster,
    data: result.data,
    statusCode: result.statusCode
  }
}

exports.getProcess = function* () {
  const cluster = this.params.cluster
  const instance = this.params.name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'instances', instance, 'process'])
  this.body = {
    cluster,
    data: result
  }
}