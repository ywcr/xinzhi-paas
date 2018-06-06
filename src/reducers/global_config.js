/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for app manage
 *
 * v0.1 - 2017-03-09
 * @author Yangyubiao
 */

import reducerFactory from './factory'
import * as ActionTypes from  '../actions/global_config'


export function globalConfig(state = {}, action) {
  return {
    saveGlobalConfig: reducerFactory({
      REQUEST: ActionTypes.SAVE_GLOBAL_CONFIG_REQUEST,
      SUCCESS: ActionTypes.SAVE_GLOBAL_CONFIG_SUCCESS,
      FAILURE: ActionTypes.SAVE_GLOBAL_CONFIG_FAILURE
    }, state.saveGlobalConfig, action),
    updateGlobalConfig: reducerFactory({
      REQUEST: ActionTypes.UPDATE_GLOBAL_CONFIG_REQUEST,
      SUCCESS: ActionTypes.UPDATE_GLOBAL_CONFIG_SUCCESS,
      FAILURE: ActionTypes.UPDATE_SERVICE_PORT_FAILED
    }, state.updateGlobalConfig, action),
    globalConfig: reducerFactory({
      REQUEST: ActionTypes.GET_GLOBAL_CONFIG_REQUEST,
      SUCCESS: ActionTypes.GET_GLOBAL_CONFIG_SUCCESS,
      FAILURE: ActionTypes.GET_GLOBAL_CONFIG_FAILURE
    }, state.globalConfig, action),
    isValidConfig: reducerFactory({
      REQUEST: ActionTypes.IS_VALID_CONFIG_REQUEST,
      SUCCESS: ActionTypes.IS_VALID_CONFIG_SUCCESS,
      FAILURE: ActionTypes.IS_VALID_CONFIG_FAILURE
    }, state.isValidConfig, action)
  }
 }
