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

export const OVERVIEW_CLUSTERINFO_REQUEST = 'OVERVIEW_CLUSTERINFO_REQUEST'
export const OVERVIEW_CLUSTERINFO_SUCCESS = 'OVERVIEW_CLUSTERINFO_SUCCESS'
export const OVERVIEW_CLUSTERINFO_FAILURE = 'OVERVIEW_CLUSTERINFO_FAILURE'

// Fetches cluster info from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchClusterInfo(clusterID) {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_CLUSTERINFO_REQUEST, OVERVIEW_CLUSTERINFO_SUCCESS, OVERVIEW_CLUSTERINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/clusterinfo/clusters/${clusterID}`,
      schema: {}
    }
  }
}

function fetchStdClusterInfo(clusterID) {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_CLUSTERINFO_REQUEST, OVERVIEW_CLUSTERINFO_SUCCESS, OVERVIEW_CLUSTERINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/clusterinfo-std/clusters/${clusterID}`,
      schema: {}
    }
  }
}

// Fetches cluster info from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadClusterInfo(clusterID) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterInfo(clusterID))
  }
}

export function loadStdClusterInfo(clusterID) {
  return (dispatch, getState) => {
    return dispatch(fetchStdClusterInfo(clusterID))
  }
}

export const OVERVIEW_CLUSTER_OPERATIONS_REQUEST = 'OVERVIEW_CLUSTER_OPERATIONS_REQUEST'
export const OVERVIEW_CLUSTER_OPERATIONS_SUCCESS = 'OVERVIEW_CLUSTER_OPERATIONS_SUCCESS'
export const OVERVIEW_CLUSTER_OPERATIONS_FAILURE = 'OVERVIEW_CLUSTER_OPERATIONS_FAILURE'

// Fetches cluster operations from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchClusterOperations(clusterID) {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_CLUSTER_OPERATIONS_REQUEST, OVERVIEW_CLUSTER_OPERATIONS_SUCCESS, OVERVIEW_CLUSTER_OPERATIONS_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/clusters/${clusterID}/operations`,
      schema: {}
    }
  }
}

// Fetches cluster operations from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadClusterOperations(clusterID) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterOperations(clusterID))
  }
}

export const OVERVIEW_CLUSTER_SYSINFO_REQUEST = 'OVERVIEW_CLUSTER_SYSINFO_REQUEST'
export const OVERVIEW_CLUSTER_SYSINFO_SUCCESS = 'OVERVIEW_CLUSTER_SYSINFO_SUCCESS'
export const OVERVIEW_CLUSTER_SYSINFO_FAILURE = 'OVERVIEW_CLUSTER_SYSINFO_FAILURE'

// Fetches cluster system information from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchClusterSysinfo(clusterID) {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_CLUSTER_SYSINFO_REQUEST, OVERVIEW_CLUSTER_SYSINFO_SUCCESS, OVERVIEW_CLUSTER_SYSINFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/clusters/${clusterID}/sysinfo`,
      schema: {}
    }
  }
}

// Fetches cluster system information from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadClusterSysinfo(clusterID) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterSysinfo(clusterID))
  }
}

export const OVERVIEW_CLUSTER_STORAGE_REQUEST = 'OVERVIEW_CLUSTER_STORAGE_REQUEST'
export const OVERVIEW_CLUSTER_STORAGE_SUCCESS = 'OVERVIEW_CLUSTER_STORAGE_SUCCESS'
export const OVERVIEW_CLUSTER_STORAGE_FAILURE = 'OVERVIEW_CLUSTER_STORAGE_FAILURE'

// Fetches cluster storage information from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchClusterStorage(clusterID) {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_CLUSTER_STORAGE_REQUEST, OVERVIEW_CLUSTER_STORAGE_SUCCESS, OVERVIEW_CLUSTER_STORAGE_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/clusters/${clusterID}/storage`,
      schema: {}
    }
  }
}

// Fetches cluster storage information from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadClusterStorage(clusterID) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterStorage(clusterID))
  }
}

export const OVERVIEW_CLUSTER_APPSTATUS_REQUEST = 'OVERVIEW_CLUSTER_APPSTATUS_REQUEST'
export const OVERVIEW_CLUSTER_APPSTATUS_SUCCESS = 'OVERVIEW_CLUSTER_APPSTATUS_SUCCESS'
export const OVERVIEW_CLUSTER_APPSTATUS_FAILURE = 'OVERVIEW_CLUSTER_APPSTATUS_FAILURE'

// Fetches cluster app status information from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchClusterAppStatus(clusterID) {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_CLUSTER_APPSTATUS_REQUEST, OVERVIEW_CLUSTER_APPSTATUS_SUCCESS, OVERVIEW_CLUSTER_APPSTATUS_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/clusters/${clusterID}/appstatus`,
      schema: {}
    }
  }
}

// Fetches cluster app status information from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadClusterAppStatus(clusterID) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterAppStatus(clusterID))
  }
}

export const OVERVIEW_CLUSTER_DBSERVICE_REQUEST = 'OVERVIEW_CLUSTER_DBSERVICE_REQUEST'
export const OVERVIEW_CLUSTER_DBSERVICE_SUCCESS = 'OVERVIEW_CLUSTER_DBSERVICE_SUCCESS'
export const OVERVIEW_CLUSTER_DBSERVICE_FAILURE = 'OVERVIEW_CLUSTER_DBSERVICE_FAILURE'

// Fetches cluster db services information from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchClusterDbServices(clusterID) {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_CLUSTER_DBSERVICE_REQUEST, OVERVIEW_CLUSTER_DBSERVICE_SUCCESS, OVERVIEW_CLUSTER_DBSERVICE_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/clusters/${clusterID}/dbservices`,
      schema: {}
    }
  }
}

// Fetches cluster db services information from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadClusterDbServices(clusterID) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterDbServices(clusterID))
  }
}

export const OVERVIEW_CLUSTER_NODESUMMARY_REQUEST = 'OVERVIEW_CLUSTER_NODESUMMARY_REQUEST'
export const OVERVIEW_CLUSTER_NODESUMMARY_SUCCESS = 'OVERVIEW_CLUSTER_NODESUMMARY_SUCCESS'
export const OVERVIEW_CLUSTER_NODESUMMARY_FAILURE = 'OVERVIEW_CLUSTER_NODESUMMARY_FAILURE'

// Fetches cluster node summary information from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchClusterNodeSummary(clusterID) {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_CLUSTER_NODESUMMARY_REQUEST, OVERVIEW_CLUSTER_NODESUMMARY_SUCCESS, OVERVIEW_CLUSTER_NODESUMMARY_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/clusters/${clusterID}/nodesummary`,
      schema: {}
    }
  }
}

// Fetches cluster node summary information from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadClusterNodeSummary(clusterID) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterNodeSummary(clusterID))
  }
}


export const OVERVIEW_CLUSTER_SUMMARY_REQUEST = 'OVERVIEW_CLUSTER_SUMMARY_REQUEST'
export const OVERVIEW_CLUSTER_SUMMARY_SUCCESS = 'OVERVIEW_CLUSTER_SUMMARY_SUCCESS'
export const OVERVIEW_CLUSTER_SUMMARY_FAILURE = 'OVERVIEW_CLUSTER_SUMMARY_FAILURE'

// Fetches cluster summary information from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchClusterSummary(clusterID, callback) {
  return {
    [FETCH_API]: {
      types: [OVERVIEW_CLUSTER_SUMMARY_REQUEST, OVERVIEW_CLUSTER_SUMMARY_SUCCESS, OVERVIEW_CLUSTER_SUMMARY_FAILURE],
      endpoint: `${API_URL_PREFIX}/overview/clusters/${clusterID}/summary`,
      schema: {}
    },
    callback
  }
}

// Fetches cluster summary information from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadClusterSummary(clusterID, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterSummary(clusterID, callback))
  }
}
