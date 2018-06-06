/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * DevOps(CI/CD) controller
 *
 * v0.1 - 2016-11-04
 * @author Lei
*/
'use strict'

const apiFactory = require('../services/api_factory')
const logger     = require('../utils/logger.js').getLogger("devops")
const request    = require('request')

/*
Code repositories
*/
/*
Add a new repository type: gitlab only
*/
exports.registerRepo = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  const repoInfo = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  switch (repoType) {
    case "gitlab": case "gogs":
      if (!repoInfo.url || !repoInfo.private_token) {
        const err = new Error(`Missing url or private_token for ${repoType} repository`)
        err.status = 400
        throw err
      }
      var RegExp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      if (!RegExp.test(repoInfo.url)) {
        const err = new Error(`Invalid ${repoType} url`)
        err.status = 400
        throw err
      }
      break;
    case "svn":
      break;

    default:
      const err = new Error(`Not support ${repoType} for now`)
      err.status = 400
      throw err
  }
  const result = yield api.createBy(["repos", repoType], null, repoInfo)

  this.body = {
    data: result
  }
}
// Get supported repos
exports.getSupportedRepository = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["repos", 'supported'], null)

  this.body = {
    data: result
  }
}

exports.listRepository = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  if (repoType != "gitlab" && repoType != 'github' && repoType != 'gogs') {
    const err = new Error('Only support gitlab/github/gogs for now')
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["repos", repoType], null)

  this.body = {
    data: result
  }
}

exports.syncRepository = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  if (repoType != "gitlab" && repoType != 'github' && repoType != 'gogs')  {
    const err = new Error('Only support gitlab/github/gogs for now')
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["repos", repoType], null)

  this.body = {
    data: result
  }
}

exports.removeRepository = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  if (repoType != "gitlab" && repoType != "github" && repoType != 'gogs') {
    const err = new Error('Only support gitlab/github/gogs for now')
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(["repos", repoType], null)

  this.body = {
    data: result
  }
}

/*
Require reponame and proejct_id in the query
*/
exports.listBranches = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  const repoName = this.query.reponame
  const project_id = this.query.project_id
  if (repoType != "gitlab" && repoType != "github" && repoType != 'gogs') {
    const err = new Error('Only support gitlab/github/gogs for now')
    err.status = 400
    throw err
  }
  if (!repoName || !project_id) {
    const err = new Error('reponame and project_id are required in the query to get the branches information')
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["repos", repoType, "branches"], {"reponame": repoName, "project_id": project_id})

  this.body = {
    data: result
  }
}

exports.listTags = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  const repoName = this.query.reponame
  const project_id = this.query.project_id
  if (repoType != "gitlab" && repoType != "github" && repoType != 'gogs') {
    const err = new Error('Only support gitlab/github/gogs for now')
    err.status = 400
    throw err
  }
  if (!repoName || !project_id) {
    const err = new Error('reponame and project_id are required in the query to get the branches information')
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["repos", repoType, "tags"], {"reponame": repoName, project_id})

  this.body = {
    data: result
  }
}

exports.listBranchesAndTags = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  const repoName = this.query.reponame
  const project_id = this.query.project_id
  if (repoType === 'svn') {
    this.body = {
      data: {}
    }
    return
  }
  if (repoType != "gitlab" && repoType != "github" && repoType != 'gogs') {
    const err = new Error('Only support gitlab/github/gogs for now')
    err.status = 400
    throw err
  }
  if (!repoName || !project_id) {
    const err = new Error('reponame and project_id are required in the query to get the branches information')
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const reqArray = []
  reqArray.push(api.getBy(["repos", repoType, "branches"], {"reponame": repoName, project_id}))
  reqArray.push(api.getBy(["repos", repoType, "tags"], {"reponame": repoName, project_id}))
  const results = yield reqArray
  this.body = {
    data: {
      branches: results[0].results,
      tags: results[1].results,
    }
  }
}

exports.getManagedProject = function* (next) {
  const loginUser = this.session.loginUser
  const project_id = this.params.project_id
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["managed-projects", project_id], null)
  const repo = result.results
  this.params.type = repo.repo_type
  this.query.reponame = repo.name
  this.query.project_id = repo.gitlab_project_id
  yield next
}

exports.getUserInfo = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type
  if (repoType != "gitlab" && repoType != "github" && repoType != 'gogs')  {
    const err = new Error(`Not support ${repo_type} for now`)
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["repos", repoType, "user"], null)

  this.body = {
    data: result
  }
}

// Get the redirect url of 3rdparty repository
exports.getAuthRedirectUrl = function* () {
  const loginUser = this.session.loginUser
  const repoType = this.params.type

  const api = apiFactory.getDevOpsApi(loginUser)
  const typeResult = yield api.getBy(["repos", 'supported'], null)

  if (typeResult.indexOf(repoType) < 0) {
    this.status = 404
    this.body = {
      message: '还没有正确配置 ' + repoType + ', 更正后可以正常使用集成功能'
    }
    return
  }

  if ('github' == repoType) {
    // console.info('save space:', this.session.loginUser.teamspace)
    this.session.authRepoInSpace = this.session.loginUser.teamspace
  }
  const result = yield api.getBy(["repos", repoType, "auth"], null)

  this.body = {
    data: result
  }
}

exports.doUserAuthorization = function* () {
  const method = "doUserAuthorization"
  const loginUser = this.session.loginUser
  // console.info('saved space:', this.session.authRepoInSpace)
  if (this.session.authRepoInSpace) {
    this.session.loginUser.teamspace = this.session.authRepoInSpace
  }
  var type = this.params.type
  if (!type) {
    this.status = 400
    this.body = "No repository type specified"
    return
  }

  var resData = {
    authInfo: loginUser.ciAuthInfo || {},
    type: type
  }
  var state = this.query.state
  if (state && loginUser.github_state && state !== loginUser.github_state) {
    resData.err = type + ': 您填入的URL或token有错误, 请填入正确的信息'
    this.status = 400
    this.body = resData.err
    return
  }
  delete loginUser.github_state
  var users = type + '_users'
  var authorized = type + '_authorized'
  var authInfo = {
    code: this.query.code
  }
  if (type === 'bitbucket') {
    authInfo = {
      code: this.query.oauth_token,
      oauth_token_secret: loginUser.bitbucket_oauth_token_secret,
      oauth_verifier: this.query.oauth_verifier
    }
  }
  const api = apiFactory.getDevOpsApi(loginUser)
  const results = yield api.createBy(["repos", type], null, authInfo)
  resData.authInfo[users] = results;
  resData.authInfo[authorized] = true;
  // Save to session
  loginUser.ciAuthInfo = resData.authInfo

  this.status = 200
  this.redirect('/ci_cd/coderepo?' + type)
}
/*
Managed projects
*/
/*
{
  "name": "first managed project",
  "is_private": 1,
  "repo_type": "gitlab",
  "source_full_name": "wanglei/demo-project",
  "address": "git@gitlab.paas.enncloud.cn:wanglei/demo-project.git",
  "gitlab_project_id": 131
}
*/
exports.addManagedProject = function* () {
  const loginUser = this.session.loginUser
  const body = this.request.body

  if (!body.name || !body.repo_type || !body.address) {
    const err = new Error('name, repo_type, address are required in the query to get the branches information')
    err.status = 400
    throw err
  }

  switch (body.repo_type) {
    case "gitlab":
      if (!body.source_full_name || !body.gitlab_project_id) {
        const err = new Error("source_full_name and gitlab_project_id for gitlab are required")
        err.status = 400
        throw err
      }
      break;
    case "gogs":
      if (!body.projectId) {
        const err = new Error("projectId for gogs are required")
        err.status = 400
        throw err
      }
      break;
    case "github":
      if (!body.projectId) {
        const err = new Error("projectId for github is required")
        err.status = 400
        throw err
      }
      break;
    case "svn":
      if (body.is_private == 1) {
        if (!body.username || !body.password) {
          const err = new Error("username and password for private SVN repository are required")
          err.status = 400
          throw err
        }
        yield validateSVNAccount(body.address, body.username, body.password)
      } else {
        yield checkURLConnectivity(body.address)
      }
      break;
    default:
      const err = new Error('Only support gitlab/github/svn/gogs for now')
      err.status = 400
      throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["managed-projects"], null, body)

  this.body = {
    data: result
  }
}

function* tryWithBasicAuth(repoURL, username, password) {
  yield tryRequestWithAuth(repoURL, username, password, true)
}

function* tryWithDigestAuth(repoURL, username, password) {
  yield tryRequestWithAuth(repoURL, username, password, false)
}

function tryRequestWithAuth(repoURL, username, password, sendImmediately) {
  return new Promise((resolve, reject) => request.get(repoURL, {
      auth: {
        user: username,
        pass: password,
        sendImmediately
      }
    }, waitResponse.bind(null, resolve, reject))
  )
}

function checkURLConnectivity(repoURL) {
  return new Promise((resolve, reject) => request.get(repoURL, waitResponse.bind(null, resolve, reject)))
}

function waitResponse(resolve, reject, error, response, body) {
  if (error) {
    reject(error)
    return
  }
  if (response.statusCode !== 200) {
    error = new Error(JSON.stringify(body))
    error.status = response.statusCode
    reject(error)
    return
  } else {
    resolve(body)
  }
}

function* validateSVNAccount(repoURL, username, password) {
  // No validation for svn address
  if (repoURL.indexOf('http') < 0 && repoURL.indexOf('https') < 0) {
    return
  }
  const uri = repoURL.endsWith('/') ? repoURL : `${repoURL}/`
  const actions = [tryWithBasicAuth.bind(null, uri, username, password),
    tryWithDigestAuth.bind(null, uri, username, password)]
  const error = yield flow(actions)
  if (error) {
    throw error
  }
}

function* flow(actions) {
  const length = actions.length
  let error = null
  for (let i = 0; i < length; ++i) {
    try {
      yield actions[i]()
      return null
    } catch (err) {
      error = err
    }
  }
  return error
}

exports.listManagedProject = function* () {
  const loginUser = this.session.loginUser

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["managed-projects"], null)
  result.results?
  result.results.map((item) => {
    item.branchList = []
  }):''
  this.body = {
    data: result
  }
}

exports.removeManagedProject = function* () {
  const loginUser = this.session.loginUser
  const project_id = this.params.project_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(["managed-projects", project_id], null)

  this.body = {
    data: result
  }
}

/*
CI flows
*/
exports.createCIFlows = function* (){
  const loginUser = this.session.loginUser
  const body = this.request.body
  let isBuildImage = body.isBuildImage
  if(isBuildImage) {
    isBuildImage = parseInt(isBuildImage)
  }
  if (body.init_type == '1' && !body.name) {
    const err = new Error('name of flow is required')
    err.status = 400
    throw err
  }

  const api = apiFactory.getDevOpsApi(loginUser)

  let result
  if (body.init_type == '2') {
    result = yield api.createBy(["ci-flows"], {o: 'yaml', isBuildImage: isBuildImage }, body.yaml)
  } else {
    result = yield api.createBy(["ci-flows"], { isBuildImage: isBuildImage }, body)
  }

  this.body = {
    data: result
  }
}

exports.listCIFlows = function* (){
  const loginUser = this.session.loginUser
  let isBuildImage = this.query.isBuildImage
  if(isBuildImage) {
    isBuildImage = parseInt(isBuildImage)
  }
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows"], {isBuildImage})

  this.body = {
    data: result
  }
}

exports.getCIFlow = function* (){
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id], null)

  this.body = {
    data: result
  }
}

exports.getCIFlowYAML = function* (){
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id], {o: 'yaml'})

  this.body = {
    data: result
  }
}

exports.updateCIFlow = function* (){
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id], null, body)

  this.body = {
    data: result
  }
}

exports.removeCIFlow = function* (){
  const loginUser = this.session.loginUser
  let flow_id = this.params.flow_id
  const queryFlowID = this.query.flowId
  if(queryFlowID) {
    flow_id = queryFlowID
  }
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(["ci-flows", flow_id], null)

  this.body = {
    data: result
  }
}

/*
CI flow stages
*/
exports.listFlowStages = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "stages"], null)

  this.body = {
    data: result
  }
}

exports.createFlowStages = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const body = this.request.body
  // TODO: validate body format


  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["ci-flows", flow_id, "stages"], null, body)

  this.body = {
    data: result
  }
}

exports.deleteFlowStage = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(["ci-flows", flow_id, "stages", stage_id], null)

  this.body = {
    data: result
  }
}

exports.updateFlowStage = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id, "stages", stage_id], null, body)

  this.body = {
    data: result
  }
}

exports.getStage = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "stages", stage_id], null)

  this.body = {
    data: result
  }
}

exports.createFlowBuild = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const body = this.request.body

  // TODO: validate body format

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["ci-flows", flow_id, "builds"], null, body)

  this.body = {
    data: result
  }
}

exports.listBuilds = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "builds"], null)

  this.body = {
    data: result
  }
}

exports.getFlowBuild = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const flow_build_id = this.params.flow_build_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "builds", flow_build_id], null)
  result.results.results.map((item) => {
    item.logInfo = null;
    item.isFetching = false;
  })

  this.body = {
    data: result
  }
}

exports.stopBuild = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id
  // Stage build id here
  const stage_build_id = this.params.build_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id, "stages", stage_id, "builds", stage_build_id, "stop"], null)

  this.body = {
    data: result
  }
}

exports.updateStageLink = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id
  const target_id = this.params.target_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id, "stages", stage_id, "link", target_id], null, body)

  this.body = {
    data: result
  }
}

/* CD rules
*/
exports.createCDRule = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["ci-flows", flow_id, "cd-rules"], null, body)

  this.body = {
    data: result
  }
}

exports.listCDRules = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "cd-rules"], null)

  this.body = {
    data: result
  }
}

exports.removeCDRule = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const rule_id = this.params.rule_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(["ci-flows", flow_id, "cd-rules", rule_id], null)

  this.body = {
    data: result
  }
}

exports.updateCDRule = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const rule_id = this.params.rule_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id, "cd-rules", rule_id], null, body)

  this.body = {
    data: result
  }
}

/*
CI rules
*/
exports.getCIRule = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "ci-rules"])

  this.body = {
    data: result
  }
}

exports.updateCIRule = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id, "ci-rules"], null, body)

  this.body = {
    data: result
  }
}

/*
Dockerfile APIs
*/
exports.listDockerfiles = function* () {
  const loginUser = this.session.loginUser

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["dockerfiles"], null)

  this.body = {
    data: result
  }
}

exports.addDockerfile = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["ci-flows", flow_id, "stages", stage_id, "dockerfile"], null, body)

  this.body = {
    data: result
  }
}

exports.getDockerfile = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "stages", stage_id, "dockerfile"], null)

  this.body = {
    data: result
  }
}

exports.removeDockerfile = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(["ci-flows", flow_id, "stages", stage_id, "dockerfile"], null)

  this.body = {
    data: result
  }
}

exports.updateDockerfile = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-flows", flow_id, "stages", stage_id, "dockerfile"], null, body)

  this.body = {
    data: result
  }
}

exports.createScripts = function* createScripts() {
  const loginUser = this.session.loginUser
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["ci-scripts"], null, body)

  this.body = {
    data: result
  }
}

exports.getScriptsById = function* createScripts() {
  const loginUser = this.session.loginUser
  const scripts_id = this.params.scripts_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-scripts", scripts_id])

  this.body = {
    data: result
  }
}

exports.updateScriptsById = function* createScripts() {
  const loginUser = this.session.loginUser
  const scripts_id = this.params.scripts_id
  const body = this.request.body

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.updateBy(["ci-scripts", scripts_id], null, body)

  this.body = {
    data: result
  }
}

// Return the images that configured in stages of a flow
// In most case, it should be one image
exports.getImagesOfFlow = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "images"], null)

  this.body = {
    data: result
  }
}

exports.listDeploymentLogsOfFlow = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const limit = this.query.limit
  var query = null
  if (limit) {
    query = {"limit": limit}
  }
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "deployment-logs"], query)

  this.body = {
    data: result
  }
}

//flow build
exports.getBuildLog = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "builds"], null)

  this.body = {
    data: result
  }
}

exports.getLastBuildLog = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "lastbuild"], null)

  this.body = {
    data: result
  }
}

exports.getFlowStageBuildLog = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id
  const stage_build_id = this.params.stage_build_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "stages", stage_id, "builds", stage_build_id, "log"], null)

  this.body = {
    data: result
  }
}

exports.getFlowStageBuildEvents = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id
  const stage_build_id = this.params.stage_build_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "stages", stage_id, "builds", stage_build_id, "events"], null)

  this.body = {
    data: result
  }
}

exports.getStageBuildLogList = function* () {
  const loginUser = this.session.loginUser
  const flow_id = this.params.flow_id
  const stage_id = this.params.stage_id

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci-flows", flow_id, "stages", stage_id, "builds"], null)

  this.body = {
    data: result
  }
}

exports.getStats = function* () {
  const loginUser = this.session.loginUser

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["stats"], null)
  this.body = {
    data: result
  }
}

exports.getAvailableImages = function*() {
  const loginUser = this.session.loginUser

  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(["ci", "images"], null)

  this.body = {
    data: result
  }
}


exports.addBaseImage = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["ci", "images"], this.query, this.request.body)
  this.body = {
    data: result
  }
}

exports.updateBaseImage = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getDevOpsApi(loginUser)
  const body = this.request.body
  const result = yield api.updateBy(["ci", "images", this.params.id], this.query, body)
  this.body = {
    data: result
  }
}

exports.deleteBaseImage = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(["ci", "images", this.params.id], this.query)
  this.body = {
    data: result
  }
}

exports.getDeploymentOrAppCDRule = function* () {
  const cluster = this.query.cluster
  const type = this.params.type
  let name = this.query.name
  if(!cluster || !name || !type) {
    const err = new Error('cluster, name, type is require')
    err.status = 400
    throw err
  }
  let appService = { isEmptyObject: true }
  const loginUser = this.session.loginUser
  if(type == 'app') {
    appService.isEmptyObject = false
    const appApi = apiFactory.getK8sApi(loginUser)
    const result = yield appApi.getBy([cluster, 'apps', name])
    const apps = result.data
    if(!apps) {
      const err = new Error(`cant't find any app`)
      err.status = 400
      throw err
    }
    const nameArr = name.split(',')
    name = []
    if(nameArr.length!=0){
      nameArr.forEach(key => {
        const app = apps[key]
        if(app.services && app.services.length > 0) {
          app.services.forEach(service => {
            name.push(service.metadata.name)
            appService[service.metadata.name] = key
          })
        }
      })
    }
    if(name.length == 0) {
      this.status = 200
      this.body = {
        results: []
      }
      return
    }
  }
  const api =  apiFactory.getDevOpsApi(loginUser)
  const result = yield api.getBy(['cd-rules'], {
    cluster,
    name: name.join ? name.join(',') : name
  })
  const body = []
  if(!appService.isEmptyObject&&result.results) {
    result.results.forEach(item => {
      const deploymentName = item.binding_deployment_name
      body.push({
        appname: appService[deploymentName],
        service: item
      })
    })
    this.body = {
      results: body
    }
    return
  }
  this.body = result
}

exports.deleteDeploymentOrAppCDRule = function* () {
  const cluster = this.query.cluster
  const type = this.params.type
  const name = this.query.name
  if(!cluster || !name || !type) {
    const err = new Error('cluster, name, type is require')
    err.status = 400
    throw err
  }
  const loginUser = this.session.loginUser
  if(type == 'app') {
    const appApi = apiFactory.getK8sApi(loginUser)
    const result = appApi.getBy([cluster, 'apps'], {
      name
    })
  }
  const api =  apiFactory.getDevOpsApi(loginUser)
  const result = yield api.deleteBy(['cd-rules'], {
    cluster,
    name
  })
  this.body = result
}

exports.ennflowClone = function* () {
  const loginUser = this.session.loginUser
  const id = this.params.flow_id
  const repoInfo = this.request.body
  const api = apiFactory.getDevOpsApi(loginUser)
  const result = yield api.createBy(["ci-flows", id,'sync'], null, repoInfo)

  this.body = {
    data: result
  }
}