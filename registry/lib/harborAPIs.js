/*
* Licensed Materials - Property of paas.enncloud.cn
* (C) Copyright 2017 TenX Cloud. All Rights Reserved.
*/

/* Util classes for harbor registry API
 * Document reference: https://github.com/vmware/harbor
 *
 * v0.1 - 2017-06-02
 * @author Wang Lei
*/
'use strict'


var logger = require('../../utils/logger').getLogger('harborAPIs');
const utils = require('../../utils')
var request = require('request');
var async = require('async');
var queryString = require ('querystring')
var registryConfigLoader = require('../registryConfigLoader')

/*
 * Docker registry APIs
 */
function HarborAPIs(registryConfig, authInfo) {
  if (registryConfig) {
    this.registryConfig = registryConfig
  } else {
    // Get registry config from registry loader
    this.registryConfig = registryConfigLoader.GetRegistryConfig()
  }
  this.authInfo = authInfo
}

HarborAPIs.prototype.searchProjects = function (query, callback) {
  var method = "searchProjects";
  logger.debug(method, "Search harbor projects and repositories");

  // If no callback, then will use the 1st parameter as callback, so we can do search all by default
  var requestUrl = this.getAPIPrefix() + "/search";
  if (!callback) {
    callback = query
  } else {
    // Matching all q/page/n to do the search
    if (query) {
      requestUrl += "?q=" + query
    }
  }
  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback);
};

HarborAPIs.prototype.getStatistics = function (query, callback) {
  var method = "getStatistics"
  logger.debug(method, "Get statistics of projects and repositories")

  // If no callback, then will use the 1st parameter as callback, so we can do search all by default
  var requestUrl = this.getAPIPrefix() + "/statistics"
  logger.debug(method, "Request url: " + requestUrl)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

// [GET] /jobs/replication
HarborAPIs.prototype.getReplicationJobs = function (query, callback) {
  const url = `${this.getAPIPrefix()}/jobs/replication${encodeQueryString(query)}`
  this.sendRequest(url, 'GET', null, callback)
}

// [DELETE] /jobs/replication/{id}
HarborAPIs.prototype.deleteReplicationJob = function (id, callback) {
  const url = `${this.getAPIPrefix()}/jobs/replication/${id}`
  this.sendRequest(url, 'DELETE', null, callback)
}

// [GET] /jobs/replication/{id}/log
HarborAPIs.prototype.getReplicationJobLogs = function (id, callback) {
  const url = `${this.getAPIPrefix()}/jobs/replication/${id}/log`
  this.sendRequest(url, 'GET', null, callback)
}

// [GET] /policies/replication
HarborAPIs.prototype.getReplicationPolicies = function (query, callback) {
  const url = `${this.getAPIPrefix()}/policies/replication${encodeQueryString(query)}`
  this.sendRequest(url, 'GET', null, callback)
}

// [POST] /policies/replication
HarborAPIs.prototype.newReplicationPolicy = function (policy, callback) {
  const url = `${this.getAPIPrefix()}/policies/replication`
  this.sendRequest(url, 'POST', policy, callback)
}

// [GET] /policies/replication/{id}
HarborAPIs.prototype.getReplicationPolicy = function (id, callback) {
  const url = `${this.getAPIPrefix()}/policies/replication/${id}`
  this.sendRequest(url, 'GET', null, callback)
}

// [DELETE] /policies/replication/{id}
HarborAPIs.prototype.deleteReplicationPolicy = function (id, callback) {
  const url = `${this.getAPIPrefix()}/policies/replication/${id}`
  this.sendRequest(url, 'DELETE', null, callback)
}

// [PUT] /policies/replication/{id}
HarborAPIs.prototype.modifyReplicationPolicy = function (id, policy, callback) {
  const url = `${this.getAPIPrefix()}/policies/replication/${id}`
  this.sendRequest(url, 'PUT', policy, callback)
}

// [PUT] /policies/replication/{id}/enablement  -- { enable: 0 } / { enable: 1 }
HarborAPIs.prototype.enableReplicationPolicy = function (id, enable, callback) {
  const url = `${this.getAPIPrefix()}/policies/replication/${id}/enablement`
  this.sendRequest(url, 'PUT', enable, callback)
}

// [GET] /targets
HarborAPIs.prototype.getReplicationTargets = function (query, callback) {
  const url = `${this.getAPIPrefix()}/targets` //${encodeQueryString(query)}
  this.sendRequest(url, 'GET', null, callback)
}

// [POST] /targets
HarborAPIs.prototype.newReplicationTarget = function (target, callback) {
  const url = `${this.getAPIPrefix()}/targets`
  this.sendRequest(url, 'POST', target, callback)
}

// [POST] /targets/ping
HarborAPIs.prototype.pingReplicationTarget = function (target, callback) {
  const url = `${this.getAPIPrefix()}/targets/ping`
  this.sendRequest(url, 'POST', target, callback)
}

// [POST] /targets/{id}/ping
HarborAPIs.prototype.pingReplicationTargetByID = function (id, callback) {
  const url = `${this.getAPIPrefix()}/targets/${id}/ping`
  this.sendRequest(url, 'POST', null, callback)
}

// [PUT] /targets/{id}
HarborAPIs.prototype.modifyReplicationTarget = function (id, target, callback) {
  const url = `${this.getAPIPrefix()}/targets/${id}`
  this.sendRequest(url, 'PUT', target, callback)
}

// [GET] /targets/{id}
HarborAPIs.prototype.getReplicationTarget = function (id, callback) {
  const url = `${this.getAPIPrefix()}/targets/${id}`
  this.sendRequest(url, 'GET', null, callback)
}

// [DELETE] /targets/{id}
HarborAPIs.prototype.deleteReplicationTarget = function (id, callback) {
  const url = `${this.getAPIPrefix()}/targets/${id}`
  this.sendRequest(url, 'DELETE', null, callback)
}

// [GET] /targets/{id}/policies
HarborAPIs.prototype.getReplicationTargetRelatedPolicies = function (id, callback) {
  const url = `${this.getAPIPrefix()}/targets/${id}/policies`
  this.sendRequest(url, 'GET', null, callback)
}


HarborAPIs.prototype.deleteRepository = function(name, callback) {
  const method = 'deleteRepository'
  logger.debug(method, `delete repo`)
  const requestUrl =`${this.getAPIPrefix()}/repositories/${name}/tags`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'DELETE', null, callback)
}

HarborAPIs.prototype.getRepositoriesTags = function(name, callback) {
  const method = 'getRepositoriesTags'
  logger.debug(method, `Get Repos tags`)
  const requestUrl =`${this.getAPIPrefix()}/repositories/${name}/tags`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

HarborAPIs.prototype.getRepositoriesManifest = function(name, tag, callback) {
  const method = 'getRepositoriesManifest'
  logger.debug(method, `Get Repos tags`)
  const requestUrl =`${this.getAPIPrefix()}/repositories/${name}/tags/${tag}/manifest`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

/*----------------log start---------------*/

HarborAPIs.prototype.getLogs = function(query, callback) {
  const method = 'getLog'
  logger.debug(method, 'Get user recent log')
  let requestUrl = `${this.getAPIPrefix()}/logs`
  if(typeof query == 'function') {
    callback = query
    query = null
  } else {
    if(query) {
      requestUrl += `?${queryString.stringify(query)}`
    }
  }
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

HarborAPIs.prototype.getProjectLogs = function(projectID, query, data, callback) {
  const method = 'getProjectLogs'
  logger.debug(method, `Get project logs`)
  let requestUrl = `${this.getAPIPrefix()}/projects/${projectID}/logs/filter`
  if(typeof projectID != 'string') {
    const err = new Error('project is require')
    return callback(err)
  }
  if(typeof query == 'function') {
    callback = query
    query = null
  }
  if(typeof data == 'function') {
    callback = data
    data = null
  }
  if(query) {
    requestUrl += `?${queryString.stringify(query)}`
  }
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'POST', data, callback)
}

/*----------------log end---------------*/

/*----------------systeminfo start---------------*/

HarborAPIs.prototype.getSystemInfo = function(callback) {
  const method = 'getSystemInfo'
  logger.debug(method, `Get SystemInfo`)
  const requestUrl = `${this.getAPIPrefix()}/systeminfo`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

HarborAPIs.prototype.getSystemInfoVolumes = function(callback) {
  const method = 'getSystemInfoVolumes'
  logger.debug(method, `Get SystemInfoVolumes`)
  const requestUrl = `${this.getAPIPrefix()}/systeminfo/volumes`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

HarborAPIs.prototype.getSystemInfoCert = function(callback) {
  const method = 'getSystemInfoCert'
  logger.debug(method, `Get SystemInfoCert`)
  const requestUrl = `${this.getAPIPrefix()}/systeminfo/getcert`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}


/*----------------systeminfo end---------------*/



/*----------------configurations start---------------*/

HarborAPIs.prototype.getConfigurations = function(callback) {
  const method = 'getConfiguratoins'
  logger.debug(method, `Get Configurations`)
  const requestUrl = `${this.getAPIPrefix()}/configurations`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'GET', null, callback)
}

HarborAPIs.prototype.updateConfigurations = function(data, callback) {
  const method = 'updateConfiguratoins'
  logger.debug(method, `Update Configurations`)
  const requestUrl = `${this.getAPIPrefix()}/configurations`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'PUT', data, callback)
}

HarborAPIs.prototype.resetConfigurations = function(callback) {
  const method = 'resetConfiguratoins'
  logger.debug(method, `Reset Configurations`)
  const requestUrl = `${this.getAPIPrefix()}/configurations/reset`
  logger.debug(method, `Request url: ${requestUrl}`)
  this.sendRequest(requestUrl, 'POST', null, callback)
}

/*----------------configurations end---------------*/

// [GET] /users/systeminfo
HarborAPIs.prototype.getSysteminfo = function (callback) {
  const url = `${this.getAPIPrefix()}/systeminfo`
  this.sendRequest(url, 'GET', null, callback)
}

// [GET] /users/current
HarborAPIs.prototype.getCurrentUser = function (callback) {
  const url = `${this.getAPIPrefix()}/users/current`
  this.sendRequest(url, 'GET', null, callback)
}

// [GET] /projects?page=1&page_size=10&page_name=test&is_public=1
HarborAPIs.prototype.getProjects = function (query, callback) {
  var method = "getProjects";
  logger.debug(method, "Get harbor projects");

  // If no callback, then will use the 1st parameter as callback, so we can do search all by default
  var requestUrl = this.getAPIPrefix() + "/projects";
  if (!callback) {
    callback = query
  } else {
    if (query) {
      requestUrl += `?${utils.toQuerystring(query)}`
    }
  }
  logger.debug(method, "Request url: " + requestUrl);
  this.sendRequest(requestUrl, 'GET', null, callback);
}

// [POST] /projects
HarborAPIs.prototype.createProject = function (body, callback) {
  const url = `${this.getAPIPrefix()}/projects`
  this.sendRequest(url, 'POST', body, callback)
}

// [GET] /projects/:project_id
HarborAPIs.prototype.getProjectDetail = function (id, callback) {
  const url = `${this.getAPIPrefix()}/projects/${id}`
  this.sendRequest(url, 'GET', null, callback)
}

// [DELETE] /projects/:project_id
HarborAPIs.prototype.deleteProject = function (id, callback) {
  const url = `${this.getAPIPrefix()}/projects/${id}`
  this.sendRequest(url, 'DELETE', null, callback)
}

// [PUT] /projects/:project_id/publicity
HarborAPIs.prototype.updateProjectPublicity = function (id, body, callback) {
  const url = `${this.getAPIPrefix()}/projects/${id}/publicity`
  this.sendRequest(url, 'PUT', body, callback)
}

// [GET] /projects/:project_id/members
HarborAPIs.prototype.getProjectMembers = function (id, query, callback) {
  const url = `${this.getAPIPrefix()}/projects/${id}/members?${utils.toQuerystring(query)}`
  this.sendRequest(url, 'GET', null, callback)
}

// [POST] /projects/:project_id/members
HarborAPIs.prototype.addProjectMember = function (id, body, callback) {
  const url = `${this.getAPIPrefix()}/projects/${id}/members`
  this.sendRequest(url, 'POST', body, callback)
}

// [PUT] /projects/:project_id/members/:user_id
HarborAPIs.prototype.updateProjectMember = function (project_id, user_id, body, callback) {
  const url = `${this.getAPIPrefix()}/projects/${project_id}/members/${user_id}`
  this.sendRequest(url, 'PUT', body, callback)
}

// [DELETE] /projects/:project_id/members/:user_id
HarborAPIs.prototype.deleteProjectMember = function (project_id, user_id, callback) {
  const url = `${this.getAPIPrefix()}/projects/${project_id}/members/${user_id}`
  this.sendRequest(url, 'DELETE', null, callback)
}

// [GET] /repositories
HarborAPIs.prototype.getProjectRepositories = function (query, callback) {
  const url = `${this.getAPIPrefix()}/repositories?${utils.toQuerystring(query)}`
  this.sendRequest(url, 'GET', null, callback)
}

HarborAPIs.prototype.sendRequest = function (requestUrl, httpMethod, data, callback) {
  var method = "sendRequest";
  logger.info(method, "Sending request: " + requestUrl);
  var requestAction = request.get;
  data = (data == null ? "" : data)
  if (httpMethod == 'POST') {
    requestAction = request.post;
  } else if (httpMethod == 'PUT') {
    requestAction = request.put;
  } else if (httpMethod == 'DELETE') {
    requestAction = request.del;
  }
  logger.debug(method, this.getAuthorizationHeader());
  logger.debug(method, data);
  requestAction({
    url: requestUrl,
    json: true,
    body: data,
    headers: this.getAuthorizationHeader()
  }, function (err, resp, body) {
    if (err) {
      logger.error(method, err);
      callback(err, 500, body);
      return;
    }
    if (callback) {
      var statusCode = resp ? resp.statusCode : 200;
      if (!resp) {
        logger.error("No response? " + resp);
      }
      callback(err, resp.statusCode, body, resp.headers);
    }
  });
};

/*
For registry v2 extension service
*/
HarborAPIs.prototype.getAPIPrefix = function () {
  var APIPrefix = this.registryConfig.url + '/api'
  return APIPrefix
}

HarborAPIs.prototype.getAuthorizationHeader = function () {
  return {
    'Authorization': 'Basic ' + this.authInfo
  }
}

function encodeQueryString(kvs) {
  const query = Object.getOwnPropertyNames(kvs).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(kvs[key])}`).join('&')
  if (query) {
    return '?' + query
  }
  return ''
}

function range(begin, end) {
  const count = end - begin
  return Array.apply(null, Array(count)).map((_, index) => index + begin)
}

function parseAuthParameter(query, parameter) {
  const removeQuote = JSON.parse
  const kv = parameter.split('=')
  const key = kv[0]
  const value = removeQuote(kv[1])
  query[key] = value
  return query
}

function getRequestBearerTokenURL(realm) {
  const removeQuote = JSON.parse
  const params = realm.split(',').map(param => param.trim())
  const authURL = removeQuote(params[0].split('=')[1])
  const query = range(1, params.length).reduce(
    (query, index) => parseAuthParameter(query, params[index]), {})
  return `${authURL}${encodeQueryString(query)}`
}

HarborAPIs.prototype.basicAuthToBearerToken = function (realm, callback) {
  const url = getRequestBearerTokenURL(realm)
  this.sendRequest(url, 'GET', null, callback)
}

HarborAPIs.prototype.getManifest = function (repoName, tag, callback) {
  const registry = this.registryConfig.url
  const url = `${registry}/v2/${repoName}/manifests/${tag}`
  request.get({url, json: true}, (err, resp, body) => {
    if (resp.statusCode == 401) {
      const realm = resp.headers['www-authenticate']
      this.basicAuthToBearerToken(realm, (err, statusCode, result) => {
        if (err) {
          callback(err, statusCode, result)
        } else {
          const token = result.token
          const headers = {'Authorization': `Bearer ${token}`}
          request.get({url, json: true, headers}, (err, resp, body) => {
            callback(err, resp.statusCode, {
              manifest: body,
              headers,
              registry: registry.replace("http://", "").replace("https://", "")
            })
          })
        }
      })
    } else {
      callback(err, resp.statusCode, body)
    }
  })
}

module.exports = HarborAPIs;
