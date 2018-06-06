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
const DEFAULT_PAGE = constants.DEFAULT_PAGE
const DEFAULT_PAGE_SIZE = constants.DEFAULT_PAGE_SIZE
const MAX_PAGE_SIZE = constants.MAX_PAGE_SIZE

exports.getTeamspaces = function* () {
  const teamID = this.params.team_id
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
  const result = yield api.teams.getBy([teamID, 'spaces'], queryObj)
  const teamspaces = result.spaces || []
  let total = 0
  if (result.listMeta && result.listMeta.total) {
    total = result.listMeta.total
  }

  for (let index in teamspaces) {
    const r = yield api.teams.getBy([teamspaces[index].teamID, "spaces", teamspaces[index].spaceID, "app_info"])
    teamspaces[index].appCount = r.appCount
    teamspaces[index].serviceCount = r.serviceCount
    teamspaces[index].containerCount = r.containerCount
  }

  this.body = {
    data: teamspaces,
    total,
  }
}

exports.getTeamClusters = function* () {
  const teamID = this.params.team_id
  const loginUser = this.session.loginUser
  if (teamID === 'default') {
    const spi = apiFactory.getSpi(loginUser)
    const result = yield spi.clusters.getBy(['default'])
    this.body = {
      data: result.clusters || [],
      total: result.listMeta.total,
      count: result.listMeta.size
    }
    return
  }
  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let name = query.name
  if (isNaN(page) || page < DEFAULT_PAGE) {
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
  if (from == 0 && size == 0) {
    queryObj = {}
  }
  if (name) {
    queryObj.filter = `name ${name}`
  }
  const api = apiFactory.getApi(loginUser)
  const result = yield api.teams.getBy([teamID, 'clusters'], queryObj)
  const clusters = result.clusters || []
  this.body = {
    teamID,
    data: clusters,
    total: result.listMeta.total,
    count: result.listMeta.size
  }
}

exports.getAllClusters = function* () {
  const teamID = this.params.team_id
  const loginUser = this.session.loginUser

  const apiTeam = apiFactory.getApi(loginUser)
  const resultTeam = yield apiTeam.teams.getBy([teamID, 'clusters'])
  const teamClusters = resultTeam.clusters || []
  let teamClusterMap = {}
  for (let teamCluster of teamClusters) {
    teamClusterMap[teamCluster.clusterID] = 1
  }

  const resultRequest = yield apiTeam.teams.getBy([teamID, 'requests', 'cluster'])
  const requests = resultRequest.requests || []
  let requestMap = {}
  for (let index in requests) {
    requestMap[requests[index].resourceID] = 1
  }

  const apiCluster = apiFactory.getK8sApi(loginUser)
  const resultCluster = yield apiCluster.get({})
  let clusters = resultCluster.clusters || []
  for (let index in clusters) {
    clusters[index].status = 'notAuthorized'
    if (teamClusterMap[clusters[index].clusterID] == 1) {
      clusters[index].status = 'authorized'
    } else if (requestMap[clusters[index].clusterID] == 1) {
      clusters[index].status = 'pending'
    }
  }

  this.body = {
    teamID,
    data: clusters,
    total: resultCluster.listMeta.total,
    count: resultCluster.listMeta.size
  }
}

exports.requestTeamCluster = function* () {
  const teamID = this.params.team_id
  const clusterID = this.params.cluster_id
  const loginUser = this.session.loginUser
  const clusterIDs = [clusterID]

  const api = apiFactory.getApi(loginUser)
  const result = yield api.teams.createBy([teamID, 'clusters'], null, clusterIDs)
  //const result = yield api.teams.updateBy([teamID, 'clusters', clusterID, 'request'])

  this.body = {
    teamID,
    data: result
  }
}
// permissionPut
exports.permissionPut = function* () {
  
  const teamID = this.params.team
  const userID = this.params.user
  const role = this.params.role
  const type = this.params.type

  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const result = yield api.teams.update([teamID+'/update/users/'+userID+'/role/'+role+'/type/'+type])

  this.body = {
    teamID,
    data: result
  }
}
exports.getTeamUsers = function* () {
  const teamID = this.params.team_id
  const loginUser = this.session.loginUser
  const query = this.query || {}
  let page = parseInt(query.page || DEFAULT_PAGE)
  let size = parseInt(query.size || DEFAULT_PAGE_SIZE)
  let sort_by = parseInt(query.sort_by || "name")
  let sort_order = parseInt(query.sort_order || true)
  let filter = query.filter
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
  if (from == 0 && size == 0) {
    queryObj = {}
  }
  if (filter) {
    queryObj.filter = filter
  }
  if (query && query.sort) {
    queryObj.sort = query.sort
  }
  const api = apiFactory.getApi(loginUser)
  const result = yield api.teams.getBy([teamID, 'users'], queryObj)
  const users = result.users || []
  let total = 0
  if (result.listMeta && result.listMeta.total) {
    total = result.listMeta.total
  }
  size = 0
  if (result.listMeta && result.listMeta.count) {
    size = result.listMeta.size
  }

  this.body = {
    users,
    total,
    size
  }
}

exports.getTeamDetail = function* () {
  const teamID = this.params.team_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)

  const result = yield api.teams.getBy([teamID])

  this.body = {
    result
  }
}

exports.createTeam = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const team = this.request.body
  if (!team || !team.teamName) {
    const err = new Error('team name is required.')
    err.status = 400
    throw err
  }
  const result = yield api.teams.create(team)

  this.body = {
    data: result
  }
}

exports.createTeamspace = function* () {
  const teamID = this.params.team_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const teamspace = this.request.body
  if (!teamspace || !teamspace.spaceName) {
    const err = new Error('teamspace name is required.')
    err.status = 400
    throw err
  }
  const result = yield api.teams.createBy([teamID, 'spaces'], null, teamspace)

  this.body = {
    data: result
  }
}

exports.deleteTeam = function* () {
  const teamID = this.params.team_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)

  const result = yield api.teams.delete(teamID)

  this.body = {
    data: result
  }
}

exports.addTeamusers = function* () {
  const teamID = this.params.team_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const userIDs = this.request.body
  const result = yield api.teams.createBy([teamID, 'users'], null, userIDs)

  this.body = {
    data: result
  }
}

exports.removeTeamusers = function* () {
  const teamID = this.params.team_id
  const userIDs = this.params.user_ids
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)

  const result = yield api.teams.deleteBy([teamID, 'users', userIDs])

  this.body = {
    data: result
  }
}

exports.deleteTeamspace = function* () {
  const teamID = this.params.team_id
  const spaceID = this.params.space_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)

  const result = yield api.teams.deleteBy([teamID, 'spaces', spaceID])

  this.body = {
    data: result
  }
}

exports.checkTeamName = function* () {
  const teamName = this.params.team_name
  const api = apiFactory.getApi(this.session.loginUser)
  const response = yield api.teams.getBy([teamName, 'existence'])
  this.status = response.code
  this.body = response
}

exports.checkSpaceName = function* () {
  const teamID = this.params.team_id
  const spaceName = this.params.space_name
  const api = apiFactory.getApi(this.session.loginUser)
  const response = yield api.teams.getBy([teamID, 'spaces', spaceName, 'existence'])
  this.status = response.code
  this.body = response
}

exports.deleteSpaceUsers = function* () {
  const teamID = this.params.team_id
  const spaceID = this.params.space_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body
  const result = yield api.teams.deleteBy([teamID, 'spaces', spaceID,'users'],null,body)
  this.body = {
    data: result
  }
}

exports.getSpaceUsers = function* () {
  const teamID = this.params.team_id
  const spaceID = this.params.space_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  
  const result = yield api.teams.getBy([teamID, 'spaces', spaceID,'users'])
  this.body = {
    data: result
  }
}
exports.setSpaceUsers = function* () {
  const teamID = this.params.team_id
  const spaceID = this.params.space_id
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const body = this.request.body
  let result
  result = yield api.teams.createBy([teamID, 'spaces', spaceID,'users'],null,body)
  this.body = {
    data: result
  }
}
