/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for users
 *
 * v0.1 - 2016-11-01
 * @author shouhong.zhang
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const TEAMSPACE_LIST_REQUEST = 'TEAMSPACE_LIST_REQUEST'
export const TEAMSPACE_LIST_SUCCESS = 'TEAMSPACE_LIST_SUCCESS'
export const TEAMSPACE_LIST_FAILURE = 'TEAMSPACE_LIST_FAILURE'

// Fetches teamspace list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamspaceList(teamID, query) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/spaces`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [TEAMSPACE_LIST_REQUEST, TEAMSPACE_LIST_SUCCESS, TEAMSPACE_LIST_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches teamspace list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamspaceList(teamID, query, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamspaceList(teamID, query))
  }
}

export const TEAMUSER_LIST_REQUEST = 'TEAMUSER_LIST_REQUEST'
export const TEAMUSER_LIST_SUCCESS = 'TEAMUSER_LIST_SUCCESS'
export const TEAMUSER_LIST_FAILURE = 'TEAMUSER_LIST_FAILURE'

// Fetches team user list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamUserList(teamID, query,callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/users`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [TEAMUSER_LIST_REQUEST, TEAMUSER_LIST_SUCCESS, TEAMUSER_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches team users list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamUserList(teamID, query,callback) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamUserList(teamID, query,callback))
  }
}

export const TEAMUSER_ALL_LIST_REQUEST = 'TEAMUSER_ALL_LIST_REQUEST'
export const TEAMUSER_ALL_LIST_SUCCESS = 'TEAMUSER_ALL_LIST_SUCCESS'
export const TEAMUSER_ALL_LIST_FAILURE = 'TEAMUSER_ALL_LIST_FAILURE'

// Fetches team user list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamAllUserList(teamID, query,callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/users`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [TEAMUSER_ALL_LIST_REQUEST, TEAMUSER_ALL_LIST_SUCCESS, TEAMUSER_ALL_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches team users list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamAllUserList(teamID, query,callback) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamAllUserList(teamID, query,callback))
  }
}

export const TEAMUSER_LIST_STD_REQUEST = 'TEAMUSER_LIST_STD_REQUEST'
export const TEAMUSER_LIST_STD_SUCCESS = 'TEAMUSER_LIST_STD_SUCCESS'
export const TEAMUSER_LIST_STD_FAILURE = 'TEAMUSER_LIST_STD_FAILURE'

// Fetches team user list for standard version from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamUserListStd(teamID, query) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/users/std`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [TEAMUSER_LIST_STD_REQUEST, TEAMUSER_LIST_STD_SUCCESS, TEAMUSER_LIST_STD_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches team user list  for standard version from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamUserListStd(teamID, query, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamUserListStd(teamID, query))
  }
}


export const TEAM_CLUSTERS_LIST_REQUEST = 'TEAM_CLUSTERS_LIST_REQUEST'
export const TEAM_CLUSTERS_LIST_SUCCESS = 'TEAM_CLUSTERS_LIST_SUCCESS'
export const TEAM_CLUSTERS_LIST_FAILURE = 'TEAM_CLUSTERS_LIST_FAILURE'

// Fetches team cluster list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamClustersList(teamID, query, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/clusters`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [TEAM_CLUSTERS_LIST_REQUEST, TEAM_CLUSTERS_LIST_SUCCESS, TEAM_CLUSTERS_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches team cluster list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamClustersList(teamID, query, callback) {
  return (dispatch) => {
    return dispatch(fetchTeamClustersList(teamID, query, callback))
  }
}

export const ALL_CLUSTERS_LIST_REQUEST = 'ALL_CLUSTERS_LIST_REQUEST'
export const ALL_CLUSTERS_LIST_SUCCESS = 'ALL_CLUSTERS_LIST_SUCCESS'
export const ALL_CLUSTERS_LIST_FAILURE = 'ALL_CLUSTERS_LIST_FAILURE'

// Fetches all cluster list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAllClustersList(teamID, query, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/clusters/all`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [ALL_CLUSTERS_LIST_REQUEST, ALL_CLUSTERS_LIST_SUCCESS, ALL_CLUSTERS_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches all cluster list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadAllClustersList(teamID, query, callback) {
  return (dispatch) => {
    return dispatch(fetchAllClustersList(teamID, query, callback))
  }
}

export const TEAM_REQUEST_CLUSTER_REQUEST = 'TEAM_REQUEST_CLUSTER_REQUEST'
export const TEAM_REQUEST_CLUSTER_SUCCESS = 'TEAM_REQUEST_CLUSTER_SUCCESS'
export const TEAM_REQUEST_CLUSTER_FAILURE = 'TEAM_REQUEST_CLUSTER_FAILURE'

// Request team cluster from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRequestTeamCluster(teamID, clusterID, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/clusters/${clusterID}/request`
  return {
    [FETCH_API]: {
      types: [TEAM_REQUEST_CLUSTER_REQUEST, TEAM_REQUEST_CLUSTER_SUCCESS, TEAM_REQUEST_CLUSTER_FAILURE],
      endpoint,
      options: {
        method: 'PUT'
      },
      schema: {}
    },
    callback
  }
}

// Request team cluster from API unless it is cached.
// Relies on Redux Thunk middleware.
export function requestTeamCluster(teamID, clusterID, callback) {
  return (dispatch) => {
    return dispatch(fetchRequestTeamCluster(teamID, clusterID, callback))
  }
}

export const TEAM_CREATE_REQUEST = 'TEAM_CREATE_REQUEST'
export const TEAM_CREATE_SUCCESS = 'TEAM_CREATE_SUCCESS'
export const TEAM_CREATE_FAILURE = 'TEAM_CREATE_FAILURE'

// Create team from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateTeam(body, callback) {
  let endpoint = `${API_URL_PREFIX}/teams`
  return {
    [FETCH_API]: {
      types: [TEAM_CREATE_REQUEST, TEAM_CREATE_SUCCESS, TEAM_CREATE_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body
      },
      schema: {},
    },
    callback
  }
}

// Create team from API
// Relies on Redux Thunk middleware.
export function createTeam(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateTeam(body, callback))
  }
}

export const TEAM_DELETE_REQUEST = 'TEAM_DELETE_REQUEST'
export const TEAM_DELETE_SUCCESS = 'TEAM_DELETE_SUCCESS'
export const TEAM_DELETE_FAILURE = 'TEAM_DELETE_FAILURE'

// Delete team from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteTeam(teamID, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}`
  return {
    [FETCH_API]: {
      types: [TEAM_DELETE_REQUEST, TEAM_DELETE_SUCCESS, TEAM_DELETE_FAILURE],
      endpoint,
      options: {
        method: 'DELETE'
      },
      schema: {},
    },
    callback
  }
}
// Delete team from API
// Relies on Redux Thunk middleware.
export function deleteTeam(teamID, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteTeam(teamID, callback))
  }
}

export const TEAMSPACE_CREATE_REQUEST = 'TEAMSPACE_CREATE_REQUEST'
export const TEAMSPACE_CREATE_SUCCESS = 'TEAMSPACE_CREATE_SUCCESS'
export const TEAMSPACE_CREATE_FAILURE = 'TEAMSPACE_CREATE_FAILURE'

// Create teamspace from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateTeamspace(teamID, body, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/spaces`
  return {
    [FETCH_API]: {
      types: [TEAMSPACE_CREATE_REQUEST, TEAMSPACE_CREATE_SUCCESS, TEAMSPACE_CREATE_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body
      },
      schema: {},
    },
    callback
  }
}

// Create teamspace from API
// Relies on Redux Thunk middleware.
export function createTeamspace(teamID, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateTeamspace(teamID, body, callback))
  }
}

export const TEAMUSERS_ADD_REQUEST = 'TEAMUSERS_ADD_REQUEST'
export const TEAMUSERS_ADD_SUCCESS = 'TEAMUSERS_ADD_SUCCESS'
export const TEAMUSERS_ADD_FAILURE = 'TEAMUSERS_ADD_FAILURE'

// Add team users from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchAddTeamusers(teamID, body, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/users`
  return {
    [FETCH_API]: {
      types: [TEAMUSERS_ADD_REQUEST, TEAMUSERS_ADD_SUCCESS, TEAMUSERS_ADD_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body
      },
      schema: {},
    },
    callback
  }
}

// Add team users from API
// Relies on Redux Thunk middleware.
export function addTeamusers(teamID, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAddTeamusers(teamID, body, callback))
  }
}

export const TEAMUSERS_REMOVE_REQUEST = 'TEAMUSERS_REMOVE_REQUEST'
export const TEAMUSERS_REMOVE_SUCCESS = 'TEAMUSERS_REMOVE_SUCCESS'
export const TEAMUSERS_REMOVE_FAILURE = 'TEAMUSERS_REMOVE_FAILURE'

// Remove team users from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRemoveTeamusers(teamID, userIDs, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/users/${userIDs}`
  return {
    [FETCH_API]: {
      types: [TEAMUSERS_REMOVE_REQUEST, TEAMUSERS_REMOVE_SUCCESS, TEAMUSERS_REMOVE_FAILURE],
      endpoint,
      options: {
        method: 'DELETE'
      },
      schema: {},
    },
    callback
  }
}
// Remove team users for standard version from API
// Relies on Redux Thunk middleware.
export function removeTeamusers(teamID, userIDs, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRemoveTeamusers(teamID, userIDs, callback))
  }
}
// permissionChange
export const TEAMUSERS_PERMISSION_REQUEST = 'TEAMUSERS_PERMISSION_REQUEST'
export const TEAMUSERS_PERMISSION_SUCCESS = 'TEAMUSERS_PERMISSION_SUCCESS'
export const TEAMUSERS_PERMISSION_FAILURE = 'TEAMUSERS_PERMISSION_FAILURE'

// PERMISSION team users from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchPermissionTeamusers(team, user,role,type, callback) {
  
  // console.log()
  let endpoint = `${API_URL_PREFIX}/teams/${team}/update/users/${user}/role/${role}/type/${type}`
  return {
    [FETCH_API]: {
      types: [TEAMUSERS_PERMISSION_REQUEST, TEAMUSERS_PERMISSION_SUCCESS, TEAMUSERS_PERMISSION_FAILURE],
      endpoint,
      options: {
        method: 'PUT'
      },
      schema: {},
    },
    callback
  }
}
// Remove team users for standard version from API
// Relies on Redux Thunk middleware.
export function permissionChange(team, user,role,type, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchPermissionTeamusers(team, user,role,type, callback))
  }
}
export const TEAMUSERS_REMOVE_STD_REQUEST = 'TEAMUSERS_REMOVE_STD_REQUEST'
export const TEAMUSERS_REMOVE_STD_SUCCESS = 'TEAMUSERS_REMOVE_STD_SUCCESS'
export const TEAMUSERS_REMOVE_STD_FAILURE = 'TEAMUSERS_REMOVE_STD_FAILURE'

// Remove team users for standard version from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchRemoveTeamusersStd(teamID, username, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/users/${username}/std`
  return {
    [FETCH_API]: {
      types: [TEAMUSERS_REMOVE_STD_REQUEST, TEAMUSERS_REMOVE_STD_SUCCESS, TEAMUSERS_REMOVE_STD_FAILURE],
      endpoint,
      options: {
        method: 'DELETE'
      },
      schema: {},
    },
    callback
  }
}
// Remove team users for standard version from API
// Relies on Redux Thunk middleware.
export function removeTeamusersStd(teamID, username, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRemoveTeamusersStd(teamID, username, callback))
  }
}

export const INVITATION_CANCEL_REQUEST = 'INVITATION_CANCEL_REQUEST'
export const INVITATION_CANCEL_SUCCESS = 'INVITATION_CANCEL_SUCCESS'
export const INVITATION_CANCEL_FAILURE = 'INVITATION_CANCEL_FAILURE'

// Cancel team member invitation from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCancelInvitation(teamID, email, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/invitations/${email}`
  return {
    [FETCH_API]: {
      types: [INVITATION_CANCEL_REQUEST, INVITATION_CANCEL_SUCCESS, INVITATION_CANCEL_FAILURE],
      endpoint,
      options: {
        method: 'DELETE'
      },
      schema: {},
    },
    callback
  }
}
// Cancel team member invitation from API
// Relies on Redux Thunk middleware.
export function cancelInvitation(teamID, email, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCancelInvitation(teamID, email, callback))
  }
}

export const TEAMSPACE_DELETE_REQUEST = 'TEAMSPACE_DELETE_REQUEST'
export const TEAMSPACE_DELETE_SUCCESS = 'TEAMSPACE_DELETE_SUCCESS'
export const TEAMSPACE_DELETE_FAILURE = 'TEAMSPACE_DELETE_FAILURE'

// Remove team space from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteTeamspace(teamID, spaceID, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/spaces/${spaceID}`
  return {
    [FETCH_API]: {
      types: [TEAMSPACE_DELETE_REQUEST, TEAMSPACE_DELETE_SUCCESS, TEAMSPACE_DELETE_FAILURE],
      endpoint,
      options: {
        method: 'DELETE'
      },
      schema: {},
    },
    callback
  }
}
// Remove team space from API
// Relies on Redux Thunk middleware.
export function deleteTeamspace(teamID, spaceID, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteTeamspace(teamID, spaceID, callback))
  }
}

// Check team name existence
export const TEAM_CHECK_NAME_REQUEST = 'TEAM_CHECK_NAME_REQUEST'
export const TEAM_CHECK_NAME_SUCCESS = 'TEAM_CHECK_NAME_SUCCESS'
export const TEAM_CHECK_NAME_FAILURE = 'TEAM_CHECK_NAME_FAILURE'

function fetchCheckTeamName(teamName, callback) {
  return {
    teamName,
    [FETCH_API]: {
      types: [TEAM_CHECK_NAME_REQUEST, TEAM_CHECK_NAME_SUCCESS, TEAM_CHECK_NAME_FAILURE],
      endpoint: `${API_URL_PREFIX}/teams/${teamName}/existence`,
      schema: {}
    },
    callback
  }
}

export function checkTeamName(teamName, callback) {
  return (dispatch) => {
    return dispatch(fetchCheckTeamName(teamName, callback))
  }
}

// Check team space name existence
export const TEAM_CHECK_SPACE_NAME_REQUEST = 'TEAM_CHECK_SPACE_NAME_REQUEST'
export const TEAM_CHECK_SPACE_NAME_SUCCESS = 'TEAM_CHECK_SPACE_NAME_SUCCESS'
export const TEAM_CHECK_SPACE_NAME_FAILURE = 'TEAM_CHECK_SPACE_NAME_FAILURE'

function fetchCheckTeamSpaceName(teamID, spaceName, callback) {
  return {
    spaceName,
    [FETCH_API]: {
      types: [TEAM_CHECK_SPACE_NAME_REQUEST, TEAM_CHECK_SPACE_NAME_SUCCESS, TEAM_CHECK_SPACE_NAME_FAILURE],
      endpoint: `${API_URL_PREFIX}/teams/${teamID}/spaces/${spaceName}/existence`,
      schema: {}
    },
    callback
  }
}

export function checkTeamSpaceName(teamID, spaceName, callback) {
  return (dispatch) => {
    return dispatch(fetchCheckTeamSpaceName(teamID, spaceName, callback))
  }
}

export const TEAMANDSPACE_CREATE_REQUEST = 'TEAMANDSPACE_CREATE_REQUEST'
export const TEAMANDSPACE_CREATE_SUCCESS = 'TEAMANDSPACE_CREATE_SUCCESS'
export const TEAMANDSPACE_CREATE_FAILURE = 'TEAMANDSPACE_CREATE_FAILURE'

function fetchCreateTeamAndSpace(body, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/teamandspace`
  return {
    [FETCH_API]: {
      types: [TEAMANDSPACE_CREATE_REQUEST, TEAMANDSPACE_CREATE_SUCCESS, TEAMANDSPACE_CREATE_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body
      },
      schema: {},
    },
    callback
  }
}

export function createTeamAndSpace(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateTeamAndSpace(body, callback))
  }
}

export const SEND_INVITATION_REQUEST = 'SEND_INVITATION_REQUEST'
export const SEND_INVITATION_SUCCESS = 'SEND_INVITATION_SUCCESS'
export const SEND_INVITATION_FAILURE = 'SEND_INVITATION_FAILURE'

function fetchSendInvitation(teamID, emails, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/invitations`
  return {
    [FETCH_API]: {
      types: [SEND_INVITATION_REQUEST, SEND_INVITATION_SUCCESS, SEND_INVITATION_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body: emails,
      },
    },
    callback
  }
}

export function sendInvitation(teamID, emails, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchSendInvitation(teamID, emails, callback))
  }
}

export const GET_INVITATION_INFO_REQUEST = 'GET_INVITATION_INFO_REQUEST'
export const GET_INVITATION_INFO_SUCCESS = 'GET_INVITATION_INFO_SUCCESS'
export const GET_INVITATION_INFO_FAILURE = 'GET_INVITATION_INFO_FAILURE'

function fetchInvitationInfo(code,callback) {
  let endpoint = `${API_URL_PREFIX}/teams/invitations?code=${code}`
  return {
    [FETCH_API]: {
      types: [GET_INVITATION_INFO_REQUEST, GET_INVITATION_INFO_SUCCESS, GET_INVITATION_INFO_FAILURE],
      endpoint,
      schema: {},
    },
    callback
  }
}

export function getInvitationInfo(code, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchInvitationInfo(code, callback))
  }
}

export const GET_TEAM_DISSOLVABLE_REQUEST = 'GET_TEAM_DISSOLVABLE_REQUEST'
export const GET_TEAM_DISSOLVABLE_SUCCESS = 'GET_TEAM_DISSOLVABLE_SUCCESS'
export const GET_TEAM_DISSOLVABLE_FAILURE = 'GET_TEAM_DISSOLVABLE_FAILURE'

function fetchTeamDissoveable(teamID) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/dissolvable`
  return {
    [FETCH_API]: {
      types: [GET_TEAM_DISSOLVABLE_REQUEST, GET_TEAM_DISSOLVABLE_SUCCESS, GET_TEAM_DISSOLVABLE_FAILURE],
      endpoint,
      schema: {},
    }
  }
}

export function getTeamDissoveable(teamID) {
  return (dispatch, getState) => {
    return dispatch(fetchTeamDissoveable(teamID))
  }
}

export const JOIN_TEAM_USE_INVITATION_REQUEST = 'JOIN_TEAM_USE_INVITATION_REQUEST'
export const JOIN_TEAM_USE_INVITATION_SUCCESS = 'JOIN_TEAM_USE_INVITATION_SUCCESS'
export const JOIN_TEAM_USE_INVITATION_FAILURE = 'JOIN_TEAM_USE_INVITATION_FAILURE'

function fetchJoinTeam(code) {
  let endpoint = `${API_URL_PREFIX}/teams/join`
  return {
    [FETCH_API]: {
      types: [JOIN_TEAM_USE_INVITATION_REQUEST, JOIN_TEAM_USE_INVITATION_SUCCESS, JOIN_TEAM_USE_INVITATION_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
        body:{code}
      },
    }
  }
}

export function joinTeam(code) {
  return (dispatch, getState) => {
    return dispatch(fetchJoinTeam(code))
  }
}

export const NORMAL_MEMBER_QUIT_TEAM_REQUEST = 'NORMAL_MEMBER_QUIT_TEAM_REQUEST'
export const NORMAL_MEMBER_QUIT_TEAM_SUCCESS = 'NORMAL_MEMBER_QUIT_TEAM_SUCCESS'
export const NORMAL_MEMBER_QUIT_TEAM_FAILURE = 'NORMAL_MEMBER_QUIT_TEAM_FAILURE'

function fetchQuitTeam(teamID, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/quit`
  return {
    [FETCH_API]: {
      types: [NORMAL_MEMBER_QUIT_TEAM_REQUEST, NORMAL_MEMBER_QUIT_TEAM_SUCCESS, NORMAL_MEMBER_QUIT_TEAM_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'POST',
      },
    },
    callback,
  }
}

export function quitTeam(teamID, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchQuitTeam(teamID, callback))
  }
}

export const CREATOR_DESSOLVE_TEAM_REQUEST = 'CREATOR_DESSOLVE_TEAM_REQUEST'
export const CREATOR_DESSOLVE_TEAM_SUCCESS = 'CREATOR_DESSOLVE_TEAM_SUCCESS'
export const CREATOR_DESSOLVE_TEAM_FAILURE = 'CREATOR_DESSOLVE_TEAM_FAILURE'

function fetchDissolveTeam(teamID, callback) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}`
  return {
    [FETCH_API]: {
      types: [CREATOR_DESSOLVE_TEAM_REQUEST, CREATOR_DESSOLVE_TEAM_SUCCESS, CREATOR_DESSOLVE_TEAM_FAILURE],
      endpoint,
      schema: {},
      options: {
        method: 'DELETE',
      },
    },
    callback,
  }
}

export function dissolveTeam(teamID, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDissolveTeam(teamID, callback))
  }
}

export const CHECK_TEAM_DISSOLVABLE_REQUEST = 'CHECK_TEAM_DISSOLVABLE_REQUEST'
export const CHECK_TEAM_DISSOLVABLE_SUCCESS = 'CHECK_TEAM_DISSOLVABLE_SUCCESS'
export const CHECK_TEAM_DISSOLVABLE_FAILURE = 'CHECK_TEAM_DISSOLVABLE_FAILURE'

function fetchCheckDissovable(teamID) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/dissolvable`
  return {
    [FETCH_API]: {
      types: [CHECK_TEAM_DISSOLVABLE_REQUEST, CHECK_TEAM_DISSOLVABLE_SUCCESS, CHECK_TEAM_DISSOLVABLE_FAILURE],
      endpoint,
      schema: {},
    }
  }
}

export function checkDissovable(teamID) {
  return (dispatch, getState) => {
    return dispatch(fetchCheckDissovable(teamID))
  }
}

export const USER_LOGIN_AND_JOIN_TEAM_REQUEST = 'USER_LOGIN_AND_JOIN_TEAM_REQUEST'
export const USER_LOGIN_AND_JOIN_TEAM_SUCCESS = 'USER_LOGIN_AND_JOIN_TEAM_SUCCESS'
export const USER_LOGIN_AND_JOIN_TEAM_FAILURE = 'USER_LOGIN_AND_JOIN_TEAM_FAILURE'

function fetchLoginAndJointeam(email, password, invitationCode, callback) {
  let endpoint = `${API_URL_PREFIX}/stdusers/loginAndJointeam`
  return {
    [FETCH_API]: {
      types: [USER_LOGIN_AND_JOIN_TEAM_REQUEST, USER_LOGIN_AND_JOIN_TEAM_SUCCESS, USER_LOGIN_AND_JOIN_TEAM_FAILURE],
      endpoint,
      schema: {},
      options:{
        method: 'POST',
        body: {email, password, invitationCode}
      }
    },
    callback
  }
}

export function loginAndJointeam(email, password, invitationCode, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchLoginAndJointeam(email, password, invitationCode, callback))
  }
}

export const GET_TEAM_DETAIL_REQUEST = 'GET_TEAM_DETAIL_REQUEST'
export const GET_TEAM_DETAIL_SUCCESS = 'GET_TEAM_DETAIL_SUCCESS'
export const GET_TEAM_DETAIL_FAILURE = 'GET_TEAM_DETAIL_FAILURE'

function fetchGetTeamDetail(teamID) {
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}`
  return {
    [FETCH_API]: {
      types: [GET_TEAM_DETAIL_REQUEST, GET_TEAM_DETAIL_SUCCESS, GET_TEAM_DETAIL_FAILURE],
      endpoint,
      schema: {},
    },
  }
}

export function getTeamDetail(teamID) {
  return (dispatch, getState) => {
    return dispatch(fetchGetTeamDetail(teamID))
  }
}

export const GET_SPACE_USERS_REQUEST = 'GET_SPACE_USERS_REQUEST'
export const GET_SPACE_USERS_SUCCESS = 'GET_SPACE_USERS_SUCCESS'
export const GET_SPACE_USERS_FAILURE = 'GET_SPACE_USERS_FAILURE'

function fetchSpaceUserList(teamID,spaceID,callback){
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/spaces/${spaceID}/users`
  return {
    [FETCH_API]:{
      types:[GET_SPACE_USERS_REQUEST,GET_SPACE_USERS_SUCCESS,GET_SPACE_USERS_FAILURE],
      endpoint,
      schema:{}
    },
    callback
  }
}
export function getSpaceList(teamID,spaceID,callback){
  return (dispatch,getState) => {
    return dispatch(fetchSpaceUserList(teamID,spaceID,callback))
  }
}

export const ADD_SPACE_USERS_REQUEST = 'ADD_SPACE_USERS_REQUEST'
export const ADD_SPACE_USERS_SUCCESS = 'ADD_SPACE_USERS_SUCCESS'
export const ADD_SPACE_USERS_FAILURE = 'ADD_SPACE_USERS_FAILURE'

function setSpaceUserList(teamID,spaceID,body,callback){
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/spaces/${spaceID}/users`
  return {
    [FETCH_API]:{
      types:[ADD_SPACE_USERS_REQUEST,ADD_SPACE_USERS_SUCCESS,ADD_SPACE_USERS_FAILURE],
      endpoint,
      schema:{},
      options:{
        method: 'POST',
        body
      }
    },
    callback
  }
}
export function setSpaceList(teamID,spaceID,body,callback){
  return (dispatch,getState) => {
    return dispatch(setSpaceUserList(teamID,spaceID,body,callback))
  }
}

export const DELETE_SPACE_USERS_REQUEST = 'DELETE_SPACE_USERS_REQUEST'
export const DELETE_SPACE_USERS_SUCCESS = 'DELETE_SPACE_USERS_SUCCESS'
export const DELETE_SPACE_USERS_FAILURE = 'DELETE_SPACE_USERS_FAILURE'

function deleteSpaceUserList(teamID,spaceID,body,callback){
  let endpoint = `${API_URL_PREFIX}/teams/${teamID}/spaces/${spaceID}/deleteusers`
  return {
    [FETCH_API]:{
      types:[DELETE_SPACE_USERS_REQUEST,DELETE_SPACE_USERS_SUCCESS,DELETE_SPACE_USERS_FAILURE],
      endpoint,
      schema:{},
      options:{
        method:'POST',
        body
      }
    },
    callback
  }
}
export function deleteSpaceList(teamID,spaceID,body,callback){
  return (dispatch,getState) => {
    return dispatch(deleteSpaceUserList(teamID,spaceID,body,callback))
  }
}