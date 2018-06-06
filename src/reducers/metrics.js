/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/24
 * @author ZhaoXueYu
 */

import * as ActionTypes from '../actions/metrics'
import reducerFactory from './factory'

const option = {
  overwrite: true
}

export default function metrics(
  state = {
    containers: {
      CPU: {}, memory: {}, networkReceived: {}, networkTransmitted: {}, allcontainersmetrics: {}
    },
    services: {
      CPU: {}, memory: {}, networkReceived: {}, networkTransmitted: {}, allservicesmetrics: {}
    },
    apps: {
      CPU: {}, memory: {}, networkReceived: {}, networkTransmitted: {}, appAllMetrics: {}
    }
  }, action) {
  return {
    containers: {
      CPU: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_CPU_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_CPU_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_CPU_FAILURE
      }, state.containers.CPU, action, option),
      memory: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_MEMORY_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_MEMORY_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_MEMORY_FAILURE
      }, state.containers.memory, action, option),
      networkReceived: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_NETWORK_RECEIVED_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_NETWORK_RECEIVED_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_NETWORK_RECEIVED_FAILURE
      }, state.containers.networkReceived, action, option),
      networkTransmitted: reducerFactory({
        REQUEST: ActionTypes.METRICS_CONTAINER_NETWORK_TRANSMITTED_REQUEST,
        SUCCESS: ActionTypes.METRICS_CONTAINER_NETWORK_TRANSMITTED_SUCCESS,
        FAILURE: ActionTypes.METRICS_CONTAINER_NETWORK_TRANSMITTED_FAILURE
      }, state.containers.networkTransmitted, action, option),
      allcontainersmetrics: reducerFactory({
        REQUEST: ActionTypes.GET_ALL_METRICS_CONTAINER_REQUEST,
        SUCCESS: ActionTypes.GET_ALL_METRICS_CONTAINER_SUCCESS,
        FAILURE: ActionTypes.GET_ALL_METRICS_CONTAINER_FAILURE
      }, state.containers.allcontainersmetrics, action, option),
    },
    services: {
      CPU: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_CPU_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_CPU_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_CPU_FAILURE
      }, state.services.CPU, action, option),
      memory: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_MEMORY_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_MEMORY_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_MEMORY_FAILURE
      }, state.services.memory, action, option),
      networkReceived: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_NETWORK_RECEIVED_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_NETWORK_RECEIVED_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_NETWORK_RECEIVED_FAILURE
      }, state.services.networkReceived, action, option),
      networkTransmitted: reducerFactory({
        REQUEST: ActionTypes.METRICS_SERVICE_NETWORK_TRANSMITTED_REQUEST,
        SUCCESS: ActionTypes.METRICS_SERVICE_NETWORK_TRANSMITTED_SUCCESS,
        FAILURE: ActionTypes.METRICS_SERVICE_NETWORK_TRANSMITTED_FAILURE
      }, state.services.networkTransmitted, action, option),
      allservicesmetrics: reducerFactory({
        REQUEST: ActionTypes.GET_ALL_METRICS_SERVICE_REQUEST,
        SUCCESS: ActionTypes.GET_ALL_METRICS_SERVICE_SUCCESS,
        FAILURE: ActionTypes.GET_ALL_METRICS_SERVICE_FAILURE
      }, state.services.allservicesmetrics, action, option),
    },
    apps: {
      CPU: reducerFactory({
        REQUEST: ActionTypes.METRICS_APP_CPU_REQUEST,
        SUCCESS: ActionTypes.METRICS_APP_CPU_SUCCESS,
        FAILURE: ActionTypes.METRICS_APP_CPU_FAILURE
      }, state.apps.CPU, action, option),
      memory: reducerFactory({
        REQUEST: ActionTypes.METRICS_APP_MEMORY_REQUEST,
        SUCCESS: ActionTypes.METRICS_APP_MEMORY_SUCCESS,
        FAILURE: ActionTypes.METRICS_APP_MEMORY_FAILURE
      }, state.apps.memory, action, option),
      networkReceived: reducerFactory({
        REQUEST: ActionTypes.METRICS_APP_NETWORK_RECEIVED_REQUEST,
        SUCCESS: ActionTypes.METRICS_APP_NETWORK_RECEIVED_SUCCESS,
        FAILURE: ActionTypes.METRICS_APP_NETWORK_RECEIVED_FAILURE
      }, state.apps.networkReceived, action, option),
      networkTransmitted: reducerFactory({
        REQUEST: ActionTypes.METRICS_APP_NETWORK_TRANSMITTED_REQUEST,
        SUCCESS: ActionTypes.METRICS_APP_NETWORK_TRANSMITTED_SUCCESS,
        FAILURE: ActionTypes.METRICS_APP_NETWORK_TRANSMITTED_FAILURE
      }, state.apps.networkTransmitted, action, option),
      appAllMetrics: reducerFactory({
        REQUEST: ActionTypes.GET_ALL_METRICS_APP_REQUEST,
        SUCCESS: ActionTypes.GET_ALL_METRICS_APP_SUCCESS,
        FAILURE: ActionTypes.GET_ALL_METRICS_APP_FAILURE
      }, state.apps.appAllMetrics, action, option),
    }
  }
}