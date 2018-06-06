/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for settting
 *
 * v0.1 - 2017-03-09
 * @author Yangyubiao
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'



export const GET_GLOBAL_CONFIG_REQUEST = 'GET_GLOBAL_CONFIG_REQUEST'
export const GET_GLOBAL_CONFIG_SUCCESS = 'GET_GLOBAL_CONFIG_SUCCESS'
export const GET_GLOBAL_CONFIG_FAILURE = 'GET_GLOBAL_CONFIG_FAILURE'

function fetchGlobalConfig(cluster, callback) {
  return {
    [FETCH_API]: {
      types: [GET_GLOBAL_CONFIG_REQUEST, GET_GLOBAL_CONFIG_SUCCESS, GET_GLOBAL_CONFIG_FAILURE],
      endpoint: `${API_URL_PREFIX}/cluster/${cluster}/config`,
      schema: {}
    },
    callback
  }
}

export function loadGlobalConfig(cluster, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchGlobalConfig(cluster, callback))
  }
}


export const SAVE_GLOBAL_CONFIG_REQUEST = 'SAVE_GLOBAL_CONFIG_REQUEST'
export const SAVE_GLOBAL_CONFIG_SUCCESS = 'SAVE_GLOBAL_CONFIG_SUCCESS'
export const SAVE_GLOBAL_CONFIG_FAILURE = 'SAVE_GLOBAL_CONFIG_FAILURE'

export function saveGlobalConfig(cluster, type, entity, callback) {
  return {
    [FETCH_API]: {
      endpoint: `${API_URL_PREFIX}/cluster/${cluster}/type/${type}/config`,
      types: [SAVE_GLOBAL_CONFIG_REQUEST, SAVE_GLOBAL_CONFIG_SUCCESS, SAVE_GLOBAL_CONFIG_FAILURE],
      options: {
        method: 'POST',
        body: entity
      },
      schema: {}
    },
    callback
  }
}


export const UPDATE_GLOBAL_CONFIG_REQUEST = 'UPDATE_GLOBAL_CONFIG_REQUEST'
export const UPDATE_GLOBAL_CONFIG_SUCCESS = 'UPDATE_GLOBAL_CONFIG_SUCCESS'
export const UPDATE_GLOBAL_CONFIG_FAILURE = 'UPDATE_GLOBAL_CONFIG_FAILURE'

export function updateGlobalConfig(cluster, configID, type, entity, callback) {
  return {
    [FETCH_API]: {
      endpoint: `${API_URL_PREFIX}/cluster/${cluster}/type/${type}/config`,
      types: [UPDATE_GLOBAL_CONFIG_REQUEST, UPDATE_GLOBAL_CONFIG_SUCCESS, UPDATE_GLOBAL_CONFIG_FAILURE],
      schema: {},
      options: {
        method: 'PUT',
        body: entity
      }
    },
    callback
  }
}

export const IS_VALID_CONFIG_REQUEST = 'IS_VALID_CONFIG_REQUEST'
export const IS_VALID_CONFIG_SUCCESS = 'IS_VALID_CONFIG_SUCCESS'
export const IS_VALID_CONFIG_FAILURE = 'IS_VALID_CONFIG_FAILURE'

export function isValidConfig(type, body, callback) {
  return {
    [FETCH_API]: {
      endpoint: `${API_URL_PREFIX}/type/${type}/isvalidconfig`,
      types: [IS_VALID_CONFIG_REQUEST, IS_VALID_CONFIG_SUCCESS, IS_VALID_CONFIG_FAILURE],
      schema: {},
      options: {
        method: 'POST',
        body
      }
    },
    callback
  }
}

export const VERIFY_EMAIL_REQUEST = 'VALIDATE_EMAIL_REQUEST'
export const VERIFY_EMAIL_SUCCESS = 'VALIDATE_EMAIL_SUCCESS'
export const VERIFY_EMAIL_FAILURE = 'VALIDATE_EMAIL_FAILURE'

export function sendEmailVerification(body, callback) {
  return {
    [FETCH_API]: {
      types: [VERIFY_EMAIL_REQUEST, VERIFY_EMAIL_SUCCESS, VERIFY_EMAIL_FAILURE],
      schema: {},
      endpoint: `${API_URL_PREFIX}/configs/email/verification`,
      options: {
        method: 'POST',
        body: body
      }
    },
    callback
  }
}
