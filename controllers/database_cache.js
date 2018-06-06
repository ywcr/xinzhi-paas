/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Database cache controller
 *
 * v0.1 - 2016-10-27
 * @author GaoJian / Lei
 */
'use strict'
let yaml = require('js-yaml')
let utils = require('../utils')
const Service = require('../kubernetes/objects/service')
const apiFactory = require('../services/api_factory')
const registryConfigLoader = require('../registry/registryConfigLoader')
const PetsetLabel = 'tenxcloud.com/petsetType'
const constants = require('../constants')
const lbGroupAnnotationKey = constants.ANNOTATION_LBGROUP_NAME
const svcScheamPortnameKey = constants.ANNOTATION_SVC_SCHEMA_PORTNAME
/*
basicInfo {
  templateId: "xxxx",
  serviceName: "xxxx",
  replicas: 3,
  volumeSize: 500,
  password: "xxxx"
}
*/
// Use the selected template to create petsets in k8s cluster
exports.createNewDBService = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const query = this.query||{}
  const api = apiFactory.getK8sApi(loginUser)
  // Get required info
  const basicInfo = this.request.body
  const templateApi = apiFactory.getTemplateApi(loginUser)
  if (!basicInfo.templateId) {
    const err = new Error('No database template provided.')
    err.status = 400
    throw err
  }
  if (!basicInfo.serviceName || !basicInfo.volumeSize || !basicInfo.replicas) {
    const err = new Error('serviceName, volumeSize, replicas are required')
    err.status = 400
    throw err
  }
  const appTemplate = yield templateApi.getBy([basicInfo.templateId])
  if (appTemplate.data.category == 'mysql'
    || appTemplate.data.category == 'redis'
    || appTemplate.data.category == 'zookeeper') {
    // Check password for some template
    if (!basicInfo.password) {
      const err = new Error('password is required')
      err.status = 400
      throw err
    }
  }
  let yamlContent = appTemplate.data.content
  // For base petset and service
  yamlContent = yamlContent.replace(/\{\{name\}\}/g, basicInfo.serviceName)
    .replace(/\{\{size\}\}/g, basicInfo.volumeSize)
    .replace(/\{\{password\}\}/g, basicInfo.password) // Must have double quote in the template
    .replace(/\{\{replicas\}\}/g, basicInfo.replicas)
  yamlContent = yamlContent.replace(/\{\{registry\}\}/g, getRegistryURL())
  // For external service access
  let externalName = basicInfo.serviceName + '-' + utils.genRandomString(5)
  yamlContent = yamlContent.replace(/\{\{external-name\}\}/g, externalName)
  // Port will be generated randomly
  //yamlContent = yamlContent.replace("{{external-port}}", "")
  if (!basicInfo.externalIP) {
    basicInfo.externalIP = ''
  }
  yamlContent = yamlContent.replace(/\{\{external-ip\}\}/g, basicInfo.externalIP)

  if (basicInfo.lbGroupID) {
    yamlContent = addServiceAnnotationOfLBGroup(yamlContent, basicInfo.lbGroupID)
  }
  const result = yield api.createBy([cluster, 'statefulsets'], { category: appTemplate.data.category,type:query.type }, yamlContent);
  this.body = {
    result
  }
}

exports.createStatefulsets = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  // Get required info
  const basicInfo = this.request.body
  const templateApi = apiFactory.getTemplateApi(loginUser)
  if (!basicInfo.templateId) {
    const err = new Error('No database template provided.')
    err.status = 400
    throw err
  }
  if (!basicInfo.serviceName || !basicInfo.volumeSize || !basicInfo.replicas) {
    const err = new Error('serviceName, volumeSize, replicas are required')
    err.status = 400
    throw err
  }
  const appTemplate = yield templateApi.getBy([basicInfo.templateId])
  if (appTemplate.data.category == 'mysql'
    || appTemplate.data.category == 'redis'
    || appTemplate.data.category == 'zookeeper') {
    // Check password for some template
    if (!basicInfo.password) {
      const err = new Error('password is required')
      err.status = 400
      throw err
    }
  }
  let yamlContent = appTemplate.data.content
  // For base petset and service
  yamlContent = yamlContent.replace(/\{\{name\}\}/g, basicInfo.serviceName)
    .replace(/\{\{size\}\}/g, basicInfo.volumeSize)
    .replace(/\{\{password\}\}/g, basicInfo.password) // Must have double quote in the template
    .replace(/\{\{replicas\}\}/g, basicInfo.replicas)
  yamlContent = yamlContent.replace(/\{\{registry\}\}/g, getRegistryURL())
  // For external service access
  let externalName = basicInfo.serviceName + '-' + utils.genRandomString(5)
  yamlContent = yamlContent.replace(/\{\{external-name\}\}/g, externalName)
  // Port will be generated randomly
  //yamlContent = yamlContent.replace("{{external-port}}", "")
  if (!basicInfo.externalIP) {
    basicInfo.externalIP = ''
  }
  yamlContent = yamlContent.replace(/\{\{external-ip\}\}/g, basicInfo.externalIP)

  if (basicInfo.lbGroupID) {
    yamlContent = addServiceAnnotationOfLBGroup(yamlContent, basicInfo.lbGroupID)
  }
  const result = yield api.createBy([cluster, 'statefulsets'], { category: appTemplate.data.category }, yamlContent);
  this.body = {
    result
  }
}

exports.updateCaches = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cacheId = this.params.id
  const cacheVerb = this.params.verb
  // Get required info
  const basicInfo = this.request.body
  const type = this.params.type
  const verbArr = {
    'starting':'start',
    'stopping':'stop',
    'restarting':'restart',
    'resizing':'resize'
  }

  const result = yield api.updateBy([cluster, type,cacheId,verbArr[cacheVerb]],null,basicInfo);
  this.body = {
    result
  }
}
exports.gitNode = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const cacheId = this.params.id
  const cacheVerb = this.params.verb
  // Get required info
  const basicInfo = this.request.body
  const type = this.params.type

  const result = yield api.updateBy([cluster, type,cacheId,cacheVerb,'nodes'],null,basicInfo);
  this.body = {
    result
  }
}
exports.createNewCaches = function* () {
  const cluster = this.params.cluster
  const type = this.params.type
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  // Get required info
  const basicInfo = this.request.body

  const result = yield api.createBy([cluster, type],null,basicInfo);
  this.body = {
    result
  }
}
//addnode -zhang
exports.addnode = function* () {
  // cluster,types,mongoId,nodecount
  const cluster = this.params.cluster
  const types = this.params.types
  const mongoId = this.params.mongoId
  // const nodecount = this.params.nodecount
  const query = this.query||{}
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  // Get required info
  const basicInfo = this.request.body

  const result = yield api.createBy([cluster,types,mongoId,'nodes'],query,basicInfo);
  this.body = {
    result
  }
}
exports.deleteRedis = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const serviceId = this.params.id
  const api = apiFactory.getK8sApi(loginUser)
  const type = this.params.type
  const result = yield api.deleteBy([cluster, type, serviceId]);

  this.body = {
    result
  }
}
// deleteNodes
exports.deleteNodes = function* () {
     // : ApiURI/api/v2/clusters/:cluster/rdbs/:rdb/nodes/:node Method: DELETE
    const loginUser = this.session.loginUser
    const cluster = this.params.cluster
    const deleteId = this.params.deleteId
    const rdbInstanceId = this.params.rdbInstanceId
    const api = apiFactory.getK8sApi(loginUser)
    const type = this.params.type
    // rdbInstanceId
    const result = yield api.deleteBy([cluster,type, deleteId,'nodes',rdbInstanceId]);
    this.body = {
      result
    }
  }
exports.deleteBackup= function* () {
    const loginUser = this.session.loginUser
    const cluster = this.params.cluster
    const serviceId = this.params.id
    const api = apiFactory.getK8sApi(loginUser)
    const type = this.params.type
    const result = yield api.deleteBy([cluster,'snapshots', serviceId]);

    this.body = {
        result
    }
}

function addServiceAnnotationOfLBGroup(rawYAMLString, groupID) {
  const separator = '---'
  const rawResourceParts = rawYAMLString.split(separator)
  const rawParts = rawResourceParts.reduce((parts, part) => {
    if (part.indexOf(svcScheamPortnameKey) !== -1) {
      parts.care.push(part)
    } else {
      parts.notCare.push(part)
    }
    return parts
  }, {
      care: [],
      notCare: [],
    })
  const needGroupID = rawParts.care.map(resource => yaml.load(resource))
  needGroupID.forEach(resource => {
    resource.metadata.annotations[lbGroupAnnotationKey] = groupID
  })
  return needGroupID.map(resource => yaml.dump(resource))
    .concat(rawParts.notCare).join(separator)
}

/*
Remove petset and related resources from k8s cluster
*/
exports.deleteDBService = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const serviceName = this.params.name
  const api = apiFactory.getK8sApi(loginUser)

  const result = yield api.deleteBy([cluster, 'statefulsets', serviceName]);

  this.body = {
    result
  }
}

exports.deleteStatefulsets = function* () {
  const loginUser = this.session.loginUser
  const cluster = this.params.cluster
  const serviceName = this.params.name
  const api = apiFactory.getK8sApi(loginUser)

  const result = yield api.deleteBy([cluster, 'statefulsets', serviceName]);

  this.body = {
    result
  }
}

/*
type = mysql/redis/....
*/
exports.listDBService = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const query = this.query || {}
  const category = query.type

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'statefulsets'], { "category": category ,type:query.type});
  const databases = result.data.statefulSet || []
  // remote some data
  databases.forEach(function (db) {
    if (db.objectMeta) {
      delete db.objectMeta.labels
    }
    delete db.typeMeta
  })
  this.body = {
    cluster,
    databaseList: databases,
  }
}

exports.listStatefulsets = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const query = this.query || {}
  const category = query.type

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'statefulsets'], { "type": category });
  // console.log(result,'-------------resultresultresultresult')
  const databases = result.data.statefulSet || []
  // remote some data
  databases.forEach(function (db) {
    if (db.objectMeta) {
      delete db.objectMeta.labels
    }
    delete db.typeMeta
  })
  this.body = {
    cluster,
    databaseList: databases,
  }
}

// get caches list  Yao.wei
exports.getCaches = function* () {
  const cluster = this.params.cluster
  const type = this.params.type
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, type],null);
  const databases = result || []
  var types = ''
  switch(type){
    case 'caches':
    types = 'cache_set'
    break;
    case 'mongos':
    types = 'mongo_set'
    break;
    case 'rdbs':
    types = 'rdb_set'
    break;
  }
  this.body = {
    cluster,
    databaseList: databases.data[types],
    total_count: databases.data.total_count,
    action:databases.data.action,
    ret_code:databases.data.ret_code
  }
}
exports.getBackUp = function* () {
    const cluster = this.params.cluster
    const loginUser = this.session.loginUser
    const api = apiFactory.getK8sApi(loginUser)
    const basicInfo = this.request.body

    const result = yield api.createBy([cluster,'snapshots'],null,basicInfo);

    const databases = result || []
    this.body = {
        cluster,
        backUpList: databases.data,
        total_count: databases.data.total_count,
        action:databases.data.action,
        ret_code:databases.data.ret_code
    }
}
exports.getBackUpList=function* () {
    const cluster = this.params.cluster
    const id=this.params.id
    const loginUser = this.session.loginUser
    const query = this.query||{}
    const api = apiFactory.getK8sApi(loginUser)
    const result = yield api.getBy([cluster,'snapshots',id],query);
    const databases = result || []
    this.body = {
        cluster,
        getBackUpList: databases.data,
        total_count: databases.data.total_count,
        action:databases.data.action,
        ret_code:databases.data.ret_code
    }
}

// get monitor list Yao.wei
exports.getMonitor = function* () {
    const cluster = this.params.cluster
  const type = this.params.type
  const id = this.params.node
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const query = this.query||{}
  const result = yield api.getBy([cluster, type, id, 'monitor'],query);
  const databases = result || []

    this.body = {
    cluster,
    nodesMonitorList: databases.data,
    action:databases.data.action,
    ret_code:databases.data.ret_code
  }
}

exports.getMonitorMetric= function* () {
    const cluster = this.params.cluster
    const type = this.params.type
    const id = this.params.node
    const loginUser = this.session.loginUser
    const api = apiFactory.getK8sApi(loginUser)
    const query = this.query||{}
    const result = yield api.getBy([cluster, type, id, 'monitor'],query);
    const databases = result || []
    this.body = {
        cluster,
        MonitorMetricList: databases.data,
        action:databases.data.action,
        ret_code:databases.data.ret_code
    }
}
// get caches config  Yao.wei
exports.getCachesConfig = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'cacheParameterGroups'],null);
  const databases = result || []
  this.body = {
    cluster,
    databaseList: databases.data.cache_parameter_group_set,
    total_count: databases.data.total_count,
    action:databases.data.action,
    ret_code:databases.data.ret_code
  }
}

/*获取数据库节点 ======dujy*/
exports.getDatabaseNodes = function* () {
    const cluster = this.params.cluster;
    const type=this.params.type;
    const mongoId=this.params.mongoId;
    const loginUser = this.session.loginUser
    const api = apiFactory.getK8sApi(loginUser)
    const result = yield api.getBy([cluster,type,mongoId,'nodes']);
    const databases = result || []

    this.body = {
        cluster,
        databaseList:databases
    }
}

/* getDatabaseParameters*/
exports.getDatabaseParameters = function* () {
    const cluster = this.params.cluster;
    const type=this.params.type;
    const id=this.params.id;
    const loginUser = this.session.loginUser
    const api = apiFactory.getK8sApi(loginUser)
    const result = yield api.getBy([cluster,type,id,'parameters']);
    const databases = result || []
    this.body = {
        cluster,
        paramtersList:databases
    }
}



exports.getModifyParameters = function* () {
    const cluster = this.params.cluster
    const mongoId = this.params.mongoId
    const type=this.params.type
    const loginUser = this.session.loginUser
    const basicInfo = this.request.body
    const api = apiFactory.getK8sApi(loginUser)
    const result = yield api.updateBy([cluster,type,mongoId,'parameters'],null,basicInfo);
    const databases = result || []
    this.body = {
        cluster,
        paramters:databases
    }
}
exports.updateCachesConfig = function* () {
  const cluster = this.params.cluster
  const id = this.params.id
  const loginUser = this.session.loginUser
  const basicInfo = this.request.body
  const api = apiFactory.getK8sApi(loginUser)

  const result = yield api.updateBy([cluster, 'cacheParameterGroups',id],null,basicInfo);
  const databases = result || []
  this.body = {
    databases
  }
}

exports.scaleDBService = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const serviceName = this.params.name
  // {"replicas": 3}
  const body = this.request.body

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.patchBy([cluster, 'statefulsets', serviceName], null, body);

  this.body = {
    result
  }
}

exports.scaleState = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const serviceName = this.params.name
  // {"replicas": 3}
  const body = this.request.body
  const query = this.query
  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.updateBy([cluster, 'statefulsets', serviceName], query, null);

  this.body = {
    result
  }
}

exports.getDBService = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const serviceName = this.params.name

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'statefulsets', serviceName], null);
  const database = result.data || []

  // Get redis password from init container
  let initEnv = []
  let isRedis = false
  if (database.petsetSpec.template) {
    let podTemplate = database.petsetSpec.template
    if (podTemplate.metadata.labels && podTemplate.metadata.labels[PetsetLabel] == 'redis') {
      isRedis = true
      // For redis, get password from init container
      if (podTemplate.metadata.annotations['pod.alpha.kubernetes.io/init-containers']) {
        let initContainers = JSON.parse(podTemplate.metadata.annotations['pod.alpha.kubernetes.io/init-containers'])
        initContainers.forEach(function (c) {
          if (c.name === 'install' && c.env) {
            c.env.forEach(function (e) {
              if (e.name === 'REDIS_PASSWORD') {
                initEnv.push({
                  name: e.name,
                  value: e.value
                })
              }
            })
          }
        })
      }
    }
  }
  // Remove some data
  if (database.objectMeta) {
    delete database.objectMeta.labels
  }
  delete database.typeMeta
  delete database.eventList
  if (database.podList && database.podList.pods) {
    database.podList.pods.forEach(function (pod) {
      if (!pod.podSpec.containers[0].env) {
        pod.podSpec.containers[0].env = []
      }
      // For redis, use password from init container
      if (isRedis) {
        pod.podSpec.containers[0].env = initEnv
      }
      if (pod.objectMeta) {
        delete pod.objectMeta.labels
        delete pod.objectMeta.annotations
        delete pod.annotations
      }
    })
  }
  if (database.petsetSpec) {
    database.volumeInfo = {
      // Use the first pvc for now
      size: database.petsetSpec.volumeClaimTemplates[0].spec.resources.requests.storage
    }
    delete database.petsetSpec
  }
  if (database.serviceInfo) {
    delete database.serviceInfo.labels
    delete database.serviceInfo.selector
  }

  this.body = {
    cluster,
    database
  }
}


exports.stateDetail = function* () {
  const cluster = this.params.cluster
  const loginUser = this.session.loginUser
  const serviceName = this.params.name

  const api = apiFactory.getK8sApi(loginUser)
  const result = yield api.getBy([cluster, 'statefulsets', serviceName], null);
  const database = result.data || []
  let initEnv = []
  let isRedis = false
  if (database.statefulSetSpec.template) {
    let podTemplate = database.statefulSetSpec.template
    if (podTemplate.metadata.labels && podTemplate.metadata.labels[PetsetLabel] == 'redis') {
      isRedis = true
      // For redis, get password from init container
      if (podTemplate.metadata.annotations['pod.alpha.kubernetes.io/init-containers']) {
        let initContainers = JSON.parse(podTemplate.metadata.annotations['pod.alpha.kubernetes.io/init-containers'])
        initContainers.forEach(function (c) {
          if (c.name === 'install' && c.env) {
            c.env.forEach(function (e) {
              if (e.name === 'REDIS_PASSWORD') {
                initEnv.push({
                  name: e.name,
                  value: e.value
                })
              }
            })
          }
        })
      }
    }
  }
  // Remove some data
  if (database.objectMeta) {
    delete database.objectMeta.labels
  }
  delete database.typeMeta
  delete database.eventList
  if (database.podList && database.podList.pods) {
    database.podList.pods.forEach(function (pod) {
      if (!pod.podSpec.containers[0].env) {
        pod.podSpec.containers[0].env = []
      }
      // For redis, use password from init container
      if (isRedis) {
        pod.podSpec.containers[0].env = initEnv
      }
      if (pod.objectMeta) {
        delete pod.objectMeta.labels
        delete pod.objectMeta.annotations
        delete pod.annotations
      }
    })
  }
  if (database.statefulSetSpec) {
    database.volumeInfo = {
      // Use the first pvc for now
      size: database.statefulSetSpec.volumeClaimTemplates[0].spec.resources.requests.storage
    }
    delete database.statefulSetSpec
  }
  if (database.serviceInfo) {
    delete database.serviceInfo.labels
    delete database.serviceInfo.selector
  }
  this.body = {
    cluster,
    database
  }
}

function getRegistryURL() {
  // Global check
  if (registryConfigLoader.GetRegistryConfig() && registryConfigLoader.GetRegistryConfig().url) {
    let url = registryConfigLoader.GetRegistryConfig().url
    if (url.indexOf('://') > 0) {
      url = url.split('://')[1]
    }
    return url
  }
  // Default registry url
  return "localhost"
}