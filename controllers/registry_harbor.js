/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Registry controller for Harbor
 *
 * v0.1 - 2017-06-02
 */
'use strict'

const logger     = require('../utils/logger.js').getLogger("registry_harbor")
const harborAPIs = require('../registry/lib/harborAPIs')
const registryConfigLoader = require('../registry/registryConfigLoader')
const constants = require('../constants')
const utils = require('../utils')

const securityUtil = require('../utils/security')

// [GET] /projects/search
exports.searchProjects = harborHandler(
  (harbor, ctx, callback) => {
    harbor.searchProjects(ctx.query.q, callback)
  }
)

// [GET] /users/systeminfo
exports.getSysteminfo = harborHandler(
  (harbor, ctx, callback) => {
    harbor.getSysteminfo(callback)
  }
)

// [GET] /users/current
exports.getCurrentUserCtl = function* () {
  const result = yield getCurrentUser(this.session.loginUser)
  const body = {
    server: getRegistryConfig().url,
    data: result,
  }
  this.body = body
}

function* getCurrentUser(loginUser) {
  const config = getRegistryConfig()
  const auth = yield getAuthInfo(loginUser)
  const harbor = new harborAPIs(config, auth)
  return new Promise((resolve, reject) => {
    harbor.getCurrentUser((err, statusCode, body) => {
      if (err) {
        reject(err)
        return
      }
      resolve(body)
    })
  })
}

exports.getCurrentUser = getCurrentUser

// [GET] /projects?page=1&page_size=10&page_name=test&is_public=1
exports.getProjects = harborHandler(
  (harbor, ctx, callback) => harbor.getProjects(ctx.query, callback))

// [POST] /projects
exports.createProject = harborHandler(
  (harbor, ctx, callback) => harbor.createProject(ctx.request.body, callback))

// [DELETE] /repositories/:user/:name
exports.deleteRepository = harborHandler(
  (harbor, ctx, callback) => {
    const repoName = `${ctx.params.user}/${ctx.params.name}`
    harbor.deleteRepository(repoName, callback)
  }
)

// [GET] /repositories/:user/:name/tags
exports.getRepositoriesTags = harborHandler(
  (harbor, ctx, callback) => {
    const repoName = `${ctx.params.user}/${ctx.params.name}`
    harbor.getRepositoriesTags(repoName, callback)
  }
)
// [GET] /repositories/:user/:name/tags/configinfo
exports.getRepositoriyConfig = function* () {
  const config = getRegistryConfig()
  const loginUser = this.session.loginUser
  const auth = yield getAuthInfo(loginUser)
  const harbor = new harborAPIs(config, auth)
  const repoName = `${this.params.user}/${this.params.name}`
  const tag = this.params.tag
  const result = yield new Promise((resolve, reject) => {
    harbor.getRepositoriesManifest(repoName, tag, (err, statusCode, body) => {
      if(statusCode != 200) {
        let message = ''
        if (body && body.errors) {
          message = body.errors[0].message
        } else {
          message = body
        }
        const err = new Error(message)
        err.status = statusCode
        return reject(err)
      }
      if(body.config) {
        body.config = JSON.parse(body.config)
      }
      const manifest = body.manifest
      let size = 0
      if(manifest && manifest.layers) {
        manifest.layers.forEach(layer => {
          size += layer.size
        })
      }
      if(!body.config) {
        body.config = {}
      }
      body.config.size = size
      resolve(body.config)
    })
  })
  this.body = {
    data: result ? _formatConfig(result) : {},
    server: config.url
  }
}

function _formatConfig(configInfo) {
  const config = configInfo.config || {}
  const body = {
    defaultEnv: config.Env,
    mountPath: config.Volumes,
    cmd: config.Cmd,
    entrypoint: config.Entrypoint,
    sizeInfo: {
      totalSize: configInfo.size
    }
  }
  body.containerPorts = []
  if(config.ExposedPorts) {
    body.containerPorts = Object.getOwnPropertyNames(config.ExposedPorts)
  }
  return body
}

// [GET] /projects/:project_id
exports.getProjectDetail = harborHandler(
  (harbor, ctx, callback) => harbor.getProjectDetail(ctx.params.project_id, callback))

// [DELETE] /projects/:project_id
exports.deleteProject = harborHandler(
  (harbor, ctx, callback) => harbor.deleteProject(ctx.params.project_id, callback))

// [PUT] /projects/:project_id/publicity
exports.updateProjectPublicity = harborHandler(
  (harbor, ctx, callback) => harbor.updateProjectPublicity(ctx.params.project_id, ctx.request.body, callback))

// [GET] /projects/:project_id/user_id
exports.getProjectMembers = harborHandler(
  (harbor, ctx, callback) => harbor.getProjectMembers(ctx.params.project_id, ctx.query, callback))

// [POST] /projects/:project_id/user_id
exports.addProjectMember = harborHandler(
  (harbor, ctx, callback) => harbor.addProjectMember(ctx.params.project_id, ctx.request.body, callback))

// [PUT] /projects/:project_id/user_id/:user_id
exports.updateProjectMember = harborHandler(
  (harbor, ctx, callback) => harbor.updateProjectMember(ctx.params.project_id, ctx.params.user_id, ctx.request.body, callback))

// [DELETE] /projects/:project_id/user_id/:user_id
exports.deleteProjectMember = harborHandler(
  (harbor, ctx, callback) => harbor.deleteProjectMember(ctx.params.project_id, ctx.params.user_id, callback))

// [GET] /repositories
exports.getProjectRepositories = harborHandler(
  (harbor, ctx, callback) => harbor.getProjectRepositories(ctx.query, callback))

// [GET] /statistics
exports.getStatistics = harborHandler(
  (harbor, ctx, callback) => {
    const query = utils.isEmptyObject(ctx.query) ? null : ctx.query
    harbor.getStatistics(query, callback)
  })


/*------------------log start------------------------*/
exports.getLogs = harborHandler(
  (harbor, ctx, callback) => {
    const query = utils.isEmptyObject(ctx.query) ? null : ctx.query
    harbor.getLogs(query, callback)
  })

exports.getProjectLogs = harborHandler(
  (harbor, ctx, callback, headers) => {
    const projectID = ctx.params.projectID
    const query = utils.isEmptyObject(ctx.query) ? null : ctx.query
    const body = ctx.request.body
    body.project_id = parseInt(projectID)
    harbor.getProjectLogs(projectID, query, body, callback)
  })

/*------------------log end-------------------------*/


/*------------------systeminfo start--------------------------------*/

exports.getSystemInfo = harborHandler(
  (harbor, ctx, callback) => {
    harbor.getSystemInfo(callback)
  })

exports.getSystemInfoVolumes = harborHandler(
  (harbor, ctx, callback) => {
    harbor.getSystemInfoVolumes(callback)
  })

exports.getSystemInfoCert = harborHandler(
  (harbor, ctx, callback) => {
    harbor.getSystemInfoCert(callback)
  })
/*------------------systeminfo end--------------------------------*/


/*------------------configurations start--------------------------------*/

exports.getConfigurations = harborHandler(
  (harbor, ctx, callback) => {
    harbor.getConfigurations(callback)
  })

exports.updateConfigurations = harborHandler(
  (harbor, ctx, callback) => {
    const body = utils.isEmptyObject(ctx.request.body) ? null : ctx.request.body
    harbor.updateConfigurations(body, callback)
  })

exports.resetConfigurations = harborHandler(
  (harbor, ctx, callback) => {
    harbor.resetConfigurations(callback)
  })
/*------------------configurations end--------------------------------*/

// [GET] /jobs/replication
exports.getReplicationJobs = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationJobs(ctx.query, callback))

// [DELETE] /jobs/replication/{id}
exports.deleteReplicationJob = harborHandler(
  (harbor, ctx, callback) => harbor.deleteReplicationJob(ctx.params.id, callback))

// [GET] /jobs/replication/{id}/log
exports.getReplicationJobLogs = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationJobLogs(ctx.params.id, callback))

// [GET] /policies/replication
exports.getReplicationPolicies = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationPolicies(ctx.query, callback))

// [POST] /policies/replication
exports.newReplicationPolicy = harborHandler(
  (harbor, ctx, callback) => harbor.newReplicationPolicy(ctx.request.body, callback))

// [GET] /policies/replication/{id}
exports.getReplicationPolicy = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationPolicy(ctx.params.id, callback))

// [DELETE] /policies/replication/{id}
exports.deleteReplicationPolicy = harborHandler(
  (harbor, ctx, callback) => harbor.deleteReplicationPolicy(ctx.params.id, callback))

// [PUT] /policies/replication/{id}
exports.modifyReplicationPolicy = harborHandler(
  (harbor, ctx, callback) => harbor.modifyReplicationPolicy(ctx.params.id, ctx.request.body, callback))

// [PUT] /policies/replication/{id}/enablement  -- { enable: 0 } / { enable: 1 }
exports.enableReplicationPolicy = harborHandler(
  (harbor, ctx, callback) => harbor.enableReplicationPolicy(ctx.params.id, ctx.request.body, callback))

// [GET] /targets
exports.getReplicationTargets = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationTargets(ctx.query, callback))

// [POST] /targets
exports.newReplicationTarget = harborHandler(
  (harbor, ctx, callback) => harbor.newReplicationTarget(ctx.request.body, (err, statusCode, result, headers) => {
    if (statusCode === 201 && headers.hasOwnProperty('location') && headers.location) {
      const targetIDRule = /(?:^|\s)\/api\/targets\/(\d+?)(?:\s|$)/g
      const match = targetIDRule.exec(headers.location)
      const targetID = Number(match[1])
      callback(null, 201, {id: targetID}, {})
    } else {
      callback(err, statusCode, result, headers)
    }
  })
)

// [POST] /targets/ping
exports.pingReplicationTarget = harborHandler(
  (harbor, ctx, callback) => harbor.pingReplicationTarget(ctx.request.body, callback))

// [POST] /targets/{id}/ping
exports.pingReplicationTargetByID = harborHandler(
  (harbor, ctx, callback) => harbor.pingReplicationTargetByID(ctx.params.id, callback))

// [PUT] /targets/{id}
exports.modifyReplicationTarget = harborHandler(
  (harbor, ctx, callback) => harbor.modifyReplicationTarget(ctx.params.id, ctx.request.body, callback))

// [GET] /targets/{id}
exports.getReplicationTarget = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationTarget(ctx.params.id, callback))

// [DELETE] /targets/{id}
exports.deleteReplicationTarget = harborHandler(
  (harbor, ctx, callback) => harbor.deleteReplicationTarget(ctx.params.id, callback))

// [GET] /targets/{id}/policies
exports.getReplicationTargetRelatedPolicies = harborHandler(
  (harbor, ctx, callback) => harbor.getReplicationTargetRelatedPolicies(ctx.params.id, callback))

exports.getReplicationSummary = harborHandler(
  (harbor, ctx, callback) => next(null, null, null, ensureUserHasAdminRole, callback, harbor, ctx, {})
)

function next(err, statusCode, body, successor, predecessor, harbor, ctx, result) {
  if (err || statusCode > 300) {
    predecessor(err, statusCode, body)
  } else {
    successor(harbor, ctx, predecessor, result)
  }
}

function ensureUserHasAdminRole(harbor, ctx, callback, result) {
  harbor.getCurrentUser((err, statusCode, body) => {
    next(err, statusCode, body, (harbor, ctx, callback, result) => {
      if (body.has_admin_role === 0) {
        const err = new Error("only admin role can access replications")
        err.status = 401
        callback(err, 401, {})
      } else {
        getReplicationPolicies(harbor, ctx, callback, result)
      }
    }, callback, harbor, ctx, result)
  })
}

function getReplicationPolicies(harbor, ctx, callback, result) {
  harbor.getReplicationPolicies({project_id: ctx.params.id}, (err, statusCode, body) => {
    next(err, statusCode, body, (harbor, ctx, callback, result) => {
      result.policies = body ? body : []
      getReplicationJobs(harbor, ctx, callback, result)
    }, callback, harbor, ctx, result)
  })
}

function JobsIterator(result, policyIDs, harbor, ctx, callback) {
  this.result = result
  this.jobs = []
  this.callback = callback
  this.harbor = harbor
  this.ctx = ctx
  this.ids = policyIDs
  this.count = policyIDs.length
  this.index = 0
}

JobsIterator.prototype.next = function (err, statusCode, body) {
  if (err || statusCode > 300) {
    this.callback(err, statusCode, body)
  } else {
    if (body) {
      this.jobs = this.jobs.concat(body)
    }
    if (this.end()) {
      this.result.jobs = this.jobs
      next(err, statusCode, body, getReplicationTargets, this.callback, this.harbor, this.ctx, this.result)
    } else {
      this.harbor.getReplicationJobs({policy_id: this.currentPolicyID()}, this.next.bind(this))
    }
  }
}

JobsIterator.prototype.end = function () {
  return ++this.index >= this.count
}

JobsIterator.prototype.currentPolicyID = function () {
  return this.ids[this.index]
}

function getReplicationJobs(harbor, ctx, callback, result) {
  const policyIDs = result.policies.map(policy => policy.id)
  const count = policyIDs.length
  if (count > 0) {
    const iterator = new JobsIterator(result, policyIDs, harbor, ctx, callback)
    harbor.getReplicationJobs({policy_id: policyIDs[0]}, iterator.next.bind(iterator))
  } else {
    next(null, null, null, (harbor, ctx, callback, result) => {
      result.jobs = []
      getReplicationTargets(harbor, ctx, callback, result)
    }, callback, harbor, ctx, result)
  }
}

function getReplicationTargets(harbor, ctx, callback, result) {
  harbor.getReplicationTargets({}, (err, statusCode, body) => {
    next(err, statusCode, body, (harbor, ctx, callback, result) => {
      const resolve = callback
      result.targets = body ? body : []
      resolve(null, 200, result)
    }, callback, harbor, ctx, result)
  })
}

function getRegistryConfig() {
  // Global check
  if (registryConfigLoader.GetRegistryConfig() && registryConfigLoader.GetRegistryConfig().url) {
    return registryConfigLoader.GetRegistryConfig()
  }
  // Default registry url
  return {url: "localhost"}
}

/*
Get registry auth info from user session
*/
function* getAuthInfo(loginUser) {
  return securityUtil.decryptContent(loginUser.registryAuth)
}

function harborHandler(handler) {
  return function* () {
    const config = getRegistryConfig()
    const loginUser = this.session.loginUser
    const auth = yield getAuthInfo(loginUser)
    const harbor = new harborAPIs(config, auth)
    const result = yield new Promise((resolve, reject) => {

      handler(harbor, this, (err, statusCode, result, headers) => {
        if (err) {
          reject(err)
        } else if (statusCode > 300) {
          err = new Error("请求镜像仓库错误，错误代码：" + statusCode)
          err.status = statusCode
          reject(err)
        } else {
          resolve({ result, headers })
        }
      })
    })
    const body = {
      server: getRegistryConfig().url,
      data: result.result,
      headers:result.headers
    }
    if (result.hasOwnProperty('headers')
      && result.headers
      && result.headers.hasOwnProperty('x-total-count')
      && result.headers['x-total-count']) {
      body.total = parseInt(result.headers['x-total-count'])
    }
    if(result.headers.location){
      body.project_id = result.headers.location.split('/')[3]
    }
    this.body = body
  }
}
