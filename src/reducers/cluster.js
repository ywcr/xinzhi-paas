/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Cluster reducer
 *
 * v0.1 - 2016-11-12
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/cluster'
import reducerFactory from './factory'
import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'

const option = {
  overwrite: true
}

function clusters(state = {}, action) {
  const defaultState = {
    isFetching: false,
    clusterList: []
  }
  switch (action.type) {
    case ActionTypes.CLUSTER_LIST_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: (
          state && state.clusterList
          ? false
          : true
        )
      })
    case ActionTypes.CLUSTER_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        license: action.response.result.license || {},
        clusterList: action.response.result.data || [],
      })
    case ActionTypes.CLUSTER_LIST_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function clusterSummary(state = {}, action) {
  const { cluster } = action
  const defaultState = {
    [cluster]: {
      isFetching: false,
      summary: {}
    }
  }
  switch (action.type) {
    case ActionTypes.GET_CLUSTER_SUMMARY_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true,
        }
      })
    case ActionTypes.GET_CLUSTER_SUMMARY_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          summary: action.response.result
        }
      })
    case ActionTypes.GET_CLUSTER_SUMMARY_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: false,
        }
      })
    default:
      return state
  }
}

function podeList(state={}, action) {
  const defaultState = {
    result:{ pods:[] }
  }
  switch(action.type) {
    case ActionTypes.GET_CLUSTER_DETAIL_REQUEST:{
      return merge({}, defaultState, state, {
        isFetching: true
      })
    }
    case ActionTypes.GET_CLUSTER_DETAIL_SUCCESS: {
      const bakList = cloneDeep(action.response.result)
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result,
        bakList
      })
    }
    case ActionTypes.GET_CLUSTER_DETAIL_FAILURE: {
      return merge({}, defaultState, state, {
        isFetching: false
      })
    }
    case ActionTypes.SEARCH_NODE_PODLIST: {// search pods list
      const podName = action.podName
      const newState = cloneDeep(state)
      if (podName == '') {
        newState.result = state.bakList
        return newState
      }
      const temp = state.bakList.pods.filter(list => {
        const search = new RegExp(podName)
        if (search.test(list.objectMeta.name)) {
          return true
        }
        return false
      })
      newState.result.pods = temp
      return newState
    }
    default:
      return state
  }
}

function getProxy(state = {}, action) {
  const defaultState = {
    isFetching: false
  }
  switch (action.type) {
  case ActionTypes.PROXY_GET_REQUEST:
    return merge({}, defaultState, state, {
      isFetching: action.needFetching
    })
  case ActionTypes.PROXY_GET_SUCCESS:
    return Object.assign({}, state, { result: Object.assign(state.result || {}, action.response.result)}, {
      isFetching: false
    })
  case ActionTypes.PROXY_GET_FAILURE:
    return merge({}, defaultState, state, {
      isFetching: false
    })
  default:
    return state
  }
}


export default function cluster(state = {
  clusters: {},
  hostMetrics: {},
  hostInfo: {}
}, action) {
  return {
    clusters: clusters(state.clusters, action),
    proxy: getProxy(state.proxy, action),
    createCluster: reducerFactory({
      REQUEST: ActionTypes.CREATE_CLUSTER_REQUEST,
      SUCCESS: ActionTypes.CREATE_CLUSTER_SUCCESS,
      FAILURE: ActionTypes.CREATE_CLUSTER_FAILURE,
    }, state.createCluster, action, option),
    deleteCluster: reducerFactory({
      REQUEST: ActionTypes.DELETE_CLUSTER_REQUEST,
      SUCCESS: ActionTypes.DELETE_CLUSTER_SUCCESS,
      FAILURE: ActionTypes.DELETE_CLUSTER_FAILURE,
    }, state.deleteCluster, action, option),
    addClusterCMD: reducerFactory({
      REQUEST: ActionTypes.GET_ADD_CLUSTER_CMD_REQUEST,
      SUCCESS: ActionTypes.GET_ADD_CLUSTER_CMD_SUCCESS,
      FAILURE: ActionTypes.GET_ADD_CLUSTER_CMD_FAILURE,
    }, state.addClusterCMD, action, option),
    clusterSummary: clusterSummary(state.clusterSummary, action),
    hostInfo: reducerFactory({
      REQUEST: ActionTypes.GET_HOST_INFO_REQUEST,
      SUCCESS: ActionTypes.GET_HOST_INFO_SUCCESS,
      FAILURE: ActionTypes.GET_HOST_INFO_FAILURE,
    }, state.hostInfo, action, option),
    podeList: podeList(state.podeList, action),
    staticInfo: reducerFactory({
      REQUEST: ActionTypes.GET_CLUSTER_STATIC_REQUEST,
      SUCCESS: ActionTypes.GET_CLUSTER_STATIC_SUCCESS,
      FAILURE: ActionTypes.GET_CLUSTER_STATIC_FAILURE,
    }, state.staticInfo, action, option),
    dynamicInfo: reducerFactory({
      REQUEST: ActionTypes.GET_CLUSTER_DYNAMIC_REQUEST,
      SUCCESS: ActionTypes.GET_CLUSTER_DYNAMIC_SUCCESS,
      FAILURE: ActionTypes.GET_CLUSTER_DYNAMIC_FAILURE,
    }, state.dynamicInfo, action, option),
    hostMetrics: reducerFactory({
      REQUEST: ActionTypes.LOAD_HOST_METRICS_REQUEST,
      SUCCESS: ActionTypes.LOAD_HOST_METRICS_SUCCESS,
      FAILURE: ActionTypes.LOAD_HOST_METRICS_FAILURE,
    }, state.hostMetrics, action, option),
    hostInstant: reducerFactory({
      REQUEST: ActionTypes.LOAD_HOST_INSTANT_REQUEST,
      SUCCESS: ActionTypes.LOAD_HOST_INSTANT_SUCCESS,
      FAILURE: ActionTypes.LOAD_HOST_INSTANT_FAILURE,
    }, state.hostInstant, action, option),
    updateProxy: reducerFactory({
      REQUEST: ActionTypes.PROXY_UPDATE_REQUEST,
      SUCCESS: ActionTypes.PROXY_UPDATE_SUCCESS,
      FAILURE: ActionTypes.PROXY_UPDATE_FAILURE
    }, state.updateProxy, action, option),
    getClusterNodeAddr: reducerFactory({
      REQUEST: ActionTypes.GET_CLUSTER_NODE_ADDR_REQUEST,
      SUCCESS: ActionTypes.GET_CLUSTER_NODE_ADDR_SUCCESS,
      FAILURE: ActionTypes.GET_CLUSTER_NODE_ADDR_FAILURE
    }, state.getClusterNodeAddr, action, option),
    clusterPlugins: reducerFactory({
      REQUEST: ActionTypes.GET_CLUSTER_PLUGINS_REQUEST,
      SUCCESS: ActionTypes.GET_CLUSTER_PLUGINS_SUCCESS,
      FAILURE: ActionTypes.GET_CLUSTER_PLUGINS_FAILURE
    }, state.clusterPlugins, action, option),
    updateClusterPlugins: reducerFactory({
      REQUEST: ActionTypes.UPDATE_CLUSTER_PLUGINS_REQUEST,
      SUCCESS: ActionTypes.UPDATE_CLUSTER_PLUGINS_SUCCESS,
      FAILURE: ActionTypes.UPDATE_CLUSTER_PLUGINS_FAILURE
    }, state.updateClusterPlugins, action, option),
    editClusterPlugins: reducerFactory({
      REQUEST: ActionTypes.EDIT_PLUGINS_REQUERT,
      SUCCESS: ActionTypes.EDIT_PLUGINS_SUCCESS,
      FAILURE: ActionTypes.EDIT_PLUGINS_FAILURE
    }, state.editClusterPlugins, action, option),
    deleteClusterPlugins: reducerFactory({
      REQUEST: ActionTypes.DELETE_PLUGINS_REQUEST,
      SUCCESS: ActionTypes.DELETE_PLUGINS_SUCCESS,
      FAILURE: ActionTypes.DELETE_PLUGINS_FAILURE
    }, state.deleteClusterPlugins, action, option),
    createClusterPlugins: reducerFactory({
      REQUEST: ActionTypes.CREATE_CLUSTER_PLUGINS_REQUEST,
      SUCCESS: ActionTypes.CREATE_CLUSTER_PLUGINS_SUCCESS,
      FAILURE: ActionTypes.CREATE_CLUSTER_PLUGINS_FAILURE
    }, state.createClusterPlugins, action, option)
  }
}
