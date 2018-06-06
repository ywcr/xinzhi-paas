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

const constants = require('../constants')
const INSTANCE_MAX_NUM = constants.INSTANCE_MAX_NUM
const INSTANCE_AUTO_SCALE_MAX_CPU = constants.INSTANCE_AUTO_SCALE_MAX_CPU
const apiFactory = require('../services/api_factory')
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const portHelper = require('./port_helper')
var yaml = require('js-yaml');
var fs = require('fs');

exports.startServices = function* () {
  const cluster = this.params.cluster
  const services = this.request.body
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', 'batch-start'], null, { services })
  this.body = {
    cluster,
    data: result
  }
}


exports.getPodsLine = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getApi(loginUser)
  const name = this.params.name
  var clusters
  const result = yield api.clusters.getBy([cluster, 'pods', name], null);
  this.body = {
    data: {
      clusters,
      data: result.data
    }
  }
}

exports.getVessDetail = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const api = apiFactory.getApi(loginUser)
  const name = this.params.name
  var clusters
  const result = yield api.clusters.getBy([cluster, 'pods', name, 'detail'], null);
  this.body = {
    data: {
      clusters,
      data: result.data
    }
  }
}

exports.stopServices = function* () {
  const cluster = this.params.cluster
  const services = this.request.body
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', 'batch-stop'], null, { services })
  this.body = {
    cluster,
    data: result
  }
}

exports.restartServices = function* () {
  const cluster = this.params.cluster
  const services = this.request.body
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', 'batch-restart'], null, { services })
  this.body = {
    cluster,
    data: result
  }
}

exports.deleteServices = function* () {
  const cluster = this.params.cluster
  const services = this.request.body
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.batchDeleteBy([cluster, 'services', 'batch-delete'], null, { services })
  const devOpsApi = apiFactory.getDevOpsApi(loginUser)
  const deleteCDRuleResult = yield devOpsApi.deleteBy(['cd-rules'], {
    cluster,
    name: services.join(',')
  })
  this.body = {
    cluster,
    data: result
  }
}

exports.getServicesStatus = function* () {
  const cluster = this.params.cluster
  this.body = {
    cluster
  }
}

exports.quickRestartServices = function* () {
  const cluster = this.params.cluster
  const services = this.request.body
  const query = this.query;
  if (!services) {
    const err = new Error('Service names are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  // quickrestart !!
  const result = yield api.updateBy([cluster, 'services', 'quickrestart'], query ? query : null, { services })
  this.body = {
    cluster,
    data: result
  }
}

exports.getServiceDetail = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'services', serviceName])
  const lbgroupSettings = yield api.getBy([cluster, 'proxies'],{size:1000})
  const deployment = (result.data[serviceName] && result.data[serviceName].deployment) || {}
  deployment.images = []
  if (deployment.spec) {
    deployment.spec.template.spec.containers.map((container) => {
      deployment.images.push(container.image)
    })
  }
  if (result.data[serviceName] && result.data[serviceName].service) {
    portHelper.addPort(deployment, result.data[serviceName].service, lbgroupSettings.data)
  }
  this.body = {
    cluster,
    serviceName,
    data: deployment
  }
}

exports.getServiceContainers = function* () {
  const cluster = this.params.cluster
  const namespace = this.params.namespace
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  // console.log(loginUser.harbor.username)
  if (namespace === "我的空间") {
    const result = yield api.getBy([cluster, loginUser.harbor.username, 'services', serviceName, 'instances'])
    const instances = result.data.instances || []
    instances.map((pod) => {
      pod.images = []
      pod.spec.containers.map((container) => {
        pod.images.push(container.image)
      })
    })
    this.body = {
      cluster,
      serviceName,
      data: instances,
      total: result.data.total,
      count: result.data.count,
    }
  } else {
    const result = yield api.getBy([cluster, namespace, 'services', serviceName, 'instances'])
    const instances = result.data.instances || []
    instances.map((pod) => {
      pod.images = []
      pod.spec.containers.map((container) => {
        pod.images.push(container.image)
      })
    })
    this.body = {
      cluster,
      serviceName,
      data: instances,
      total: result.data.total,
      count: result.data.count,
    }
  }
  // const instances = result.data.instances || []
}

// update services env
exports.updateServiceContainers = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request.body
  if (!body || !Array.isArray(body)) {
    const err = new Error('Body are required.')
    err.status = 400
    throw err
  }
  const params = [{ "env": [], "container": serviceName }]
  params[0].env = body
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'env'], null, params)
  this.body = {
    data: result
  }
}

exports.manualScaleService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request.body
  if (!body || !body.num) {
    const err = new Error('Num is required.')
    err.status = 400
    throw err
  }
  let num = parseInt(body.num)
  if (isNaN(num) || num < 1 || num > INSTANCE_MAX_NUM) {
    const err = new Error(`Num is between 1 and ${INSTANCE_MAX_NUM}.`)
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'manualscale'], null, { number: num })
  this.body = {
    cluster,
    serviceName,
    data: result
  }
}

exports.getServiceAutoScale = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)

  const result = yield api.getBy([cluster, 'services', serviceName, 'autoscale'])
  const autoScale = result.data || {}
  this.body = {
    cluster,
    serviceName,
    data: autoScale[serviceName] || {}
  }
}

exports.autoScaleService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request.body
  let minReplicas = parseInt(body.minReplicas)
  let maxReplicas = parseInt(body.maxReplicas)
  let targetAverageValue = body.targetAverageValue
  let metricName = body.metricName
  let namespace = body.namespace
  let appName = body.appName
  let type = body.type
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  let lettype = type == 'cpu' ? 'cpu' : 'memory'
  var obj = {
    kind: 'HorizontalPodAutoscaler',
    apiVersion: 'autoscaling/v2alpha1',
    metadata: {
      name: serviceName,
      namespace: namespace,
    },
    spec: {
      scaleTargetRef: {
        apiVersion: 'apps/v1beta1',
        kind: 'Deployment',
        name: serviceName,
      },
      minReplicas: minReplicas,
      maxReplicas: maxReplicas,
      metrics:
        [
          {
            type: 'Pods',
            pods: {
              metricName: lettype,
              targetAverageValue: body.targetAverageValue
            }
          }
        ]
    },
  }

  let datelist = yaml.dump(obj)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'autoscale'], null, datelist)
  this.body = {
    cluster,
    serviceName,
    data: result
  }
}

exports.delServiceAutoScale = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.deleteBy([cluster, 'services', serviceName, 'autoscale'])
  const autoScale = result.data || {}
  this.body = {
    cluster,
    serviceName,
    data: result.data || {}
  }
}

exports.changeServiceQuota = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request.body
  if (!body) {
    const err = new Error('body is required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'quota'], null, body)
  this.body = {
    cluster,
    serviceName,
    data: result
  }
}

exports.changeServiceHa = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const body = this.request.body
  if (!body) {
    const err = new Error('Body are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'ha'], null, body)
  this.body = {
    cluster,
    serviceName,
    data: result
  }
}

exports.rollingUpdateService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const targets = this.request.body
  if (!targets) {
    const err = new Error('targets are required.')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'services', serviceName, 'rollingupdate'], null, targets)
  this.body = {
    cluster,
    serviceName,
    targets,
    data: result
  }
}

exports.bindServiceDomain = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const reqData = this.request.body
  if (!reqData.port || !reqData.domain) {
    const err = new Error('port and domain is required')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.clusters.createBy([cluster, 'services', serviceName, 'binddomain'], null, reqData)
  this.status = result.code
  this.body = result
}

exports.deleteServiceDomain = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const reqData = this.request.body
  if (!reqData.port || !reqData.domain) {
    const err = new Error('port and domain is required')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  const spi = apiFactory.getSpi(loginUser)
  const result = yield spi.clusters.updateBy([cluster, 'services', serviceName, 'binddomain'], null, reqData)
  this.status = result.code
  this.body = result
}

exports.getReplicasetDetailEvents = function* () {
  //this function for user get the events of detail service
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'replicaset', serviceName, 'events'])
  const events = result.data || []
  //eventList.events = []
  //if (eventList.data) {
  //  eventList.data.map((eventDetail) => {
  //    eventList.events.push(eventDetail)
  //  })
  //}
  this.body = {
    cluster,
    serviceName,
    data: events
  }
}

//get deployment all pods event
exports.getPodsEventByServicementName = function* () {
  const serviceName = this.params.service_name
  const cluster = this.params.cluster
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([cluster, 'services', serviceName, 'pods', 'events'])
  this.body = {
    cluster,
    serviceName,
    data: result.data || []
  }
}

// Use services for petset events
exports.getDbServiceDetailEvents = function* () {
  //this function for user get the events of detail service
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'services', serviceName, 'events'])
  const events = result.data || []

  this.body = {
    cluster,
    serviceName,
    data: events
  }
}

exports.getServiceLogs = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const namespace = this.params.namespace
  const reqData = this.request.body
  reqData.kind = 'service'
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.createBy([cluster, 'namespaces', namespace, 'instances', serviceName, 'logs'], null, reqData)
  this.status = result.code
  this.body = result
}

exports.getK8sService = function* () {
  const cluster = this.params.cluster
  const serviceName = this.params.service_name
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const result = yield api.getBy([cluster, 'services', serviceName, 'k8s-service'])
  this.status = result.code
  this.body = result
}

exports.checkServiceName = function* () {
  const cluster = this.params.cluster
  const service = this.params.service
  const spi = apiFactory.getSpi(this.session.loginUser)
  const response = yield spi.clusters.getBy([cluster, 'services', service, 'existence'])
  this.status = response.code
  this.body = response
}

exports.setServiceProxyGroup = function* () {
  const cluster = this.params.cluster
  const service = this.params.service
  const groupID = this.params.groupID
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.updateBy([cluster, 'services', service, 'lbgroups', groupID])
  this.status = response.code
  this.body = response
}

exports.getAllService = function* () {
  const cluster = this.params.cluster
  let pageIndex = parseInt(this.query.pageIndex)
  let pageSize = parseInt(this.query.pageSize)
  const query = this.query || {}
  if (isNaN(pageIndex)) {
    pageIndex = DEFAULT_PAGE
  }
  if (isNaN(pageSize)) {
    pageSize = DEFAULT_PAGE_SIZE
  }
  let name = query.name
  const queryObj = {
    from: (pageIndex - 1) * pageSize,
    size: pageSize
  }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.getBy([cluster, 'services'], queryObj, null)
  const lbgroupSettings = yield api.getBy([cluster, 'proxies'],{size:1000})
  this.status = response.code
  response.data.services.map((item) => {
    portHelper.addPort(item.deployment || item.petset, item.service, lbgroupSettings.data)
  })
  this.body = response
}

exports.updateServicePortInfo = function* () {
  const cluster = this.params.cluster
  const service = this.params.service_name
  const body = this.request.body
  if (!body) {
    const err = new Error('body is required.')
    err.status = 400
    throw err
  }
  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.updateBy([cluster, 'services', service, 'portinfo'], null, body)
  this.status = response.code
  this.body = response
}

exports.updateCertificate = function* () {
  const cluster = this.params.cluster
  const service = this.params.service_name
  const body = this.request.body
  if (!body) {
    const err = new Error('body is required.')
    err.status = 400
    throw err
  }

  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.createBy([cluster, 'services', service, 'certificates'], null, body)
  this.status = response.code
  this.body = response
}

exports.getCertificate = function* () {
  const cluster = this.params.cluster
  const service = this.params.service_name

  const api = apiFactory.getK8sApi(this.session.loginUser)
  let response = {}
  this.status = 200
  try {
    response = yield api.getBy([cluster, 'services', service, 'certificates'])
  } catch (err) {
    // Skip 404 exception
    if (err && err.statusCode !== 404) {
      this.status = response.code
    }
  }
  this.body = response
}

exports.deleteCertificate = function* () {
  const cluster = this.params.cluster
  const service = this.params.service_name

  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.deleteBy([cluster, 'services', service, 'certificates'])
  this.status = response.code
  this.body = response
}


exports.toggleHTTPs = function* () {
  const cluster = this.params.cluster
  const service = this.params.service_name
  const action = this.query.action
  if (action !== 'on' && action !== 'off') {
    const err = new Error('action invalid')
    err.status = 400
    throw err
  }
  const queryObj = {
    action: action,
  }

  const api = apiFactory.getK8sApi(this.session.loginUser)
  const response = yield api.updateBy([cluster, 'services', service, 'tls'], queryObj)
  this.status = 200
  this.body = {}
}

exports.serviceTopology = function* () {
  const cluster = this.params.cluster
  const appName = this.params.appName
  const spi = apiFactory.getSpi(this.session.loginUser)
  const response = yield spi.clusters.getBy([cluster, 'apps', appName, 'services'])
  this.status = response.code
  this.body = response.data
}

exports.podTopology = function* () {
  const cluster = this.params.cluster
  const appName = this.params.appName
  const spi = apiFactory.getSpi(this.session.loginUser)
  const response = yield spi.clusters.getBy([cluster, 'apps', appName, 'pods'])
  this.status = response.code
  this.body = response.data
}
