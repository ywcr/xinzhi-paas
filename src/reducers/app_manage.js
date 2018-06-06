/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2016-09-23
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/app_manage'
import merge from 'lodash/merge'
import union from 'lodash/union'
import cloneDeep from 'lodash/cloneDeep'
import reducerFactory from './factory'
import { DEFAULT_PAGE_SIZE } from '../../constants'
import { getAppStatus, getContainerStatus } from '../common/status_identify'
import { filtEvents } from './utils'
import { mergeStateByOpts } from './utils'

function appItems(state = {}, action) {
  const { cluster, customizeOpts } = action
  const defaultState = {
    [cluster]: {
      isFetching: false,
      cluster,
      appList: []
    }
  }
  switch (action.type) {
    case ActionTypes.APP_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: (
            state && state[cluster]
              ? false
              : true
          )
        }
      })
    case ActionTypes.APP_LIST_SUCCESS:
      // Identify app status
      let appList = action.response.result.data || []
      appList = appList.map(app => {
        app.status = getAppStatus(app.services)
        return app
      })
      appList = mergeStateByOpts(state[cluster]['appList'], appList, 'name', customizeOpts)
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          cluster: action.response.result.cluster,
          appList,
          size: action.response.result.count,
          total: action.response.result.total,
        }
      })
    case ActionTypes.APP_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: { isFetching: false }
      })
    case ActionTypes.UPDATE_APP_LIST:
      let apps = state[cluster]
      apps.appList = action.appList.map(app => {
        app.status = getAppStatus(app.services)
        return app
      })
      return Object.assign({}, state, {
        [cluster]: apps
      })
    default:
      return state
  }
}

function appDetail(state = {}, action) {
  const cluster = action.cluster
  const appName = action.appName
  const defaultState = {
    isFetching: false,
    cluster,
    appName,
    app: {}
  }
  switch (action.type) {
    case ActionTypes.APP_DETAIL_REQUEST:
      return merge({}, defaultState, state, { isFetching: true })
    case ActionTypes.APP_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        app: action.response.result.data || {}
      })
    case ActionTypes.APP_DETAIL_FAILURE:
      return merge({}, defaultState, state, { isFetching: true })
    default:
      return state
  }
}

export function apps(state = { appItmes: {} }, action) {
  return {
    appItems: appItems(state.appItems, action),
    appDetail: appDetail(state.appDetail, action),
    createApp: reducerFactory({
      REQUEST: ActionTypes.APP_CREATE_REQUEST,
      SUCCESS: ActionTypes.APP_CREATE_SUCCESS,
      FAILURE: ActionTypes.APP_CREATE_FAILURE
    }, state.createApp, action),
    updateAppDesc: reducerFactory({
      REQUEST: ActionTypes.APP_DESC_UPDATE_REQUEST,
      SUCCESS: ActionTypes.APP_DESC_UPDATE_SUCCESS,
      FAILURE: ActionTypes.APP_DESC_UPDATE_FAILURE
    }, state.updateAppDesc, action),
    deleteApps: reducerFactory({
      REQUEST: ActionTypes.APP_BATCH_DELETE_REQUEST,
      SUCCESS: ActionTypes.APP_BATCH_DELETE_SUCCESS,
      FAILURE: ActionTypes.APP_BATCH_DELETE_FAILURE
    }, state.deleteApps, action),
    stopApps: reducerFactory({
      REQUEST: ActionTypes.APP_BATCH_STOP_REQUEST,
      SUCCESS: ActionTypes.APP_BATCH_STOP_SUCCESS,
      FAILURE: ActionTypes.APP_BATCH_STOP_FAILURE
    }, state.stopApps, action),
    restartApps: reducerFactory({
      REQUEST: ActionTypes.APP_BATCH_RESTART_REQUEST,
      SUCCESS: ActionTypes.APP_BATCH_RESTART_SUCCESS,
      FAILURE: ActionTypes.APP_BATCH_RESTART_FAILURE
    }, state.restartApps, action),
    startApps: reducerFactory({
      REQUEST: ActionTypes.APP_BATCH_START_REQUEST,
      SUCCESS: ActionTypes.APP_BATCH_START_SUCCESS,
      FAILURE: ActionTypes.APP_BATCH_START_FAILURE
    }, state.startApps, action),
    appOrchfile: reducerFactory({
      REQUEST: ActionTypes.APP_ORCH_FILE_REQUEST,
      SUCCESS: ActionTypes.APP_ORCH_FILE_SUCCESS,
      FAILURE: ActionTypes.APP_ORCH_FILE_FAILURE
    }, state.appOrchfile, action),
    appLogs: reducerFactory({
      REQUEST: ActionTypes.APP_OPERATION_LOG_REQUEST,
      SUCCESS: ActionTypes.APP_OPERATION_LOG_SUCCESS,
      FAILURE: ActionTypes.APP_OPERATION_LOG_FAILURE
    }, state.appLogs, action),
    checkAppName: reducerFactory({
      REQUEST: ActionTypes.APP_CHECK_NAME_REQUEST,
      SUCCESS: ActionTypes.APP_CHECK_NAME_SUCCESS,
      FAILURE: ActionTypes.APP_CHECK_NAME_FAILURE
    }, state.checkAppName, action),
    checkServiceName: reducerFactory({
      REQUEST: ActionTypes.SERVICE_CHECK_NAME_REQUEST,
      SUCCESS: ActionTypes.SERVICE_CHECK_NAME_SUCCESS,
      FAILURE: ActionTypes.SERVICE_CHECK_NAME_FAILURE
    }, state.checkServiceName, action),
  }
}


// ~~~ services

/*function serviceItems(state = {}, action) {
  const cluster = action.cluster
  const appName = action.appName
  const defaultState = {
    [cluster]: {
      [appName]: {
        isFetching: false,
        cluster,
        appName,
        serviceList: []
      }
    }
  }
  switch (action.type) {
    case ActionTypes.SERVICE_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          [appName]: {
            isFetching: true
          }
        }
      })
    case ActionTypes.SERVICE_LIST_SUCCESS:
      let serviceList = action.response.result.data || []
      serviceList = serviceList.map((service) => {
        service.status = getServiceStatus(service)
        return service
      })
      return Object.assign({}, state, {
        [cluster]: {
          [appName]: {
            isFetching: false,
            cluster: action.response.result.cluster,
            appName: action.response.result.appName,
            serviceList,
          }
        }
      })
    case ActionTypes.SERVICE_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          [appName]: {
            isFetching: false
          }
        }
      })
    default:
      return state
  }
}*/

// ~~~ containers

function containerItems(state = {}, action) {
  const { cluster, customizeOpts } = action
  const defaultState = {
    [cluster]: {
      isFetching: false,
      cluster,
      size: DEFAULT_PAGE_SIZE,
      total: 0,
      containerList: []
    }
  }
  switch (action.type) {
    case ActionTypes.CONTAINER_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: (
            state && state[cluster]
              ? false
              : true
          )
        }
      })
    case ActionTypes.CONTAINER_LIST_SUCCESS:
      let containers = action.response.result.data || []
      containers = containers.map(container => {
        container.status = getContainerStatus(container)
        return container
      })
      containers = mergeStateByOpts(state[cluster]['containerList'], containers, 'metadata.name', customizeOpts)
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          cluster: action.response.result.cluster,
          appName: action.response.result.appName,
          size: action.response.result.count,
          total: action.response.result.total,
          containerList: containers,
        }
      })
    case ActionTypes.CONTAINER_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: false
        }
      })
    case ActionTypes.UPDATE_CONTAINER_LIST:
      let containerItems = state[cluster]
      containerItems.containerList = action.containerList.map(container => {
        container.status = getContainerStatus(container)
        return container
      })
      return Object.assign({}, state, {
        [cluster]: containerItems
      })
    default:
      return state
  }
}

function containerDetail(state = {}, action) {
  const cluster = action.cluster
  const containerName = action.containerName
  const defaultState = {
    [cluster]: {
      isFetching: false,
      containerName,
      containerList: []
    }
  }
  switch (action.type) {
    case ActionTypes.CONTAINER_DETAIL_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.CONTAINER_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          isFetching: false,
          containerName: action.response.result.containerName,
          container: action.response.result.data
        }
      })
    case ActionTypes.CONTAINER_DETAIL_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: false
        }
      })
    default:
      return state
  }
}

function containerDetailEvents(state = {}, action) {
  const cluster = action.cluster
  const containerName = action.containerName
  const defaultState = {
    [cluster]: {
      [containerName]: {
        isFetching: false,
        eventList: [],
      },
    }
  }
  let eventList
  switch (action.type) {
    case ActionTypes.CONTAINER_DETAIL_EVENTS_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          [containerName]: {
            isFetching: (
              state && state[cluster] && state[cluster][containerName]
                ? false
                : true
            )
          }
        }
      })
    case ActionTypes.CONTAINER_DETAIL_EVENTS_SUCCESS:
      eventList = filtEvents(action.response.result.data.events)
      return Object.assign({}, state, {
        [cluster]: {
          [containerName]: {
            isFetching: false,
            eventList
          }
        }
      })
    case ActionTypes.CONTAINER_DETAIL_EVENTS_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          [containerName]: {
            isFetching: false
          }
        }
      })
    default:
      return state
  }
}

function containerLogs(state = {}, action) {
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false
    }
  }
  switch (action.type) {
    case ActionTypes.CONTAINER_LOGS_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.CONTAINER_LOGS_SUCCESS:
      const uState = cloneDeep(state)
      if (!uState[cluster].logs) uState[cluster].logs = {}
      if (!action.response.result.data) return uState
      uState[cluster].logs.data = union(action.response.result.data, uState[cluster].logs.data)
      if (uState[cluster].logs.data.length % 50 !== 0) uState[cluster].logs.data.unshift({ log: '无更多日志\n' })
      return uState
    case ActionTypes.CONTAINER_LOGS_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: false
        }
      })
    case ActionTypes.CONTAINER_LOGS_CLEAR:
      var dd = merge({}, defaultState, {
        [cluster]: {
          isFetching: false
        }
      })
      return dd
    case ActionTypes.SET_LOGSIZE_STYLE: {
      return Object.assign({}, {logSize: action.logSize})
    }
    default:
      return merge({}, state)
  }
}
function fetchPostNetworkIsolationningress(state = {},action){
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false
    }
  }
  switch (action.type) {
    case ActionTypes.POST_NETWORK_ISOLATION_REQUEST_NINGRESS: 
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.POST_NETWORK_ISOLATION_SUCCESS_NINGRESS:
      return merge({}, defaultState, state,{
        [cluster]: {
          isFetching: false,
          data: action.response.result.data.data.metadata.labels.action,
        }
      })
    case ActionTypes.POST_NETWORK_ISOLATION_FAILURE_NINGRESS:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
  }
}
function getNetworkIsolation(state = {},action){
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false
    }
  }
  switch (action.type) {
    case ActionTypes.GET_NETWORK_ISOLATION_STATUS_REQUEST_INGRESS: 
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.GET_NETWORK_ISOLATION_STATUS_SUCCESS_INGRESS:
      return merge({}, defaultState, state,{
        [cluster]: {
          isFetching: false,
          data: action.response.result,
        }
      })
    case ActionTypes.GET_NETWORK_ISOLATION_STATUS_FAILURE_INGRESS:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
  }
}
function getNetworkIsolationS(state = {},action){
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false
    }
  }
  switch (action.type) {
    case ActionTypes.GET_ISOLATION_STATUS_REQUEST_INGRESS: 
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.GET_ISOLATION_STATUS_SUCCESS_INGRESS:
      return merge({}, defaultState, state,{
        [cluster]: {
          isFetching: false,
          data: action,
        }
      })
    case ActionTypes.GET_ISOLATION_STATUS_FAILURE_INGRESS:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
  }
}
function deleteNetworkIsolation(state = {},action){
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false
    }
  }
  switch (action.type) {
    case ActionTypes.DELETE_NETWORK_ISOLATION_REQUEST: 
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.DELETE_NETWORK_ISOLATION_SUCCESS:
      return merge({}, defaultState, state,{
        [cluster]: {
          isFetching: false,
          data: action,
        }
      })
    case ActionTypes.DELETE_NETWORK_ISOLATION_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
  }
}
function createTemplateingress(state = {},action){
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false
    }
  }
  switch (action.type) {
    case ActionTypes.UPDATE_CREATE_TEMPLATES_REQUEST_INGRESS: 
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.UPDATE_CREATE_TEMPLATES_SUCCESS_INGRESS:
      return merge({}, defaultState, state,{
        [cluster]: {
          isFetching: false,
          data: action.response.result.data.data.metadata.labels.action,
        }
      })
    case ActionTypes.UPDATE_CREATE_TEMPLATES_FAILURE_INGRESS:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
  }
}
// createTemplateingressPacth
function createTemplateingressPacth(state = {},action){
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false
    }
  }
  switch (action.type) {
    case ActionTypes.UPDATE_CREATE_TEMPLATES_REQUEST_INGRESS_PATH: 
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.UPDATE_CREATE_TEMPLATES_SUCCESS_INGRESS_PATH:
      return merge({}, defaultState, state,{
        [cluster]: {
          isFetching: false,
          data: action.response.result,
        }
      })
    case ActionTypes.UPDATE_CREATE_TEMPLATES_FAILURE_INGRESS_PATH:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
  }
}
export function containers(state = {}, action) {
  return {
    containerItems: containerItems(state.containerItems, action),
    containerDetail: containerDetail(state.containerDetail, action),
    fetchPostNetworkIsolationningress:fetchPostNetworkIsolationningress(state.fetchPostNetworkIsolationningress,action),
    getNetworkIsolation:getNetworkIsolation(state.getNetworkIsolation,action),
    createTemplateingressPacth:createTemplateingressPacth(state.createTemplateingressPacth,action),
    createTemplateingress:createTemplateingressPacth(state.createTemplateingressPacth,action),
    containerDetailEvents: containerDetailEvents(state.containerDetailEvents, action),
    deleteNetworkIsolation:deleteNetworkIsolation(state.deleteNetworkIsolation,action),
    containerLogs: containerLogs(state.containerLogs, action),
    deleteContainers: reducerFactory({
      REQUEST: ActionTypes.CONTAINER_BATCH_DELETE_REQUEST,
      SUCCESS: ActionTypes.CONTAINER_BATCH_DELETE_SUCCESS,
      FAILURE: ActionTypes.CONTAINER_BATCH_DELETE_FAILURE
    }, state.deleteContainers, action),
    containerProcess: reducerFactory({
      REQUEST: ActionTypes.CONTAINER_GET_PROCESS_REQUEST,
      SUCCESS: ActionTypes.CONTAINER_GET_PROCESS_SUCCESS,
      FAILURE: ActionTypes.CONTAINER_GET_PROCESS_FAILURE
    }, state.containerProcess, action),
  }
}