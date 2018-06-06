/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2016-09-23
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/services'
import merge from 'lodash/merge'
import union from 'lodash/union'
import reducerFactory from './factory'
import cloneDeep from 'lodash/cloneDeep'
import { getServiceStatus, getContainerStatus } from '../common/status_identify'
import { mergeStateByOpts } from './utils'

function serviceItems(state = {}, action) {
  const { cluster, appName, customizeOpts } = action
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
    if(!appName) return merge({}, defaultState, state, {})
      return merge({}, defaultState, state, {
        [cluster]: {
          [appName]: {
            isFetching: (
              state && state[cluster] && state[cluster][appName]
                ? false
                : true
            )
          }
        }
      })
    case ActionTypes.SERVICE_LIST_SUCCESS:
      let serviceList = action.response.result.data || []
      serviceList = serviceList.map((service) => {
        service.status = getServiceStatus(service)
        return service
      })
      serviceList = mergeStateByOpts(state[cluster][appName]['serviceList'], serviceList, 'metadata.name', customizeOpts)
      return Object.assign({}, state, {
        [cluster]: {
          [appName]: {
            isFetching: false,
            cluster: action.response.result.cluster,
            appName: action.response.result.appName,
            total: action.response.result.total,
            availabilityNumber: action.response.result.availableReplicas,
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
    case ActionTypes.UPDATE_APP_SERVICES_LIST:
      let serviceItems = state[cluster][appName]
      serviceItems.serviceList = action.serviceList.map(service => {
        service.status = getServiceStatus(service)
        return service
      })
      return Object.assign({}, state, {
        [cluster]: {
          [appName]: serviceItems
        }
      })
    default:
      return state
  }
}

function serviceDetail(state = {}, action) {
  const cluster = action.cluster
  const serviceName = action.serviceName
  const defaultState = {
    [cluster]: {
      [serviceName]: {
        isFetching: false,
        cluster,
        serviceName,
        service: {}
      }
    }
  }
  switch (action.type) {
    case ActionTypes.SERVICE_DETAIL_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: true
          }
        }
      })
    case ActionTypes.SERVICE_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: false,
            cluster: action.response.result.cluster,
            serviceName: action.response.result.serviceName,
            service: action.response.result.data
          }
        }
      })
    case ActionTypes.SERVICE_DETAIL_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: false
          }
        }
      })
    default:
      return state
  }
}
function serviceList(state = {}, action) {
  const { cluster, customizeOpts } = action
  switch (action.type) {
    case ActionTypes.SERVICE_GET_ALL_LIST_REQUEST: {
      return merge({}, state, {
        isFetching: (
          state && state.services
            ? false
            : true
        )
      })
    }
    case ActionTypes.SERVICE_GET_ALL_LIST_SUCCESS: {
      let services = action.response.result.data.services.map(service => {
        if(service.deployment){
          service.deployment.cluster = service.cluster
          service.deployment.status = getServiceStatus(service.deployment)
          return service.deployment
        }else{
          service.petset.cluster = service.cluster
          service.petset.status = getServiceStatus(service.petset)
          return service.petset
        }
      })
      services = mergeStateByOpts(state.services, services, 'metadata.name', customizeOpts)
      return merge({}, {
        count: action.response.result.data.count,
        services,
        total: action.response.result.data.total,
      }, { isFetching: false })
    }
    case ActionTypes.SERVICE_GET_ALL_LIST_FAILURE: {
      return merge({}, state, { isFetching: false })
    }
    case ActionTypes.UPDATE_SERVICE_GET_ALL_LIST:
      let serviceItems = state
      serviceItems.services = action.deploymentList.map(deployment => {
        deployment.status = getServiceStatus(deployment)
        return deployment
      })
      /*state.services.map(service => {
        action.deploymentList.map(deployment => {
          if (deployment.metadata.name === service.deployment.metadata.name) {
            service.deployment = deployment
            serviceItems.push(service)
          }
        })
      })*/
      return Object.assign({}, state, serviceItems)
    default:
      return state
  }
}


function serviceContainers(state = {}, action) {
  const { cluster, serviceName, customizeOpts} = action
  const defaultState = {
    [cluster]: {
      [serviceName]: {
        isFetching: false,
        cluster,
        serviceName,
        containerList: []
      }
    }
  }
  switch (action.type) {
    case ActionTypes.SERVICE_CONTAINERS_LIST_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: (
              state && state[cluster] && state[cluster][serviceName]
                ? false
                : true
            )
          }
        }
      })
    case ActionTypes.SERVICE_CONTAINERS_LIST_SUCCESS:
      let containerList = action.response.result.data || []
      containerList = containerList.map(container => {
        container.status = getContainerStatus(container)
        return container
      })
      let list =action.response.result.data ||[]
      let listA=[]
      let listArray = list.map((item)=>{
         listA.push(item.metadata.name)
        return listA
      })
      let conta = listA.join(',')
      containerList = mergeStateByOpts(state[cluster][serviceName]['containerList'],containerList, 'metadata.name', customizeOpts,conta)

      return Object.assign({}, state, {
        conta,
        [cluster]: {
          [serviceName]: {
            isFetching: false,
            cluster: action.response.result.cluster,
            serviceName: action.response.result.serviceName,
            containerList,
            conta,
            
          }
        }
      })
    case ActionTypes.SERVICE_CONTAINERS_LIST_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: false
          }
        }
      })
    case ActionTypes.UPDATE_SERVICE_CONTAINERS_LIST:
      let containerItems = state[cluster][serviceName]
      containerItems.containerList = action.containerList.map(container => {
        container.status = getContainerStatus(container)
        return container
      })
      return Object.assign({}, state, {
        [cluster]: {
          [serviceName]: containerItems
        }
      })
    default:
      return state
  }
}

function serviceDetailEvents(state = {}, action) {
  const cluster = action.cluster
  const serviceName = action.serviceName
  const defaultState = {
    [cluster]: {
      [serviceName]: {
        isFetching: false,
        cluster,
        serviceName,
        eventList: []
      }
    }
  }
  switch (action.type) {
    case ActionTypes.SERVICE_DETAIL_EVENTS_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: true
          }
        }
      })
    case ActionTypes.SERVICE_DETAIL_EVENTS_SUCCESS:
      return Object.assign({}, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: false,
            eventList: action.response.result.data.events
          }
        }
      })
    case ActionTypes.SERVICE_DETAIL_EVENTS_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          [serviceName]: {
            isFetching: false
          }
        }
      })
    default:
      return state
  }
}

function serviceLogs(state = {}, action) {
  const cluster = action.cluster
  const defaultState = {
    [cluster]: {
      isFetching: false
    }
  }
  switch (action.type) {
    case ActionTypes.SERVICE_LOGS_REQUEST:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: true
        }
      })
    case ActionTypes.SERVICE_LOGS_SUCCESS:
    const cluster = action.cluster
      const uState = cloneDeep(state)
      if (!uState[cluster].logs) uState[cluster].logs = {}
      uState[cluster].isFetching = false
      if (!action.response.result.data) return uState
      uState[cluster].logs.data = union(action.response.result.data, uState[cluster].logs.data)
      if (uState[cluster].logs.data.length % 50 !== 0) uState[cluster].logs.data.unshift({ log: '无更多日志\n' })
      return uState
    case ActionTypes.SERVICE_LOGS_FAILURE:
      return merge({}, defaultState, state, {
        [cluster]: {
          isFetching: false
        }
      })
    case ActionTypes.SERVICE_LOGS_CLEAR:
      return merge({}, defaultState, {
        [cluster]: {
          isFetching: false
        }
      })
    default:
      return merge({}, state)
  }
}

function k8sService(state = {}, action) {
  switch (action.type) {
    case ActionTypes.SERVICE_GET_K8S_SERVICE_REQUEST:
      return merge({}, state, { isFetching: true })
    case ActionTypes.SERVICE_GET_K8S_SERVICE_SUCCESS:
      return merge({}, { isFetching: false }, action.response.result)
    case ActionTypes.SERVICE_GET_K8S_SERVICE_FAILURE:
      return merge({}, state, { isFetching: false })
    case ActionTypes.SERVICE_CLEAR_K8S_SERVICE:
      return merge({}, { isFetching: false })
    default:
      return state
  }
}

function certificates(state = {}, action) {
  switch (action.type) {
    case ActionTypes.SERVICE_GET_CERTIFICATIES_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypes.SERVICE_GET_CERTIFICATIES_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result
      })
    case ActionTypes.SERVICE_GET_CERTIFICATIES_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        result: {}
      })
    default:
      return state
  }
}

function lifeCycle(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_ALL_CLUSTER_LINE_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypes.GET_ALL_CLUSTER_LINE_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result.data.data
      })
    case ActionTypes.CLEAR_LINE:
        return merge({}, state, {
          isFetching: true
        })
    case ActionTypes.GET_ALL_CLUSTER_LINE_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        result: {}
      })
    default:
      return state
  }
}

function vessDetail(state = {}, action) {
  switch (action.type) {
    case ActionTypes.GET_VESSEL_DETAIL_REQUEST:
      return merge({}, state, {
        isFetching: true
      })
    case ActionTypes.GET_VESSEL_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result.data.data.detail
      })
    case ActionTypes.GET_VESSEL_DETAIL_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        result: {}
      })
    default:
      return state
  }
}



export function services(state = { appItmes: {} }, action) {
  return {
    serviceItems: serviceItems(state.serviceItems, action),
    serviceList: serviceList(state.serviceList, action),
    
    serviceContainers: serviceContainers(state.serviceContainers, action),
    serviceDetail: serviceDetail(state.serviceDetail, action),
    serviceDetailEvents: serviceDetailEvents(state.serviceDetailEvents, action),
    k8sService: k8sService(state.k8sService, action),
    serviceLogs: serviceLogs(state.serviceLogs, action),
    deleteServices: reducerFactory({
      REQUEST: ActionTypes.SERVICE_BATCH_DELETE_REQUEST,
      SUCCESS: ActionTypes.SERVICE_BATCH_DELETE_SUCCESS,
      FAILURE: ActionTypes.SERVICE_BATCH_DELETE_FAILURE
    }, state.deleteServices, action),
    lifeCycle: lifeCycle(state.lifeCycle, action),
    vessDetail: vessDetail(state.vessDetail, action),
    stopServices: reducerFactory({
      REQUEST: ActionTypes.SERVICE_BATCH_STOP_REQUEST,
      SUCCESS: ActionTypes.SERVICE_BATCH_STOP_SUCCESS,
      FAILURE: ActionTypes.SERVICE_BATCH_STOP_FAILURE
    }, state.stopServices, action),
    startServices: reducerFactory({
      REQUEST: ActionTypes.SERVICE_BATCH_START_REQUEST,
      SUCCESS: ActionTypes.SERVICE_BATCH_START_SUCCESS,
      FAILURE: ActionTypes.SERVICE_BATCH_START_FAILURE
    }, state.startServices, action),
    restartServices: reducerFactory({
      REQUEST: ActionTypes.SERVICE_BATCH_RESTART_REQUEST,
      SUCCESS: ActionTypes.SERVICE_BATCH_RESTART_SUCCESS,
      FAILURE: ActionTypes.SERVICE_BATCH_RESTART_FAILURE
    }, state.restartServices, action),
    quickRestartServices: reducerFactory({
      REQUEST: ActionTypes.SERVICE_BATCH_QUICK_RESTART_REQUEST,
      SUCCESS: ActionTypes.SERVICE_BATCH_QUICK_RESTART_SUCCESS,
      FAILURE: ActionTypes.SERVICE_BATCH_QUICK_RESTART_FAILURE
    }, state.quickRestartServices, action),
    serviceAvailability: reducerFactory({
      REQUEST: ActionTypes.SERVICE_AVAILABILITY_REQUEST,
      SUCCESS: ActionTypes.SERVICE_AVAILABILITY_SUCCESS,
      FAILURE: ActionTypes.SERVICE_AVAILABILITY_FAILURE
    }, state.serviceAvailability, action),
    autoScale: reducerFactory({
      REQUEST: ActionTypes.SERVICE_GET_AUTO_SCALE_REQUEST,
      SUCCESS: ActionTypes.SERVICE_GET_AUTO_SCALE_SUCCESS,
      FAILURE: ActionTypes.SERVICE_GET_AUTO_SCALE_FAILURE
    }, state.autoScale, action, { overwrite: true }),
    deleteAutoScale: reducerFactory({
      REQUEST: ActionTypes.SERVICE_DELETE_AUTO_SCALE_REQUEST,
      SUCCESS: ActionTypes.SERVICE_DELETE_AUTO_SCALE_SUCCESS,
      FAILURE: ActionTypes.SERVICE_DELETE_AUTO_SCALE_FAILURE
    }, state.deleteAutoScale, action, { overwrite: true }),
    updateAutoScale: reducerFactory({
      REQUEST: ActionTypes.SERVICE_UPDATE_AUTO_SCALE_REQUEST,
      SUCCESS: ActionTypes.SERVICE_UPDATE_AUTO_SCALE_SUCCESS,
      FAILURE: ActionTypes.SERVICE_UPDATE_AUTO_SCALE_FAILURE
    }, state.updateAutoScale, action, { overwrite: true }),
    manualScaleService: reducerFactory({
      REQUEST: ActionTypes.SERVICE_MANUAL_SCALE_REQUEST,
      SUCCESS: ActionTypes.SERVICE_MANUAL_SCALE_SUCCESS,
      FAILURE: ActionTypes.SERVICE_MANUAL_SCALE_FAILURE
    }, state.manualScaleService, action, { overwrite: true }),
    changeQuotaService: reducerFactory({
      REQUEST: ActionTypes.SERVICE_CHANGE_QUOTA_REQUEST,
      SUCCESS: ActionTypes.SERVICE_CHANGE_QUOTA_SUCCESS,
      FAILURE: ActionTypes.SERVICE_CHANGE_QUOTA_FAILURE
    }, state.changeQuotaService, action, { overwrite: true }),
    rollingUpdateService: reducerFactory({
      REQUEST: ActionTypes.SERVICE_ROLLING_UPDATE_REQUEST,
      SUCCESS: ActionTypes.SERVICE_ROLLING_UPDATE_SUCCESS,
      FAILURE: ActionTypes.SERVICE_ROLLING_UPDATE_FAILURE
    }, state.rollingUpdateService, action, { overwrite: true }),
    certificates: certificates(state.certificates, action),
    updateCertificates: reducerFactory({
      REQUEST: ActionTypes.SERVICE_UPDATE_CERTIFICATIES_REQUEST,
      SUCCESS: ActionTypes.SERVICE_UPDATE_CERTIFICATIES_SUCCESS,
      FAILURE: ActionTypes.SERVICE_UPDATE_CERTIFICATIES_FAILURE
    }, state.updateCertificates, action, { overwrite: true }),
    deleteCertificates: reducerFactory({
      REQUEST: ActionTypes.SERVICE_DELETE_CERTIFICATIES_REQUEST,
      SUCCESS: ActionTypes.SERVICE_DELETE_CERTIFICATIES_SUCCESS,
      FAILURE: ActionTypes.SERVICE_DELETE_CERTIFICATIES_FAILURE
    }, state.deleteCertificates, action, { overwrite: true }),
    updateServicePort: reducerFactory({
      REQUEST: ActionTypes.UPDATE_SERVICE_PORT_REQUEST,
      SUCCESS: ActionTypes.UPDATE_SERVICE_PORT_SUCCESS,
      FAILURE: ActionTypes.UPDATE_SERVICE_PORT_FAILED
    }, state.updateServicePort, action),
    containersAllEvent: reducerFactory({
      REQUEST: ActionTypes.CONTAINERS_ALL_EVENTS_REQUEST,
      SUCCESS: ActionTypes.CONTAINERS_ALL_EVENTS_SUCCESS,
      FAILURE: ActionTypes.CONTAINERS_ALL_EVENTS_FAILURE
    }, state.containersAllEvent, action)
  }
}
