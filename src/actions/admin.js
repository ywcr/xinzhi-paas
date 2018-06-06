/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for admin
 *
 * v0.1 - 2017-02-13
 * @author shouhong.zhang
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const ADMIN_IS_PW_SET_REQUEST = 'ADMIN_IS_PW_SET_REQUEST'
export const ADMIN_IS_PW_SET_SUCCESS = 'ADMIN_IS_PW_SET_SUCCESS'
export const ADMIN_IS_PW_SET_FAILURE = 'ADMIN_IS_PW_SET_FAILURE'

// Check whether the 'admin' user's password is set from API
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchIsAdminPasswordSet(callback) {
  return {
    [FETCH_API]: {
      types: [ADMIN_IS_PW_SET_REQUEST, ADMIN_IS_PW_SET_SUCCESS, ADMIN_IS_PW_SET_FAILURE],
      endpoint: `${API_URL_PREFIX}/admin/ispwset`,
      schema: {}
    },
    callback
  }
}

// Check whether the 'admin' user's password is set from API unless it is cached.
// Relies on Redux Thunk middleware.
export function isAdminPasswordSet(callback) {
  return (dispatch, getState) => {
    return dispatch(fetchIsAdminPasswordSet(callback))
  }
}

export const ADMIN_SET_PW_REQUEST = 'ADMIN_SET_PW_REQUEST'
export const ADMIN_SET_PW_SUCCESS = 'ADMIN_SET_PW_SUCCESS'
export const ADMIN_SET_PW_FAILURE = 'ADMIN_SET_PW_FAILURE'

// Set 'admin' user password from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchSetAdminPassword(body, callback) {
  let endpoint = `${API_URL_PREFIX}/admin/setpw`
  return {
    [FETCH_API]: {
      types: [ADMIN_SET_PW_REQUEST, ADMIN_SET_PW_SUCCESS, ADMIN_SET_PW_FAILURE],
      endpoint,
      options: {
        method: 'PATCH',
        body
      },
      schema: {}
    },
    callback
  }
}

// Set 'admin' user password from API
// Relies on Redux Thunk middleware.
export function setAdminPassword(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchSetAdminPassword(body, callback))
  }
}