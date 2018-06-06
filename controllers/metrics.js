/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Metrics manage controller
 *
 * v0.1 - 2016-10-20
 * @author Zhangpc
 */
'use strict'

const constants = require('../constants')
const METRICS_DEFAULT_SOURCE = constants.METRICS_DEFAULT_SOURCE
const METRICS_CPU = constants.METRICS_CPU
const METRICS_MEMORY = constants.METRICS_MEMORY
const METRICS_NETWORK_RECEIVED = constants.METRICS_NETWORK_RECEIVED
const METRICSS_NETWORK_TRANSMITTED = constants.METRICSS_NETWORK_TRANSMITTED
const DEFAULT_CONTAINER_RESOURCES = constants.DEFAULT_CONTAINER_RESOURCES
const DEFAULT_CONTAINER_RESOURCES_CPU = constants.DEFAULT_CONTAINER_RESOURCES_CPU
const DEFAULT_CONTAINER_RESOURCES_MEMORY = constants.DEFAULT_CONTAINER_RESOURCES_MEMORY
const apiFactory = require('../services/api_factory')
const moment = require('moment')

exports.getContainerMetrics = function* () {
  const cluster = this.params.cluster
  const containerName = this.params.container_name
  const query = this.query
  const user = this.session.loginUser
  if (!query.type) {
    let err = new Error('type is required.')
    err.status = 406
    throw err
  }
  const api = apiFactory.getK8sApi(user)
  const containerResult = yield api.getBy([cluster, 'instances', containerName, 'detail'])
  const instance = containerResult.data || {}
  const result = yield _getContainerMetrics(user, cluster, instance, query)
  this.status = result.statusCode
  this.body = {
    cluster,
    containerName,
    data: [result]
  }
}

exports.getAllContainerMetrics = function* () {
  const cluster = this.params.cluster
  const containerName = this.params.container_name
  const query = this.query
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const containerResult = yield api.getBy([cluster, 'instances', containerName, 'detail'])
  const instance = containerResult.data || {}
  let promiseArray = [];
  query.type = METRICS_CPU
  const promiseCpuArray = _getContainerMetrics(user, cluster, instance, query)
  promiseArray.push({cpu: promiseCpuArray})

  query.type = METRICS_MEMORY
  const promiseMemoryArray = _getContainerMetrics(user, cluster, instance, query)
  promiseArray.push({memory: promiseMemoryArray})

  query.type = METRICSS_NETWORK_TRANSMITTED
  const promiseNetworkTransmitArray = _getContainerMetrics(user, cluster, instance, query)
  promiseArray.push({networkTrans: promiseNetworkTransmitArray})

  query.type = METRICS_NETWORK_RECEIVED
  const promiseNetworkRecivceArray = _getContainerMetrics(user, cluster, instance, query)
  promiseArray.push({networkRec: promiseNetworkRecivceArray})

  const results = yield promiseArray
  this.body = {
    cluster,
    containerName,
    data: results
  }
}

exports.getServiceMetrics = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const query = this.query
  const user = this.session.loginUser
  if (!query.type) {
    let err = new Error('type is required.')
    err.status = 406
    throw err
  }
  const api = apiFactory.getK8sApi(user)
  const result = yield api.getBy([cluster, 'services', serviceName, 'instances'])
  const instances = result.data.instances || []
  const promiseArray = instances.map((instance) => {
    return _getContainerMetrics(user, cluster, instance, query)
  })
  const results = yield promiseArray
  this.body = {
    cluster,
    serviceName,
    data: results
  }
}

exports.getAllServiceMetrics = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const query = this.query
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  const result = yield api.getBy([cluster, 'services', serviceName, 'instances'])
  const instances = result.data.instances || []
  let promiseArray = [];
  const promiseCpuArray = instances.map((instance) => {
    query.type = METRICS_CPU
    return _getContainerMetrics(user, cluster, instance, query)
  })
  promiseArray.push({cpu: promiseCpuArray})
  const promiseMemoryArray = instances.map((instance) => {
    query.type = METRICS_MEMORY
    return _getContainerMetrics(user, cluster, instance, query)
  })
  promiseArray.push({memory: promiseMemoryArray})
  const promiseNetworkTransmitArray = instances.map((instance) => {
    query.type = METRICSS_NETWORK_TRANSMITTED
    return _getContainerMetrics(user, cluster, instance, query)
  })
  promiseArray.push({networkTrans: promiseNetworkTransmitArray})
  const promiseNetworkRecivceArray = instances.map((instance) => {
    query.type = METRICS_NETWORK_RECEIVED
    return _getContainerMetrics(user, cluster, instance, query)
  })
  promiseArray.push({networkRec: promiseNetworkRecivceArray})
  const results = yield promiseArray
  this.body = {
    cluster,
    serviceName,
    data: results
  }
}

exports.getAppMetrics = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  const query = this.query
  const user = this.session.loginUser
  if (!query.type) {
    let err = new Error('type is required.')
    err.status = 406
    throw err
  }
  const api = apiFactory.getK8sApi(user)
  // Top 10 services
  const servicesResult = yield api.getBy([cluster, 'apps', appName, 'services'])
  const services = servicesResult.data.services || []
  const servicesPromiseArray = services.map((service) => {
    let serviceName = service.deployment.metadata.name
    return api.getBy([cluster, 'services', serviceName, 'instances'])
  })
  const instancesResults = yield servicesPromiseArray
  const instancesPromiseArray = []
  instancesResults.map((result) => {
    const instances = result.data.instances || []
    instances.map((instance) => {
      instancesPromiseArray.push(_getContainerMetrics(user, cluster, instance, query))
    })
  })
  const results = yield instancesPromiseArray
  this.body = {
    cluster,
    appName,
    data: results
  }
}

exports.getAllAppMetrics = function* () {
  const cluster = this.params.cluster
  const appName = this.params.app_name
  const query = this.query
  const user = this.session.loginUser
  const api = apiFactory.getK8sApi(user)
  // Top 10 services
  const servicesResult = yield api.getBy([cluster, 'apps', appName, 'services'])
  const services = servicesResult.data.services || []
  const servicesPromiseArray = services.map((service) => {
    let serviceName = service.deployment.metadata.name
    return api.getBy([cluster, 'services', serviceName, 'instances'])
  })
  const instancesResults = yield servicesPromiseArray
  const instancesPromiseArray = []
  instancesResults.map((result) => {
    const instances = result.data.instances || []
    instances.map((instance) => {
      let promiseArray = [];
      const promiseCpuArray = instances.map((instance) => {
        query.type = METRICS_CPU
        return _getContainerMetrics(user, cluster, instance, query)
      })
      promiseArray.push({cpu: promiseCpuArray})
      const promiseMemoryArray = instances.map((instance) => {
        query.type = METRICS_MEMORY
        return _getContainerMetrics(user, cluster, instance, query)
      })
      promiseArray.push({memory: promiseMemoryArray})
      const promiseNetworkTransmitArray = instances.map((instance) => {
        query.type = METRICSS_NETWORK_TRANSMITTED
        return _getContainerMetrics(user, cluster, instance, query)
      })
      promiseArray.push({networkTrans: promiseNetworkTransmitArray})
      const promiseNetworkRecivceArray = instances.map((instance) => {
        query.type = METRICS_NETWORK_RECEIVED
        return _getContainerMetrics(user, cluster, instance, query)
      })
      promiseArray.push({networkRec: promiseNetworkRecivceArray})
      let results = promiseArray
      instancesPromiseArray.push(results)
    })
  })
  const results = yield instancesPromiseArray
  this.body = {
    cluster,
    appName,
    data: results
  }
}

function _getContainerMetrics(user, cluster, instance, query) {
  const containerName = instance.metadata.name
  const resources = instance.spec.containers[0].resources || DEFAULT_CONTAINER_RESOURCES
  const requests = resources.requests || DEFAULT_CONTAINER_RESOURCES.requests
  // const cpu = parseInt(requests.cpu || DEFAULT_CONTAINER_RESOURCES_CPU)
  // const memory = parseInt(requests.memory || DEFAULT_CONTAINER_RESOURCES_MEMORY) * 1024 * 1024
  const type = query.type
  const source = query.source || METRICS_DEFAULT_SOURCE
  const start = query.start
  let end = query.end
  if (!end) {
    let d = new Date()
    end = d.toISOString()
  }
  const queryObj = {
    type,
    source,
    start,
    end
  }
  const api = apiFactory.getK8sApi(user)
  return api.getBy([cluster, 'instances', containerName, 'metrics'], queryObj).then(function (result) {
    const metrics = result.metrics || []
    metrics.map((metric) => {
      // Handle by frontend
      /*switch (type) {
        case METRICS_CPU:
          // metric.value && (metric.value = metric.value * 100)
          // metric.floatValue && (metric.floatValue = metric.floatValue * 100)
        case METRICS_MEMORY:
          // metric.value && (metric.value = metric.value / 1024 / 1024)
          // metric.floatValue && (metric.floatValue = metric.floatValue / 1024 / 1024)
        case METRICS_NETWORK_RECEIVED:
        case METRICSS_NETWORK_TRANSMITTED:
      }*/
      metric.value && (metric.value = Math.ceil(metric.value * 100) / 100)
      metric.floatValue && (metric.floatValue = Math.ceil(metric.floatValue * 100) / 100)
      metric.timestamp = moment(metric.timestamp).format('MM-DD HH:mm')
    })
    return {
      containerName,
      start,
      type,
      metrics,
      statusCode: result.statusCode
    }
  })
}