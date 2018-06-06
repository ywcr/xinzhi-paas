/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for users
 *
 * v0.1 - 2016-11-18
 * @author shouhong.zhang
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const OVERVIEW_TEAMINFO_REQUEST = 'OVERVIEW_TEAMINFO_REQUEST'
export const OVERVIEW_TEAMINFO_SUCCESS = 'OVERVIEW_TEAMINFO_SUCCESS'
export const OVERVIEW_TEAMINFO_FAILURE = 'OVERVIEW_TEAMINFO_FAILURE'

// Fetches team overview from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamInfo() {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_TEAMINFO_REQUEST, OVERVIEW_TEAMINFO_SUCCESS, OVERVIEW_TEAMINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/teaminfo`,
      schema: {}
    }
  }
}

// Fetches team overview from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamInfo() {
  return (dispatch, getState) => {
    return dispatch(fetchTeamInfo())
  }
}

export const OVERVIEW_TEAM_DETAIL_REQUEST = 'OVERVIEW_TEAM_DETAIL_REQUEST'
export const OVERVIEW_TEAM_DETAIL_SUCCESS = 'OVERVIEW_TEAM_DETAIL_SUCCESS'
export const OVERVIEW_TEAM_DETAIL_FAILURE = 'OVERVIEW_TEAM_DETAIL_FAILURE'

// Fetches team overview detail from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamDetail() {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_TEAM_DETAIL_REQUEST, OVERVIEW_TEAM_DETAIL_SUCCESS, OVERVIEW_TEAM_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/teamdetail`,
      schema: {}
    }
  }
}

// Fetches team overview detail from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamDetail() {
  return (dispatch, getState) => {
    return dispatch(fetchTeamDetail())
  }
}

export const OVERVIEW_TEAM_OPERATIONS_REQUEST = 'OVERVIEW_TEAM_OPERATIONS_REQUEST'
export const OVERVIEW_TEAM_OPERATIONS_SUCCESS = 'OVERVIEW_TEAM_OPERATIONS_SUCCESS'
export const OVERVIEW_TEAM_OPERATIONS_FAILURE = 'OVERVIEW_TEAM_OPERATIONS_FAILURE'

// Fetches team operations from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchTeamOperations() {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_TEAM_OPERATIONS_REQUEST, OVERVIEW_TEAM_OPERATIONS_SUCCESS, OVERVIEW_TEAM_OPERATIONS_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/teamoperations`,
      schema: {}
    }
  }
}

// Fetches team operations from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadTeamOperations() {
  return (dispatch, getState) => {
    return dispatch(fetchTeamOperations())
  }
}