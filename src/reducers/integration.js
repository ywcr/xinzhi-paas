/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for integration cache
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */

import * as ActionTypes from '../actions/integration'
import merge from 'lodash/merge'
import reducerFactory from './factory'
import cloneDeep from 'lodash/cloneDeep'

function getAllIntegration(state = {}, action) {
  const defaultState = {
    integrations: []
  }
  switch (action.type) {
    case ActionTypes.GET_ALL_INTEGRATION_LIST_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_ALL_INTEGRATION_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        integrations: action.response.result.result.data.vsphere || []
      })
    case ActionTypes.GET_ALL_INTEGRATION_LIST_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getIntegrationDateCenter(state = {}, action) {
  const defaultState = {
    dataCenters: []
  }
  switch (action.type) {
    case ActionTypes.GET_INTEGRATION_DATA_CENTER_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_INTEGRATION_DATA_CENTER_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        dataCenters: action.response.result.result.data.all || []
      })
    case ActionTypes.GET_INTEGRATION_DATA_CENTER_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getIntegrationVmList(state = {}, action) {
  const defaultState = {
    vmList: []
  }
  switch (action.type) {
    case ActionTypes.GET_INTEGRATION_VM_LIST_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_INTEGRATION_VM_LIST_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        vmList: action.response.result.result.data || []
      })
    case ActionTypes.GET_INTEGRATION_VM_LIST_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getCloneVmConfig(state = {}, action) {
  const defaultState = {
    config: {}
  }
  switch (action.type) {
    case ActionTypes.GET_CLONE_VM_CONFIG_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_CLONE_VM_CONFIG_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        config: action.response.result.result.data || {}
      })
    case ActionTypes.GET_CLONE_VM_CONFIG_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getIntegrationPodDetail(state = {}, action) {
  const defaultState = {
    pods: []
  }
  switch (action.type) {
    case ActionTypes.GET_INTEGRATION_POD_DETAIL_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_INTEGRATION_POD_DETAIL_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        pods: action.response.result.result.data || []
      })
    case ActionTypes.GET_INTEGRATION_POD_DETAIL_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

function getIntegrationConfig(state = {}, action) {
  const defaultState = {
    config: {}
  }
  switch (action.type) {
    case ActionTypes.GET_INTEGRATION_DETAIL_CONFIG_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.GET_INTEGRATION_DETAIL_CONFIG_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        config: action.response.result.result.data || {}
      })
    case ActionTypes.GET_INTEGRATION_DETAIL_CONFIG_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

export function integration(state = { integration: {} }, action) {
  return {
    getAllIntegration: getAllIntegration(state.getAllIntegration, action),
    getIntegrationDateCenter: getIntegrationDateCenter(state.getIntegrationDateCenter, action),
    getIntegrationVmList: getIntegrationVmList(state.getIntegrationVmList, action),
    getCloneVmConfig: getCloneVmConfig(state.getCloneVmConfig, action),
    getIntegrationPodDetail: getIntegrationPodDetail(state.getIntegrationPodDetail, action),
    getIntegrationConfig: getIntegrationConfig(state.getIntegrationConfig, action),
    createIntegration: reducerFactory({
      REQUEST: ActionTypes.POST_CREATE_INTEGRATION_REQUEST,
      SUCCESS: ActionTypes.POST_CREATE_INTEGRATION_SUCCESS,
      FAILURE: ActionTypes.POST_CREATE_INTEGRATION_FAILURE
    }, state.createIntegration, action),
    deleteIntegration: reducerFactory({
      REQUEST: ActionTypes.DELETE_INTEGRATION_DETAIL_REQUEST,
      SUCCESS: ActionTypes.DELETE_INTEGRATION_DETAIL_SUCCESS,
      FAILURE: ActionTypes.DELETE_INTEGRATION_DETAIL_FAILURE
    }, state.deleteIntegration, action),
    manageVmDetail: reducerFactory({
      REQUEST: ActionTypes.POST_MANAGE_VM_DETAIL_REQUEST,
      SUCCESS: ActionTypes.POST_MANAGE_VM_DETAIL_SUCCESS,
      FAILURE: ActionTypes.POST_MANAGE_VM_DETAIL_FAILURE
    }, state.manageVmDetail, action),
    createIntegrationVm: reducerFactory({
      REQUEST: ActionTypes.POST_CREATE_INTEGRATION_VM_REQUEST,
      SUCCESS: ActionTypes.POST_CREATE_INTEGRATION_VM_SUCCESS,
      FAILURE: ActionTypes.POST_CREATE_INTEGRATION_VM_FAILURE
    }, state.createIntegrationVm, action),
    updateIntegrationConfig: reducerFactory({
      REQUEST: ActionTypes.UPDATE_INTEGRATION_DETAIL_CONFIG_REQUEST,
      SUCCESS: ActionTypes.UPDATE_INTEGRATION_DETAIL_CONFIG_SUCCESS,
      FAILURE: ActionTypes.UPDATE_INTEGRATION_DETAIL_CONFIG_FAILURE
    }, state.updateIntegrationConfig, action),
  }
}