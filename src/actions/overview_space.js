/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for users
 *
 * v0.1 - 2016-11-21
 * @author shouhong.zhang
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const OVERVIEW_SPACEINFO_REQUEST = 'OVERVIEW_SPACEINFO_REQUEST'
export const OVERVIEW_SPACEINFO_SUCCESS = 'OVERVIEW_SPACEINFO_SUCCESS'
export const OVERVIEW_SPACEINFO_FAILURE = 'OVERVIEW_SPACEINFO_FAILURE'

// Fetches space info from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSpaceInfo() {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_SPACEINFO_REQUEST, OVERVIEW_SPACEINFO_SUCCESS, OVERVIEW_SPACEINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/spaceinfo`,
      schema: {}
    }
  }
}

// Fetches space info from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadSpaceInfo() {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceInfo())
  }
}

export const OVERVIEW_SPACE_OPERATIONS_REQUEST = 'OVERVIEW_SPACE_OPERATIONS_REQUEST'
export const OVERVIEW_SPACE_OPERATIONS_SUCCESS = 'OVERVIEW_SPACE_OPERATIONS_SUCCESS'
export const OVERVIEW_SPACE_OPERATIONS_FAILURE = 'OVERVIEW_SPACE_OPERATIONS_FAILURE'

// Fetches space operations from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSpaceOperations() {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_SPACE_OPERATIONS_REQUEST, OVERVIEW_SPACE_OPERATIONS_SUCCESS, OVERVIEW_SPACE_OPERATIONS_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/operations`,
      schema: {}
    }
  }
}

// Fetches space operations from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadSpaceOperations() {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceOperations())
  }
}

export const OVERVIEW_SPACE_CICD_REQUEST = 'OVERVIEW_SPACE_CICD_REQUEST'
export const OVERVIEW_SPACE_CICD_SUCCESS = 'OVERVIEW_SPACE_CICD_SUCCESS'
export const OVERVIEW_SPACE_CICD_FAILURE = 'OVERVIEW_SPACE_CICD_FAILURE'

// Fetches space CICD stats from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSpaceCICDStats(callback) {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_SPACE_CICD_REQUEST, OVERVIEW_SPACE_CICD_SUCCESS, OVERVIEW_SPACE_CICD_FAILURE],
      endpoint: `${API_URL_PREFIX}/devops/stats`,
      schema: {}
    },
    callback
  }
}

// Fetches space CICD stats from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadSpaceCICDStats(callback) {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceCICDStats(callback))
  }
}

export const OVERVIEW_SPACE_IMAGE_REQUEST = 'OVERVIEW_SPACE_IMAGE_REQUEST'
export const OVERVIEW_SPACE_IMAGE_SUCCESS = 'OVERVIEW_SPACE_IMAGE_SUCCESS'
export const OVERVIEW_SPACE_IMAGE_FAILURE = 'OVERVIEW_SPACE_IMAGE_FAILURE'

// Fetches space image stats from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSpaceImageStats(callback) {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_SPACE_IMAGE_REQUEST, OVERVIEW_SPACE_IMAGE_SUCCESS, OVERVIEW_SPACE_IMAGE_FAILURE],
      endpoint: `${API_URL_PREFIX}/registries/:registry/statistics`,
      schema: {}
    },
    callback
  }
}

// Fetches space image stats from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadSpaceImageStats(callback) {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceImageStats(callback))
  }
}

export const OVERVIEW_SPACE_TEMPLATE_REQUEST = 'OVERVIEW_SPACE_TEMPLATE_REQUEST'
export const OVERVIEW_SPACE_TEMPLATE_SUCCESS = 'OVERVIEW_SPACE_TEMPLATE_SUCCESS'
export const OVERVIEW_SPACE_TEMPLATE_FAILURE = 'OVERVIEW_SPACE_TEMPLATE_FAILURE'

// Fetches space template stats from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSpaceTemplateStats() {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_SPACE_TEMPLATE_REQUEST, OVERVIEW_SPACE_TEMPLATE_SUCCESS, OVERVIEW_SPACE_TEMPLATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/templates`,
      schema: {}
    }
  }
}

// Fetches space template stats from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadSpaceTemplateStats() {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceTemplateStats())
  }
}

export const OVERVIEW_SPACE_WARNING_REQUEST = 'OVERVIEW_SPACE_WARNING_REQUEST'
export const OVERVIEW_SPACE_WARNING_SUCCESS = 'OVERVIEW_SPACE_WARNING_SUCCESS'
export const OVERVIEW_SPACE_WARNING_FAILURE = 'OVERVIEW_SPACE_WARNING_FAILURE'

// Fetches space warnings from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSpaceWarnings() {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_SPACE_WARNING_REQUEST, OVERVIEW_SPACE_WARNING_SUCCESS, OVERVIEW_SPACE_WARNING_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/warnings`,
      schema: {}
    }
  }
}

// Fetches space warnings from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadSpaceWarnings() {
  return (dispatch, getState) => {
    return dispatch(fetchSpaceWarnings())
  }
}