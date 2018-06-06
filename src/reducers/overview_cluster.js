/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for cluster overview
 *
 * v0.1 - 2016-11-21
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/overview_cluster'
import reducerFactory from './factory'

const option = {
  overwrite: true
}

export default function overviewCluster(state = {
  clusterInfo: {},
  clusterOperations: {},
  clusterSysinfo: {},
  clusterStorage: {},
  clusterAppStatus: {},
  clusterDbServices: {},
  clusterNodeSummary: {},
  clusterSummary: {},
}, action) {
  return {
    clusterInfo: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_CLUSTERINFO_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_CLUSTERINFO_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_CLUSTERINFO_FAILURE
    }, state.clusterInfo, action, option),
    clusterOperations: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_CLUSTER_OPERATIONS_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_CLUSTER_OPERATIONS_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_CLUSTER_OPERATIONS_FAILURE
    }, state.clusterOperations, action, option),
    clusterSysinfo: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_CLUSTER_SYSINFO_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_CLUSTER_SYSINFO_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_CLUSTER_SYSINFO_FAILURE
    }, state.clusterSysinfo, action, option),
    clusterStorage: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_CLUSTER_STORAGE_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_CLUSTER_STORAGE_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_CLUSTER_STORAGE_FAILURE
    }, state.clusterStorage, action, option),
    clusterAppStatus: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_CLUSTER_APPSTATUS_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_CLUSTER_APPSTATUS_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_CLUSTER_APPSTATUS_FAILURE
    }, state.clusterAppStatus, action, option),
    clusterDbServices: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_CLUSTER_DBSERVICE_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_CLUSTER_DBSERVICE_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_CLUSTER_DBSERVICE_FAILURE
    }, state.clusterDbServices, action, option),
    clusterNodeSummary: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_CLUSTER_NODESUMMARY_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_CLUSTER_NODESUMMARY_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_CLUSTER_NODESUMMARY_FAILURE
    }, state.clusterNodeSummary, action, option),
    clusterSummary: reducerFactory({
      REQUEST: ActionTypes.OVERVIEW_CLUSTER_SUMMARY_REQUEST,
      SUCCESS: ActionTypes.OVERVIEW_CLUSTER_SUMMARY_SUCCESS,
      FAILURE: ActionTypes.OVERVIEW_CLUSTER_SUMMARY_FAILURE
    }, state.clusterSummary, action, option)
  }
}