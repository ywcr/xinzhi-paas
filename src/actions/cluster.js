/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Cluster actions
 *
 * v0.1 - 2016-11-12
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const CLUSTER_LIST_REQUEST = 'CLUSTER_LIST_REQUEST'
export const CLUSTER_LIST_SUCCESS = 'CLUSTER_LIST_SUCCESS'
export const CLUSTER_LIST_FAILURE = 'CLUSTER_LIST_FAILURE'

// Fetches cluster list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchClusterList(query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [CLUSTER_LIST_REQUEST, CLUSTER_LIST_SUCCESS, CLUSTER_LIST_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches clusters list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadClusterList(query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterList(query, callback))
  }
}

export const ADD_CLUSTER_REQUEST = 'ADD_CLUSTER_REQUEST'
export const ADD_CLUSTER_SUCCESS = 'ADD_CLUSTER_SUCCESS'
export const ADD_CLUSTER_FAILURE = 'ADD_CLUSTER_FAILURE'

function addFetchCluster(body, callback) {
  return {
    [FETCH_API]: {
      types: [ADD_CLUSTER_REQUEST, ADD_CLUSTER_SUCCESS, ADD_CLUSTER_FAILURE],
      endpoint:`${API_URL_PREFIX}/clusters/add`,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

export function addClusters(boyd, callback) {
  return (dispatch, getState) => {
    return dispatch(addFetchCluster(body, callback))
  }
}


export const GET_HOST_INFO_REQUEST = 'GET_HOST_INFO_REQUEST'
export const GET_HOST_INFO_SUCCESS = 'GET_HOST_INFO_SUCCESS'
export const GET_HOST_INFO_FAILURE = 'GET_HOST_INFO_FAILURE'
// 主机信息
//  body => { clusterID, node }
function fetchHostInfo(body,callback) {
  return {
    [FETCH_API]: {
      types: [GET_HOST_INFO_REQUEST, GET_HOST_INFO_SUCCESS, GET_HOST_INFO_FAILURE],
      endpoint:`${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/info`,
      schema: {}
    },
    callback
  }
}

export function getHostInfo(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchHostInfo(body, callback))
  }
}

export const GET_CLUSTER_SUMMARY_REQUEST = 'GET_CLUSTER_SUMMARY_REQUEST'
export const GET_CLUSTER_SUMMARY_SUCCESS = 'GET_CLUSTER_SUMMARY_SUCCESS'
export const GET_CLUSTER_SUMMARY_FAILURE = 'GET_CLUSTER_SUMMARY_FAILURE'

function fetchClusterSummary(cluster, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_CLUSTER_SUMMARY_REQUEST, GET_CLUSTER_SUMMARY_SUCCESS, GET_CLUSTER_SUMMARY_FAILURE],
      endpoint:`${API_URL_PREFIX}/clusters/${cluster}/summary`,
      schema: {}
    },
    callback
  }
}

export function getClusterSummary(cluster, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterSummary(cluster, callback))
  }
}

export const GET_CLUSTER_DETAIL_REQUEST = 'GET_CLUSTER_DETAIL_REQUEST'
export const GET_CLUSTER_DETAIL_SUCCESS = 'GET_CLUSTER_DETAIL_SUCCESS'
export const GET_CLUSTER_DETAIL_FAILURE = 'GET_CLUSTER_DETAIL_FAILURE'
// host pod list
function fetchNodesPodList(body,callback) {
  return {
    [FETCH_API]: {
      types: [GET_CLUSTER_DETAIL_REQUEST, GET_CLUSTER_DETAIL_SUCCESS, GET_CLUSTER_DETAIL_FAILURE],
      endpoint:`${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/podlist`,
      schema: {}
    },
    callback
  }
}

export function getNodesPodeList(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchNodesPodList(body, callback))
  }
}

export const SEARCH_NODE_PODLIST = 'SEARCH_NODE_PODLIST'
// pod name search
export function searchPodeList(podName) {
  return {
    podName,
    type: SEARCH_NODE_PODLIST
  }
}

export const LOAD_HOST_METRICS_REQUEST = 'LOAD_HOST_METRICS_REQUEST'
export const LOAD_HOST_METRICS_SUCCESS = 'LOAD_HOST_METRICS_SUCCESS'
export const LOAD_HOST_METRICS_FAILURE = 'LOAD_HOST_METRICS_FAILURE'


// query => cpu || memory, body=> clusterID, nodeName
function fetchHostMetrics(body, query) {
  let endpoint = `${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/metrics`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [LOAD_HOST_METRICS_REQUEST, LOAD_HOST_METRICS_SUCCESS, LOAD_HOST_METRICS_FAILURE],
      endpoint: endpoint,
      schema: {}
    }
  }
}

export function loadHostMetrics(body, query) {
  return (dispatch, getState) => {
    return dispatch(fetchHostMetrics(body, query))
  }
}

export const LOAD_HOST_INSTANT_REQUEST = 'LOAD_HOST_INSTANT_REQUEST'
export const LOAD_HOST_INSTANT_SUCCESS = 'LOAD_HOST_INSTANT_SUCCESS'
export const LOAD_HOST_INSTANT_FAILURE = 'LOAD_HOST_INSTANT_FAILURE'

function fetchHostInstant(body) {
  let endpoint = `${API_URL_PREFIX}/cluster-nodes/${body.clusterID}/${body.clusterName}/instant`

  return {
    [FETCH_API]: {
      types: [LOAD_HOST_INSTANT_REQUEST, LOAD_HOST_INSTANT_SUCCESS, LOAD_HOST_INSTANT_FAILURE],
      endpoint: endpoint,
      schema: {}
    }
  }
}

export function loadHostInstant(body) {
  return (dispatch, getState) => {
    return dispatch(fetchHostInstant(body))
  }
}

export const UPDATE_CLUSTER_REQUEST = 'UPDATE_CLUSTER_REQUEST'
export const UPDATE_CLUSTER_SUCCESS = 'UPDATE_CLUSTER_SUCCESS'
export const UPDATE_CLUSTER_FAILURE = 'UPDATE_CLUSTER_FAILURE'

// Fetches cluster list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateCluster(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_CLUSTER_REQUEST, UPDATE_CLUSTER_SUCCESS, UPDATE_CLUSTER_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

// Fetches update cluster from API unless it is cached.
// Relies on Redux Thunk middleware.
export function updateCluster(cluster, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateCluster(cluster, body, callback))
  }
}

export const UPDATE_CONFIGS_REQUEST = 'UPDATE_CONFIGS_REQUEST'
export const UPDATE_CONFIGS_SUCCESS = 'UPDATE_CONFIGS_SUCCESS'
export const UPDATE_CONFIGS_FAILURE = 'UPDATE_CONFIGS_FAILURE'

// Update cluster configs from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpdateClusterConfig(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_CONFIGS_REQUEST, UPDATE_CONFIGS_SUCCESS, UPDATE_CONFIGS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/configs`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

// Fetches update cluster configs from API unless it is cached.
// Relies on Redux Thunk middleware.
export function updateClusterConfig(cluster, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateClusterConfig(cluster, body, callback))
  }
}

export const GET_ADD_CLUSTER_CMD_REQUEST = 'GET_ADD_CLUSTER_CMD_REQUEST'
export const GET_ADD_CLUSTER_CMD_SUCCESS = 'GET_ADD_CLUSTER_CMD_SUCCESS'
export const GET_ADD_CLUSTER_CMD_FAILURE = 'GET_ADD_CLUSTER_CMD_FAILURE'

function fetchAddClusterCMD(callback) {
  return {
    [FETCH_API]: {
      types: [GET_ADD_CLUSTER_CMD_REQUEST, GET_ADD_CLUSTER_CMD_SUCCESS, GET_ADD_CLUSTER_CMD_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/add-cluster-cmd`,
      schema: {},
    },
    callback
  }
}

export function getAddClusterCMD(callback) {
  return (dispatch) => {
    return dispatch(fetchAddClusterCMD(callback))
  }
}

export const CREATE_CLUSTER_REQUEST = 'CREATE_CLUSTER_REQUEST'
export const CREATE_CLUSTER_SUCCESS = 'CREATE_CLUSTER_SUCCESS'
export const CREATE_CLUSTER_FAILURE = 'CREATE_CLUSTER_FAILURE'

// Fetches cluster list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCreateCluster(body, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_CLUSTER_REQUEST, CREATE_CLUSTER_SUCCESS, CREATE_CLUSTER_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters`,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

// Fetches create cluster from API unless it is cached.
// Relies on Redux Thunk middleware.
export function createCluster(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchCreateCluster(body, callback))
  }
}

export const DELETE_CLUSTER_REQUEST = 'DELETE_CLUSTER_REQUEST'
export const DELETE_CLUSTER_SUCCESS = 'DELETE_CLUSTER_SUCCESS'
export const DELETE_CLUSTER_FAILURE = 'DELETE_CLUSTER_FAILURE'

// Fetches cluster list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchDeleteCluster(cluster, callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_CLUSTER_REQUEST, DELETE_CLUSTER_SUCCESS, DELETE_CLUSTER_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}`,
      options: {
        method: 'DELETE',
      },
      schema: {}
    },
    callback
  }
}

// Fetches create cluster from API unless it is cached.
// Relies on Redux Thunk middleware.
export function deleteCluster(cluster, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteCluster(cluster, callback))
  }
}

export const PROXY_GET_REQUEST = 'PROXY_GET_REQUEST'
export const PROXY_GET_SUCCESS = 'PROXY_GET_SUCCESS'
export const PROXY_GET_FAILURE = 'PROXY_GET_FAILURE'

function fetchProxy(cluster, needFetching, callback, nameSpace) {
  return {
    [FETCH_API]: {
      types: [PROXY_GET_REQUEST, PROXY_GET_SUCCESS, PROXY_GET_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/proxies?namespaces=${nameSpace?nameSpace:''}`,
      schema: {}
    },
    callback,
    needFetching
  }
}

export function getProxy(cluster, needFetching, callback, nameSpace) {
  if(typeof needFetching != 'boolean') {
    callback = needFetching
    needFetching = true
  }
  return (dispatch, getState) => {
    return dispatch(fetchProxy(cluster, needFetching, callback, nameSpace))
  }
}

export const NODES_GET_REQUEST = 'NODES_GET_REQUEST'
export const NODES_GET_SUCCESS = 'NODES_GET_SUCCESS'
export const NODES_GET_FAILURE = 'NODES_GET_FAILURE'

function fetchNode(cluster, needFetching, callback) {
  return {
    [FETCH_API]: {
      types: [NODES_GET_REQUEST, NODES_GET_SUCCESS, NODES_GET_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/rdbs/rdb-z779rf0s/nodes?page=0&size=10`,
      //ApiURI/api/v2/clusters/CID-ca4135da3326/rdbs/rdb-fyonxkt7/nodes?page=0&size=10
      schema: {}
    },
    callback,
    needFetching
  }
}

export function getNode(cluster, needFetching, callback) {
  if(typeof needFetching != 'boolean') {
    callback = needFetching
    needFetching = true
  }
  return (dispatch, getState) => {
    return dispatch(fetchProxy(cluster, needFetching, callback))
  }
}

export const PROXY_UPDATE_REQUEST = 'PROXY_UPDATE_REQUEST'
export const PROXY_UPDATE_SUCCESS = 'PROXY_UPDATE_SUCCESS'
export const PROXY_UPDATE_FAILURE = 'PROXY_UPDATE_FAILURE'

function fetchUpdateProxy(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [PROXY_UPDATE_REQUEST, PROXY_UPDATE_SUCCESS, PROXY_UPDATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/proxies`,
      schema: {},
      options: {
        method: 'PUT',
        body
      }
    },
    callback
  }
}

export function updateProxy(cluster, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateProxy(cluster, body, callback))
  }
}



export const GET_CLUSTER_NODE_ADDR_REQUEST = 'GET_CLUSTER_NODE_ADDR_REQUEST'
export const GET_CLUSTER_NODE_ADDR_SUCCESS = 'GET_CLUSTER_NODE_ADDR_SUCCESS'
export const GET_CLUSTER_NODE_ADDR_FAILURE = 'GET_CLUSTER_NODE_ADDR_FAILURE'

function fetchClusterNodeAddr(cluster, callback) {
  return {
    [FETCH_API]: {
      types: [GET_CLUSTER_NODE_ADDR_REQUEST, GET_CLUSTER_NODE_ADDR_SUCCESS, GET_CLUSTER_NODE_ADDR_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/node_addr`,
      schema: {}
    },
    callback
  }
}

export function getClusterNodeAddr(cluster, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterNodeAddr(cluster, callback))
  }
}


export const GET_CLUSTER_PLUGINS_REQUEST = 'GET_CLUSTER_PLUGINS_REQUEST'
export const GET_CLUSTER_PLUGINS_SUCCESS = 'GET_CLUSTER_PLUGINS_SUCCESS'
export const GET_CLUSTER_PLUGINS_FAILURE = 'GET_CLUSTER_PLUGINS_FAILURE'

function fetchClusterPlugins(cluster, callback) {
  return {
    [FETCH_API]: {
      types: [GET_CLUSTER_PLUGINS_REQUEST, GET_CLUSTER_PLUGINS_SUCCESS, GET_CLUSTER_PLUGINS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/plugins`,
      schema: {}
    },
    callback
  }
}

export function getClusterPlugins(cluster, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchClusterPlugins(cluster, callback))
  }
}



export const UPDATE_CLUSTER_PLUGINS_REQUEST = 'UPDATE_CLUSTER_PLUGINS_REQUEST'
export const UPDATE_CLUSTER_PLUGINS_SUCCESS = 'UPDATE_CLUSTER_PLUGINS_SUCCESS'
export const UPDATE_CLUSTER_PLUGINS_FAILURE = 'UPDATE_CLUSTER_PLUGINS_FAILURE'

function fetchUpdateClusterPlugins(cluster, name, body, callback) {
  const reset = body.reset
  return {
    [FETCH_API]: {
      types: [UPDATE_CLUSTER_PLUGINS_REQUEST, UPDATE_CLUSTER_PLUGINS_SUCCESS, UPDATE_CLUSTER_PLUGINS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/plugins/${name}${reset != undefined ? '?reset=' + reset : ''}`,
      schema: {},
      options: {
        method: 'PUT',
        body: body
      }
    },
    callback
  }
}

export function updateClusterPlugins(cluster, name, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchUpdateClusterPlugins(cluster, name, body, callback))
  }
}

export const DELETE_PLUGINS_REQUEST = 'DELETE_PLUGINS_REQUEST'
export const DELETE_PLUGINS_SUCCESS = 'DELETE_PLUGINS_SUCCESS'
export const DELETE_PLUGINS_FAILURE = 'DELETE_PLUGINS_FAILURE'

function fetchDelPlugins(body,callback) {
  return {
    [FETCH_API]: {
      types: [DELETE_PLUGINS_REQUEST, DELETE_PLUGINS_SUCCESS, DELETE_PLUGINS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${body.cluster}/plugins?pluginNames=${body.pluginNames}`,
      options: {
        method:'DELETE',
      },
      schema: {},
    },
    callback
  }
}

export function deleteMiddleware(plugins,callback) {
  return (dispatch) => {
    return dispatch(fetchDelPlugins(plugins,callback))
  }
}

export const EDIT_PLUGINS_REQUERT = 'EDIT_PLUGINS_REQUERT'
export const EDIT_PLUGINS_SUCCESS = 'EDIT_PLUGINS_SUCCESS'
export const EDIT_PLUGINS_FAILURE = 'EDIT_PLUGINS_FAILURE'

function fetchUpdatePlugins(body,type,callback) {
  return {
    [FETCH_API]: {
      types: [EDIT_PLUGINS_REQUERT, EDIT_PLUGINS_SUCCESS, EDIT_PLUGINS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${body.cluster}/plugins/operation/${type}`,
      options: {
        method:'PUT',
        body:body
      },
      schema: {},
    },
    callback
  }
}


export function updateMiddleware(body,type,callback) {
  return (dispatch) => {
    return dispatch(fetchUpdatePlugins(body,type,callback))
  }
}


export const CREATE_CLUSTER_PLUGINS_REQUEST = 'CREATE_CLUSTER_PLUGINS_REQUEST'
export const CREATE_CLUSTER_PLUGINS_SUCCESS = 'CREATE_CLUSTER_PLUGINS_SUCCESS'
export const CREATE_CLUSTER_PLUGINS_FAILURE = 'CREATE_CLUSTER_PLUGINS_FAILURE'

function fetchCreatePlugins(cluster, body, callback) {
  return {
    [FETCH_API]: {
      types: [CREATE_CLUSTER_PLUGINS_REQUEST, CREATE_CLUSTER_PLUGINS_SUCCESS, CREATE_CLUSTER_PLUGINS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/plugins`,
      options: {
        method:'POST',
        body,
      },
      schema: {},
    },
    callback
  }
}

export function createMiddleware(cluster, body, callback) {
  return (dispatch) => {
    return dispatch(fetchCreatePlugins(cluster, body, callback))
  }
}

export const SET_DEFAULT_GROUP_REQUERT = 'SET_DEFAULT_GROUP_REQUERT'
export const SET_DEFAULT_GROUP_SUCCESS = 'SET_DEFAULT_GROUP_SUCCESS'
export const SET_DEFAULT_GROUP_FAILURE = 'SET_DEFAULT_GROUP_FAILURE'

function fetchSetDefultGruop(clusterID, groupID, callback) {
  return {
    [FETCH_API]: {
      types: [SET_DEFAULT_GROUP_REQUERT, SET_DEFAULT_GROUP_SUCCESS, SET_DEFAULT_GROUP_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterID}/proxies/${groupID}/as_default`,
      options: {
        method:'PUT'
      },
      schema: {},
    },
    callback
  }
}


export function setDefaultGroup(clusterID, groupId, callback) {
  return (dispatch) => {
    return dispatch(fetchSetDefultGruop(clusterID, groupId, callback))
  }
}