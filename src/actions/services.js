/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for services
 *
 * v0.1 - 2016-10-17
 * @author Gaojian
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const SERVICE_LIST_REQUEST = 'SERVICE_LIST_REQUEST'
export const SERVICE_LIST_SUCCESS = 'SERVICE_LIST_SUCCESS'
export const SERVICE_LIST_FAILURE = 'SERVICE_LIST_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceList(cluster, appName, query, callback) {
  let endpoint = `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/services`
  const { customizeOpts } = query || {}
  if (query) {
    delete query.customizeOpts
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    cluster,
    appName,
    customizeOpts,
    [FETCH_API]: {
      types: [SERVICE_LIST_REQUEST, SERVICE_LIST_SUCCESS, SERVICE_LIST_FAILURE],
      endpoint,
      schema: Schemas.SERVICES
    },
    callback
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceList(cluster, appName, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceList(cluster, appName, query, callback))
  }
}

export const UPDATE_APP_SERVICES_LIST = 'UPDATE_APP_SERVICES_LIST'

export function updateAppServicesList(cluster, appName, serviceList) {
  return {
    cluster,
    appName,
    serviceList,
    type: UPDATE_APP_SERVICES_LIST
  }
}

export const SERVICE_ADD_REQUEST = 'SERVICE_ADD_REQUEST'
export const SERVICE_ADD_SUCCESS = 'SERVICE_ADD_SUCCESS'
export const SERVICE_ADD_FAILURE = 'SERVICE_ADD_FAILURE'

function fetchAddService(cluster, appName, body, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_ADD_REQUEST, SERVICE_ADD_SUCCESS, SERVICE_ADD_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/apps/${appName}/services`,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

export function addService(cluster, appName, body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchAddService(cluster, appName, body, callback))
  }
}

export const SERVICE_DETAIL_REQUEST = 'SERVICE_DETAIL_REQUEST'
export const SERVICE_DETAIL_SUCCESS = 'SERVICE_DETAIL_SUCCESS'
export const SERVICE_DETAIL_FAILURE = 'SERVICE_DETAIL_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceDetail(cluster, serviceName, callback) {
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [SERVICE_DETAIL_REQUEST, SERVICE_DETAIL_SUCCESS, SERVICE_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/detail`,
      schema: {}
    },
    callback: callback
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceDetail(cluster, serviceName, callback, requiredFields = []) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceDetail(cluster, serviceName, callback))
  }
}

export const SERVICE_BATCH_DELETE_REQUEST = 'SERVICE_BATCH_DELETE_REQUEST'
export const SERVICE_BATCH_DELETE_SUCCESS = 'SERVICE_BATCH_DELETE_SUCCESS'
export const SERVICE_BATCH_DELETE_FAILURE = 'SERVICE_BATCH_DELETE_FAILURE'

function fetchDeleteServices(cluster, serviceList, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_BATCH_DELETE_REQUEST, SERVICE_BATCH_DELETE_SUCCESS, SERVICE_BATCH_DELETE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/batch-delete`,
      options: {
        method: 'POST',
        body: serviceList
      },
      schema: {}
    },
    callback: callback
  }
}

export function deleteServices(cluster, serviceList, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchDeleteServices(cluster, serviceList, callback))
  }
}


export const GET_ALL_CLUSTER_LINE_REQUEST = 'GET_ALL_CLUSTER_LINE_REQUEST'
export const GET_ALL_CLUSTER_LINE_SUCCESS = 'GET_ALL_CLUSTER_LINE_SUCCESS'
export const GET_ALL_CLUSTER_LINE_FAILURE = 'GET_ALL_CLUSTER_LINE_FAILURE'

function fetchAllPodLine(cluster,name, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_ALL_CLUSTER_LINE_REQUEST, GET_ALL_CLUSTER_LINE_SUCCESS, GET_ALL_CLUSTER_LINE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/pods/${name}`,
      schema: {},
      options: {
        method: 'GET'
      },
    },
    callback
  }
}

export function getAllClusterLine(cluster, name,callback) {
  return (dispatch) => {
    return dispatch(fetchAllPodLine(cluster,name, callback))
  }
}

export const CLEAR_LINE = 'CLEAR_LINE'

export function ClearLine() {
  return {
    type: CLEAR_LINE
  }
}

export const GET_VESSEL_DETAIL_REQUEST = 'GET_VESSEL_DETAIL_REQUEST'
export const GET_VESSEL_DETAIL_SUCCESS = 'GET_VESSEL_DETAIL_SUCCESS'
export const GET_VESSEL_DETAIL_FAILURE = 'GET_VESSEL_DETAIL_FAILURE'

function fetchVesselDetail(cluster,name, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [GET_VESSEL_DETAIL_REQUEST, GET_VESSEL_DETAIL_SUCCESS, GET_VESSEL_DETAIL_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/pods/${name}/detail`,
      schema: {},
      options: {
        method: 'GET'
      },
    },
    callback
  }
}

export function getVesselDetail(cluster, name,callback) {
  return (dispatch) => {
    return dispatch(fetchVesselDetail(cluster,name, callback))
  }
}


export const SERVICE_BATCH_STOP_REQUEST = 'SERVICE_BATCH_STOP_REQUEST'
export const SERVICE_BATCH_STOP_SUCCESS = 'SERVICE_BATCH_STOP_SUCCESS'
export const SERVICE_BATCH_STOP_FAILURE = 'SERVICE_BATCH_STOP_FAILURE'

function fetchStopServices(cluster, serviceList, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_BATCH_STOP_REQUEST, SERVICE_BATCH_STOP_SUCCESS, SERVICE_BATCH_STOP_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/batch-stop`,
      options: {
        method: 'PUT',
        body: serviceList
      },
      schema: {}
    },
    callback: callback
  }
}

export function stopServices(cluster, serviceList, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchStopServices(cluster, serviceList, callback))
  }
}

export const SERVICE_BATCH_RESTART_REQUEST = 'SERVICE_BATCH_RESTART_REQUEST'
export const SERVICE_BATCH_RESTART_SUCCESS = 'SERVICE_BATCH_RESTART_SUCCESS'
export const SERVICE_BATCH_RESTART_FAILURE = 'SERVICE_BATCH_RESTART_FAILURE'

function fetchRestartServices(cluster, serviceList, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_BATCH_RESTART_REQUEST, SERVICE_BATCH_RESTART_SUCCESS, SERVICE_BATCH_RESTART_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/batch-restart`,
      options: {
        method: 'PUT',
        body: serviceList
      },
      schema: {}
    },
    callback: callback
  }
}

export function restartServices(cluster, serviceList, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchRestartServices(cluster, serviceList, callback))
  }
}

export const SERVICE_BATCH_START_REQUEST = 'SERVICE_BATCH_START_REQUEST'
export const SERVICE_BATCH_START_SUCCESS = 'SERVICE_BATCH_START_SUCCESS'
export const SERVICE_BATCH_START_FAILURE = 'SERVICE_BATCH_START_FAILURE'

function fetchStartServices(cluster, serviceList, callback) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_BATCH_START_REQUEST, SERVICE_BATCH_START_SUCCESS, SERVICE_BATCH_START_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/batch-start`,
      options: {
        method: 'PUT',
        body: serviceList
      },
      schema: {}
    },
    callback: callback
  }
}

export const SERVICE_BATCH_QUICK_RESTART_REQUEST = 'SERVICE_BATCH_QUICK_RESTART_REQUEST'
export const SERVICE_BATCH_QUICK_RESTART_SUCCESS = 'SERVICE_BATCH_QUICK_RESTART_SUCCESS'
export const SERVICE_BATCH_QUICK_RESTART_FAILURE = 'SERVICE_BATCH_QUICK_RESTART_FAILURE'

export function startServices(cluster, serviceList, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchStartServices(cluster, serviceList, callback))
  }
}
function fetchQuickRestartServices(cluster, serviceList, callback,type) {
  return {
    cluster,
    [FETCH_API]: {
      types: [SERVICE_BATCH_QUICK_RESTART_REQUEST, SERVICE_BATCH_QUICK_RESTART_SUCCESS, SERVICE_BATCH_QUICK_RESTART_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/batch-quickrestart${type=='appstore'?`?appstore=appstore`:``}`,
      options: {
        method: 'PUT',
        body: serviceList
      },
      schema: {}
    },
    callback: callback
  }
}

export function quickRestartServices(cluster, serviceList, callback,type) {
  return (dispatch, getState) => {
    return dispatch(fetchQuickRestartServices(cluster, serviceList, callback,type))
  }
}

export const SERVICE_CONTAINERS_LIST_REQUEST = 'SERVICE_CONTAINERS_LIST_REQUEST'
export const SERVICE_CONTAINERS_LIST_SUCCESS = 'SERVICE_CONTAINERS_LIST_SUCCESS'
export const SERVICE_CONTAINERS_LIST_FAILURE = 'SERVICE_CONTAINERS_LIST_FAILURE'

// Fetches container list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceContainerList(cluster, namespace,serviceName, query, callback) {
  const { customizeOpts } = query || {}
  return {
    cluster,  
    serviceName,
    customizeOpts,
    [FETCH_API]: {
      types: [SERVICE_CONTAINERS_LIST_REQUEST, SERVICE_CONTAINERS_LIST_SUCCESS, SERVICE_CONTAINERS_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${namespace}/services/${serviceName}/containers`,
      schema: Schemas.CONTAINERS
    },
    callback: callback
  }
}

// Fetches containers list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceContainerList(cluster, namespace,serviceName, query, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceContainerList(cluster,namespace, serviceName, query, callback))
  }
}

export const UPDATE_SERVICE_CONTAINERS_LIST = 'UPDATE_SERVICE_CONTAINERS_LIST'

export function updateServiceContainersList(cluster, serviceName,namespace, containerList) {
  return {
    cluster,
    serviceName,
    namespace,
    containerList,
    type: UPDATE_SERVICE_CONTAINERS_LIST
  }
}

export const SERVICE_DETAIL_EVENTS_REQUEST = 'SERVICE_DETAIL_EVENTS_REQUEST'
export const SERVICE_DETAIL_EVENTS_SUCCESS = 'SERVICE_DETAIL_EVENTS_SUCCESS'
export const SERVICE_DETAIL_EVENTS_FAILURE = 'SERVICE_DETAIL_EVENTS_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchServiceDetailEvents(cluster, serviceName, type) {
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [SERVICE_DETAIL_EVENTS_REQUEST, SERVICE_DETAIL_EVENTS_SUCCESS, SERVICE_DETAIL_EVENTS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/${type}/${serviceName}/events`,
      schema: {}
    }
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadServiceDetailEvents(cluster, serviceName, type) {
  return (dispatch, getState) => {
    return dispatch(fetchServiceDetailEvents(cluster, serviceName, type))
  }
}

export const CONTAINERS_ALL_EVENTS_REQUEST = 'CONTAINERS_ALL_EVENTS_REQUEST'
export const CONTAINERS_ALL_EVENTS_SUCCESS = 'CONTAINERS_ALL_EVENTS_SUCCESS'
export const CONTAINERS_ALL_EVENTS_FAILURE = 'CONTAINERS_ALL_EVENTS_FAILURE'

// Fetches service list from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchContainersAllEvents(cluster, serviceName) {
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [CONTAINERS_ALL_EVENTS_REQUEST, CONTAINERS_ALL_EVENTS_SUCCESS, CONTAINERS_ALL_EVENTS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/service/${serviceName}/pods/events`,
      schema: {}
    }
  }
}

// Fetches services list from API unless it is cached.
// Relies on Redux Thunk middleware.
export function loadContainersAllEvents(cluster, serviceName, type) {
  return (dispatch, getState) => {
    return dispatch(fetchContainersAllEvents(cluster, serviceName, type))
  }
}


export const SERVICE_LOGS_REQUEST = 'SERVICE_LOGS_REQUEST'
export const SERVICE_LOGS_SUCCESS = 'SERVICE_LOGS_SUCCESS'
export const SERVICE_LOGS_FAILURE = 'SERVICE_LOGS_FAILURE'
export const SERVICE_LOGS_CLEAR = 'SERVICE_LOGS_CLEAR'


export function fetchServiceLogs(cluster,namespace, serviceName, body, callback) {
  return {
    cluster,
    serviceName,
    [FETCH_API]: {
      types: [SERVICE_LOGS_REQUEST, SERVICE_LOGS_SUCCESS, SERVICE_LOGS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/namespaces/${namespace}/services/${serviceName}/logs`,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback
  }
}

export function clearServiceLogs(cluster,namespace, serviceName) {
  return {
    cluster,
    namespace,
    serviceName,
    type: SERVICE_LOGS_CLEAR
  }
}

export function loadServiceLogs(cluster,namespace, serviceName, body, callback) {
  return (dispath, getState) => {
    return dispath(fetchServiceLogs(cluster,namespace, serviceName, body, callback))
  }
}


export const SERVICE_GET_K8S_SERVICE_REQUEST = 'SERVICE_GET_K8S_SERVICE_REQUEST'
export const SERVICE_GET_K8S_SERVICE_SUCCESS = 'SERVICE_GET_K8S_SERVICE_SUCCESS'
export const SERVICE_GET_K8S_SERVICE_FAILURE = 'SERVICE_GET_PORT_FAILURE'
export const SERVICE_CLEAR_K8S_SERVICE = 'SERVICE_CLEAR_K8S_SERVICE'

function fetchK8sService(cluster, serviceName, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_GET_K8S_SERVICE_REQUEST, SERVICE_GET_K8S_SERVICE_SUCCESS, SERVICE_GET_K8S_SERVICE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/k8s-service`,
      schema: {}
    },
    callback
  }
}

export function loadK8sService(cluster, serviceName, callback) {
  return (dispath, getState) => {
    return dispath(fetchK8sService(cluster, serviceName, callback))
  }
}

export function clearK8sService() {
  return {
    type: SERVICE_CLEAR_K8S_SERVICE
  }
}


export const SERVICE_CLEAR_DOMIAN = 'SERVICE_CLEAR_DOMIAN'

export function clearServiceDomain() {
  return {
    type: SERVICE_CLEAR_DOMIAN
  }
}

export const SERVICE_BIND_DOMAIN_REQUEST = 'SERVICE_BIND_DOMAIN_REQUEST'
export const SERVICE_BIND_DOMAIN_SUCCESS = 'SERVICE_BIND_DOMAIN_SUCCESS'
export const SERVICE_BIND_DOMAIN_FAILURE = 'SERVICE_BIND_DOMAIN_FAILURE'

function fetchServiceBindDomain(cluster, serviceName, domainInfo, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_BIND_DOMAIN_REQUEST, SERVICE_BIND_DOMAIN_SUCCESS, SERVICE_BIND_DOMAIN_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/binddomain`,
      options: {
        method: 'POST',
        body: domainInfo
      },
      schema: {}
    },
    callback
  }
}

export function serviceBindDomain(cluster, serviceName, domainInfo, callback) {
  return (dispath, getState) => {
    return dispath(fetchServiceBindDomain(cluster, serviceName, domainInfo, callback))
  }
}

export const SERVICE_DELETE_DOMAIN_REQUEST = 'SERVICE_DELETE_DOMAIN_REQUEST'
export const SERVICE_DELETE_DOMAIN_SUCCESS = 'SERVICE_DELETE_DOMAIN_SUCCESS'
export const SERVICE_DELETE_DOMIAN_FAILURE = 'SERVICE_DELETE_DOMAIN_FAILURE'

function fetchDeleteServiceDomain(cluster, serviceName, domainInfo, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_DELETE_DOMAIN_REQUEST, SERVICE_DELETE_DOMAIN_SUCCESS, SERVICE_DELETE_DOMIAN_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/binddomain`,
      options: {
        method: 'PUT',
        body: domainInfo
      },
      schema: {}
    },
    callback
  }
}

export function deleteServiceDomain(cluster, serviceName, domainInfo, callback) {
  return (dispath, getState) => {
    return dispath(fetchDeleteServiceDomain(cluster, serviceName, domainInfo, callback))
  }
}


export const SERVICE_AVAILABILITY_REQUEST = 'SERVICE_AVAILABILITY_REQUEST'
export const SERVICE_AVAILABILITY_SUCCESS = 'SERVICE_AVAILABILITY_SUCCESS'
export const SERVICE_AVAILABILITY_FAILURE = 'SERVICE_AVAILABILITY_FAILURE'

export function fetchChangeServiceAvailability(cluster, serviceName, options, callback) {
  let body = null
  if (typeof options === 'boolean') {
    body = {
      open: options
    }
  }
  else {
    body = {
      livenessProbe: options
    }
  }
  return {
    [FETCH_API]: {
      types: [SERVICE_AVAILABILITY_REQUEST, SERVICE_AVAILABILITY_SUCCESS, SERVICE_AVAILABILITY_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/ha`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

export function changeServiceAvailability(cluster, serviceName, options, callback) {
  return (dispath, getState) => {
    return dispath(fetchChangeServiceAvailability(cluster, serviceName, options, callback))
  }
}

export const SERVICE_GET_AUTO_SCALE_REQUEST = 'SERVICE_GET_AUTO_SCALE_REQUEST'
export const SERVICE_GET_AUTO_SCALE_SUCCESS = 'SERVICE_GET_AUTO_SCALE_SUCCESS'
export const SERVICE_GET_AUTO_SCALE_FAILURE = 'SERVICE_GET_AUTO_SCALE_FAILURE'

function fetchAutoScale(cluster, serviceName, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_GET_AUTO_SCALE_REQUEST, SERVICE_GET_AUTO_SCALE_SUCCESS, SERVICE_GET_AUTO_SCALE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/autoscale`,
      schema: {}
    },
    callback
  }
}

export function loadAutoScale(cluster, serviceName, callback) {
  return (dispath) => {
    return dispath(fetchAutoScale(cluster, serviceName, callback))
  }
}

export const SERVICE_DELETE_AUTO_SCALE_REQUEST = 'SERVICE_DELETE_AUTO_SCALE_REQUEST'
export const SERVICE_DELETE_AUTO_SCALE_SUCCESS = 'SERVICE_DELETE_AUTO_SCALE_SUCCESS'
export const SERVICE_DELETE_AUTO_SCALE_FAILURE = 'SERVICE_DELETE_AUTO_SCALE_FAILURE'

function fetchDeleteAutoScale(cluster, serviceName, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_DELETE_AUTO_SCALE_REQUEST, SERVICE_DELETE_AUTO_SCALE_SUCCESS, SERVICE_DELETE_AUTO_SCALE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/autoscale`,
      options: {
        method: 'DELETE'
      },
      schema: {}
    },
    callback
  }
}

export function deleteAutoScale(cluster, serviceName, callback) {
  return (dispath) => {
    return dispath(fetchDeleteAutoScale(cluster, serviceName, callback))
  }
}

export const SERVICE_UPDATE_AUTO_SCALE_REQUEST = 'SERVICE_UPDATE_AUTO_SCALE_REQUEST'
export const SERVICE_UPDATE_AUTO_SCALE_SUCCESS = 'SERVICE_UPDATE_AUTO_SCALE_SUCCESS'
export const SERVICE_UPDATE_AUTO_SCALE_FAILURE = 'SERVICE_UPDATE_AUTO_SCALE_FAILURE'

function fetchUpdateAutoScale(cluster, serviceName, body, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_UPDATE_AUTO_SCALE_REQUEST, SERVICE_UPDATE_AUTO_SCALE_SUCCESS, SERVICE_UPDATE_AUTO_SCALE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/autoscale`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

export function updateAutoScale(cluster, serviceName, body, callback) {
  return (dispath) => {
    return dispath(fetchUpdateAutoScale(cluster, serviceName, body, callback))
  }
}

export const SERVICE_MANUAL_SCALE_REQUEST = 'SERVICE_MANUAL_SCALE_REQUEST'
export const SERVICE_MANUAL_SCALE_SUCCESS = 'SERVICE_MANUAL_SCALE_SUCCESS'
export const SERVICE_MANUAL_SCALE_FAILURE = 'SERVICE_MANUAL_SCALE_FAILURE'

function fetchManualScaleService(cluster, serviceName, body, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_MANUAL_SCALE_REQUEST, SERVICE_MANUAL_SCALE_SUCCESS, SERVICE_MANUAL_SCALE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/manualscale`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

export function manualScaleService(cluster, serviceName, body, callback) {
  return (dispath) => {
    return dispath(fetchManualScaleService(cluster, serviceName, body, callback))
  }
}

export const SERVICE_CHANGE_QUOTA_REQUEST = 'SERVICE_CHANGE_QUOTA_REQUEST'
export const SERVICE_CHANGE_QUOTA_SUCCESS = 'SERVICE_CHANGE_QUOTA_SUCCESS'
export const SERVICE_CHANGE_QUOTA_FAILURE = 'SERVICE_CHANGE_QUOTA_FAILURE'

function fetchChangeQuotaService(cluster, serviceName, body, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_CHANGE_QUOTA_REQUEST, SERVICE_CHANGE_QUOTA_SUCCESS, SERVICE_CHANGE_QUOTA_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/quota`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

export function changeQuotaService(cluster, serviceName, body, callback) {
  return (dispath) => {
    return dispath(fetchChangeQuotaService(cluster, serviceName, body, callback))
  }
}


export const SERVICE_ROLLING_UPDATE_REQUEST = 'SERVICE_ROLLING_UPDATE_REQUEST'
export const SERVICE_ROLLING_UPDATE_SUCCESS = 'SERVICE_ROLLING_UPDATE_SUCCESS'
export const SERVICE_ROLLING_UPDATE_FAILURE = 'SERVICE_ROLLING_UPDATE_FAILURE'

function fetchRollingUpdateService(cluster, serviceName, body, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_ROLLING_UPDATE_REQUEST, SERVICE_ROLLING_UPDATE_SUCCESS, SERVICE_ROLLING_UPDATE_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${serviceName}/rollingupdate`,
      options: {
        method: 'PUT',
        body
      },
      schema: {}
    },
    callback
  }
}

export function rollingUpdateService(cluster, serviceName, body, callback) {
  return (dispath) => {
    return dispath(fetchRollingUpdateService(cluster, serviceName, body, callback))
  }
}


// Get all service
export const SERVICE_GET_ALL_LIST_REQUEST = 'SERVICE_GET_ALL_LIST_REQUEST'
export const SERVICE_GET_ALL_LIST_SUCCESS = 'SERVICE_GET_ALL_LIST_SUCCESS'
export const SERVICE_GET_ALL_LIST_FAILURE = 'SERVICE_GET_ALL_LIST_FAILURE'

export function fetchAllServices(cluster, {pageIndex, pageSize, name, customizeOpts,nameSpace}, callback) {
  return {
    customizeOpts,
    [FETCH_API]: {
      types: [SERVICE_GET_ALL_LIST_REQUEST, SERVICE_GET_ALL_LIST_SUCCESS, SERVICE_GET_ALL_LIST_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services?${pageIndex ?`&pageIndex=${pageIndex}` : ''}${pageSize ? `&pageSize=${pageSize}` : ''}${name ? `&name=${name}` : ''}`,
      schema: {},
      options: {
        headers: {teamspace:nameSpace},
      }
    },
    callback
  }
}

export function loadAllServices(cluster, condition, callback) {
  return (dispath, getState) => {
    return dispath(fetchAllServices(cluster, condition, callback))
  }
}

export const UPDATE_SERVICE_GET_ALL_LIST = 'UPDATE_SERVICE_GET_ALL_LIST'

export function updateServicesList(deploymentList) {
  return {
    deploymentList,
    type: UPDATE_SERVICE_GET_ALL_LIST
  }
}

export const SERVICE_GET_CERTIFICATIES_REQUEST = 'SERVICE_GET_CERTIFICATIES_REQUEST'
export const SERVICE_GET_CERTIFICATIES_SUCCESS = 'SERVICE_GET_CERTIFICATIES_SUCCESS'
export const SERVICE_GET_CERTIFICATIES_FAILURE = 'SERVICE_GET_CERTIFICATIES_FAILURE'

function fetchCertificates(cluster, service,callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_GET_CERTIFICATIES_REQUEST, SERVICE_GET_CERTIFICATIES_SUCCESS, SERVICE_GET_CERTIFICATIES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/certificates`,
      schema: {}
    },
    callback
  }
}

export function loadCertificates(cluster, service, callback) {
  return (dispath, getState) => {
    return dispath(fetchCertificates(cluster, service, callback))
  }
}

export const SERVICE_UPDATE_CERTIFICATIES_REQUEST = 'SERVICE_UPDATE_CERTIFICATIES_REQUEST'
export const SERVICE_UPDATE_CERTIFICATIES_SUCCESS = 'SERVICE_UPDATE_CERTIFICATIES_SUCCESS'
export const SERVICE_UPDATE_CERTIFICATIES_FAILURE = 'SERVICE_UPDATE_CERTIFICATIES_FAILURE'

function fetchUpdateCertificates(cluster, service, body, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_UPDATE_CERTIFICATIES_REQUEST, SERVICE_UPDATE_CERTIFICATIES_SUCCESS, SERVICE_UPDATE_CERTIFICATIES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/certificates`,
      options: {
        method: 'PUT',
        body,
      },
      schema: {},
    },
    callback,
  }
}

export function updateCertificates(cluster, service, body, callback) {
  return (dispath, getState) => {
    return dispath(fetchUpdateCertificates(cluster, service, body, callback))
  }
}

export const SERVICE_DELETE_CERTIFICATIES_REQUEST = 'SERVICE_DELETE_CERTIFICATIES_REQUEST'
export const SERVICE_DELETE_CERTIFICATIES_SUCCESS = 'SERVICE_DELETE_CERTIFICATIES_SUCCESS'
export const SERVICE_DELETE_CERTIFICATIES_FAILURE = 'SERVICE_DELETE_CERTIFICATIES_FAILURE'

function fetchDeleteCertificates(cluster, service, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_DELETE_CERTIFICATIES_REQUEST, SERVICE_DELETE_CERTIFICATIES_SUCCESS, SERVICE_DELETE_CERTIFICATIES_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/certificates`,
      options: {
        method: 'DELETE',
      },
      schema: {},
    },
    callback,
  }
}

export function deleteCertificates(cluster, service, callback) {
  return (dispath, getState) => {
    return dispath(fetchDeleteCertificates(cluster, service, callback))
  }
}
export const SERVICE_TOGGLE_HTTPS_REQUEST = 'SERVICE_TOGGLE_HTTPS_REQUEST'
export const SERVICE_TOGGLE_HTTPS_SUCCESS = 'SERVICE_TOGGLE_HTTPS_SUCCESS'
export const SERVICE_TOGGLE_HTTPS_FAILURE = 'SERVICE_TOGGLE_HTTPS_FAILURE'

function fetchToggleHTTPs(cluster, service, status, callback) {
  return {
    [FETCH_API]: {
      types: [SERVICE_TOGGLE_HTTPS_REQUEST, SERVICE_TOGGLE_HTTPS_SUCCESS, SERVICE_TOGGLE_HTTPS_FAILURE],
      endpoint: `${API_URL_PREFIX}/clusters/${cluster}/services/${service}/tls?action=${status}`,
      options: {
        method: 'PUT',
      },
      schema: {},
    },
    callback,
  }
}

export function toggleHTTPs(cluster, service, status, callback) {
  return (dispath, getState) => {
    return dispath(fetchToggleHTTPs(cluster, service, status, callback))
  }
}
export const UPDATE_SERVICE_PORT_REQUEST = 'UPDATE_SERVICE_PORT_REQUEST'
export const UPDATE_SERVICE_PORT_SUCCESS = 'UPDATE_SERVICE_PORT_SUCCESS'
export const UPDATE_SERVICE_PORT_FAILED = 'UPDATE_SERVICE_PORT_FAILURE'

function fetchUpdateServicePort(clusterId, service, portInfo, callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_SERVICE_PORT_REQUEST, UPDATE_SERVICE_PORT_SUCCESS, UPDATE_SERVICE_PORT_FAILED],
      endpoint: `${API_URL_PREFIX}/clusters/${clusterId}/services/${service}/portinfo`,
      options: {
        method: 'PUT',
        body: portInfo
      },
      schema: {}
    },
    callback
  }
}

export function updateServicePort(clusterId, service, portInfo, callback) {
  return (dispath, getState) => {
    return dispath(fetchUpdateServicePort(clusterId, service, portInfo, callback))
  }
}

export const EDIT_SERVICE_ENV_REQUEST = 'EDIT_SERVICE_ENV_REQUEST'
export const EDIT_SERVICE_ENV_SUCCESS = 'EDIT_SERVICE_ENV_SUCCESS'
export const EDIT_SERVICE_ENV_FAILED = 'EDIT_SERVICE_ENV_FAILURE'

function fetchEditServiceEnv(body, callback){
  return {
    [FETCH_API]: {
      types: [EDIT_SERVICE_ENV_REQUEST, EDIT_SERVICE_ENV_SUCCESS, EDIT_SERVICE_ENV_FAILED],
      endpoint: `${API_URL_PREFIX}/clusters/${body.clusterId}/services/${body.service}/env`,
      options: {
        method: 'PUT',
        body: body.arr
      },
      schema: {}
    },
    callback
  }
}

export function editServiceEnv(body, callback){
  return (dispath, getState) => {
    return dispath(fetchEditServiceEnv(body, callback))
  }
}

export const SET_SERVICE_PROXY_REQUEST = 'SET_SERVICE_PROXY_REQUEST'
export const SET_SERVICE_PROXY_SUCCESS = 'SET_SERVICE_PROXY_SUCCESS'
export const SET_SERVICE_PROXY_FAILED = 'SET_SERVICE_PROXY_FAILED'
function fetchSetServiceProxyGroup(body, callback){
  return {
    [FETCH_API]: {
      types: [SET_SERVICE_PROXY_REQUEST, SET_SERVICE_PROXY_SUCCESS, SET_SERVICE_PROXY_FAILED],
      endpoint: `${API_URL_PREFIX}/clusters/${body.cluster}/services/${body.service}/lbgroups/${body.groupID}`,
      options: {
        method: 'PUT',
        body:body
      },
      schema: {}
    },
    callback
  }
}

export function setServiceProxyGroup(body, callback){
  return (dispath, getState) => {
    return dispath(fetchSetServiceProxyGroup(body, callback))
  }
}