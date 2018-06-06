/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User manage controller
 *
 * v0.1 - 2016-11-01
 * @author shouhong.zhang
 */
'use strict'

const apiFactory = require('../services/api_factory')
const constants = require('../constants')
const email = require('../utils/email')
const logger = require('../utils/logger.js').getLogger("user_manage")
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE
const NO_CLUSTER_FLAG = constants.NO_CLUSTER_FLAG
const ROLE_TEAM_ADMIN = 1
const ROLE_SYS_ADMIN = 2
const config = require('../configs')
const standardMode = require('../configs/constants').STANDARD_MODE
const serviceIndex = require('../services')
const registryConfigLoader = require('../registry/registryConfigLoader')
const initGlobalConfig = require('../services/init_global_config')
const securityUtil = require('../utils/security')
const _ = require('lodash')

/*
Only return the detail of one user
*/
exports.getUserDetail = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)
  const result = yield api.users.getBy([userID])
  const user = result ? result.data : {}
  if (this.params.user_id === 'default') {
    // For get loginUser info when user refresh page
    user.watchToken = loginUser.watchToken
    yield initGlobalConfig.initGlobalConfig()
    // For no cluster handle
    user[NO_CLUSTER_FLAG] = loginUser[NO_CLUSTER_FLAG]
    // Get config from config file and update session
    serviceIndex.addConfigsForFrontend(user, loginUser)
    loginUser.tenxApi = user.tenxApi
    loginUser.cicdApi = user.cicdApi
    _.merge(loginUser, user)
    // Delete sensitive information
    delete user.userID
    delete user.statusCode
    delete user.apiToken
  }
  this.body = {
    data: user
  }
}

exports.getUserAppInfo = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)
  const result = yield api.users.getBy([userID, "app_info"])
  this.body = {
    data: result
  }
}

exports.getUsers = function* () {
  const loginUser = this.session.loginUser
  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let sort_by = parseInt(query.sort_by || "name")
  let sort_order = parseInt(query.sort_order || true)
  let name = query.name
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  if (isNaN(size) || size > MAX_PAGE_SIZE) {
    size = DEFAULT_PAGE_SIZE
  }
  let from = size * (page - 1)
  if (size == -1) {
    from == -1
  }
  let queryObj = { from, size }
  if (query && query.filter) {
    queryObj.filter = query.filter
  }
  if (query && query.sort) {
    queryObj.sort = query.sort
  }
  const api = apiFactory.getApi(loginUser)
  const result = yield api.users.get(queryObj)
  const users = result.users || []
  let total = 0
  if (result.listMeta && result.listMeta.total) {
    total = result.listMeta.total
  }

  this.body = {
    users,
    total
  }
}

exports.getUserTeams = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  if (config.running_mode === standardMode) {
    const spi = apiFactory.getSpi(loginUser)
    let query = {}
    if (this.query.sort) {
      query.sort = this.query.sort
    }
    if (this.query.page > 0) {
      const size = this.query.size || 5
      query.from = (this.query.page-1) * size
    }
    if (this.query.size) {
      query.size = this.query.size
    }
    if (this.query.filter) {
      query.filter = this.query.filter
    }
    if (this.query.getType) {
      query.getType = this.query.getType
    }
    const result = yield spi.teams.get(query)
    this.body = {
      data: result,
    }
  }
  else {
    // Show teams that current user can manage
    let managedTeams = (userID === 'default')
    //Only team admin / sysadmin can get team related information
    if (this.session.loginUser.role != ROLE_TEAM_ADMIN && this.session.loginUser.role != ROLE_SYS_ADMIN) {
      this.body = {
        teams: [],
        total: 0
      }
      return
    }

    const query = this.query || {}
    let page = parseInt(query.page || DEFAULT_PAGE)
    let size = parseInt(query.size || 100)// DEFAULT_PAGE_SIZE
    let sort_by = parseInt(query.sort_by || "name")
    let sort_order = parseInt(query.sort_order || true)

    let get_type =parseInt(query.getType)
    let name = query.name
    if (isNaN(page) || page < 1) {
      page = DEFAULT_PAGE
    }
    if (isNaN(size) || size > 100) {
      size = DEFAULT_PAGE_SIZE
    }
    let from = size * (page - 1)
    if (size == -1) {
      from == -1
    }

    // let a={getType:"teamManager"}
    let queryObj = { from, size}
    if (from == 0 && size == 0) {
      queryObj = {}
    }
    if (name) {
      queryObj.filter = `name ${name}`
      queryObj.getType ="teamManager"
    }
    if (query && query.sort) {
      queryObj.sort = query.sort
      queryObj.getType ="teamManager"
    }
    if (query && query.getType) {
      queryObj.getType = query.getType
      queryObj.getType ="teamManager"
    }
    // Only filter by creator id for managed team query
    if (managedTeams) {
      if (query.filter) {
        queryObj.filter = query.filter 
        queryObj.getType ="teamManager"
      }
    } else {
      if (query.filter) {
        queryObj.filter = query.filter
        queryObj.getType ="teamManager"
      }
      queryObj.userId = userID
    }
    queryObj.managedTeams = managedTeams
    const api = apiFactory.getApi(loginUser)
   
    let result = yield api.teams.get(queryObj)
    const teams = result.teams || []
    let total = 0
    if (result.listMeta && result.listMeta.total) {
      total = result.listMeta.total
    }

    this.body = {
      teams,
      total
    }
  }
}

exports.getUserTeamspaces = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  const query = this.query || {}

  this.body = yield getUserTeamspacesImpl(userID, loginUser, query, false)
}

exports.getUserTeamspacesWithDetail = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  const query = this.query || {}

  this.body = yield getUserTeamspacesImpl(userID, loginUser, query, true)
}

function* getUserTeamspacesImpl(userID, loginUser, query, fetchDetail) {
  userID = userID === 'default' ? loginUser.id : userID
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || 100)//DEFAULT_PAGE_SIZE
  let sort_by = parseInt(query.sort_by || "name")
  let sort_order = parseInt(query.sort_order || true)
  let name = query.name
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE
  }
  // if (isNaN(size) || size > 1000) {
  //   size = DEFAULT_PAGE_SIZE
  // }
  let from = size * (page - 1)
  if (size == -1) {
    from == -1
  }
  let queryObj = { from, size }
  if (from == 0 && size == 0) {
    queryObj = {}
  }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  if (query && query.sort) {
    queryObj.sort = query.sort
  }
  const api = apiFactory.getApi(loginUser)
  const result = yield api.users.getBy([userID, 'spaces'], queryObj)
  const teamspaces = result.spaces || []
  let total = 0
  if (result.listMeta && result.listMeta.total) {
    total = result.listMeta.total
  }

  if (fetchDetail) {
    for (let index in teamspaces) {
      const r = yield api.teams.getBy([teamspaces[index].teamID, "spaces", teamspaces[index].spaceID, "app_info"])
      teamspaces[index].appCount = r.appCount
      teamspaces[index].serviceCount = r.serviceCount
      teamspaces[index].containerCount = r.containerCount
    }
  }

  return {
    teamspaces,
    total
  }
}

exports.createUser = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const user = this.request.body
  if (!user || !user.userName || !user.password || !user.email) {
    const err = new Error('user name, password and email are required.')
    err.status = 400
    throw err
  }
  const result = yield api.users.create(user)

  if (!user.sendEmail) {
    this.body = {
      data: result
    }
    return
  }
  try {
    yield email.sendUserCreationEmail(user.email, loginUser.user, loginUser.email, user.userName, user.password)
    this.body = {
      data: result
    }
  } catch (error) {
    logger.error("Send email error: ", error)
    this.body = {
      data: "SEND_MAIL_ERROR"
    }
  }
}

exports.deleteUser = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)

  const result = yield api.users.delete(userID)

  this.body = {
    data: result
  }
}

exports.updateUser = function* () {
  let userID = this.params.user_id
  const loginUser = this.session.loginUser
  userID = userID === 'default' ? loginUser.id : userID
  const api = apiFactory.getApi(loginUser)
  const user = this.request.body

  const result = yield api.users.patch(userID, user)
  // If update admin password, refresh the cache of registry
  if (result && result.statusCode === 200) {
    if (user.password && registryConfigLoader.GetRegistryConfig()) {
      logger.info("Update registry auth in cache...")
      // Update registry auth cache
      let registryAuth = Buffer(loginUser.user + ':' + user.password).toString('base64')
      loginUser.registryAuth = securityUtil.encryptContent(registryAuth)
    }
  }

  this.body = {
    data: result
  }
}

exports.checkUserName = function* () {
  const userName = this.params.user_name
  const api = apiFactory.getApi(this.session.loginUser)
  const response = yield api.users.getBy([userName, 'existence'])
  this.status = response.code
  this.body = response
}

