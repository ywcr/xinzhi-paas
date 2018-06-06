/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for payments
 *
 * v0.1 - 2017-05-20
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const GET_LDAP_REQUEST = 'GET_LDAP_REQUEST'
export const GET_LDAP_SUCCESS = 'GET_LDAP_SUCCESS'
export const GET_LDAP_FAILURE = 'GET_LDAP_FAILURE'

function fetchLdap(callback) {
  return {
    [FETCH_API]: {
      types: [GET_LDAP_REQUEST, GET_LDAP_SUCCESS, GET_LDAP_FAILURE],
      endpoint: `${API_URL_PREFIX}/configs/ldap`,
      schema: {}
    },
    callback
  }
}

export function getLdap(callback) {
  return (dispatch) => {
    return dispatch(fetchLdap(callback))
  }
}

export const UPSERT_LDAP_REQUEST = 'UPSERT_LDAP_REQUEST'
export const UPSERT_LDAP_SUCCESS = 'UPSERT_LDAP_SUCCESS'
export const UPSERT_LDAP_FAILURE = 'UPSERT_LDAP_FAILURE'

function fetchUpsertLdap(body, callback) {
  return {
    [FETCH_API]: {
      types: [UPSERT_LDAP_REQUEST, UPSERT_LDAP_SUCCESS, UPSERT_LDAP_FAILURE],
      endpoint: `${API_URL_PREFIX}/configs/ldap`,
      options: {
        method: 'POST',
        body: body
      },
      schema: {}
    },
    callback
  }
}

export function upsertLdap(body, callback) {
  return (dispatch) => {
    return dispatch(fetchUpsertLdap(body, callback))
  }
}

export const SYNC_LDAP_REQUEST = 'SYNC_LDAP_REQUEST'
export const SYNC_LDAP_SUCCESS = 'SYNC_LDAP_SUCCESS'
export const SYNC_LDAP_FAILURE = 'SYNC_LDAP_FAILURE'

function fetchSyncLdap(callback) {
  return {
    [FETCH_API]: {
      types: [SYNC_LDAP_REQUEST, SYNC_LDAP_SUCCESS, SYNC_LDAP_FAILURE],
      endpoint: `${API_URL_PREFIX}/user-directory/ldap`,
      options: {
        method: 'POST',
      },
      schema: {}
    },
    callback
  }
}

export function syncLdap(callback) {
  return (dispatch) => {
    return dispatch(fetchSyncLdap(callback))
  }
}

export const REMOVE_LDAP_REQUEST = 'REMOVE_LDAP_REQUEST'
export const REMOVE_LDAP_SUCCESS = 'REMOVE_LDAP_SUCCESS'
export const REMOVE_LDAP_FAILURE = 'REMOVE_LDAP_FAILURE'

function fetchRemoveLdap(query, callback) {
  let endpoint = `${API_URL_PREFIX}/user-directory/ldap`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [REMOVE_LDAP_REQUEST, REMOVE_LDAP_SUCCESS, REMOVE_LDAP_FAILURE],
      endpoint,
      options: {
        method: 'DELETE',
      },
      schema: {}
    },
    callback
  }
}

export function removeLdap(query, callback) {
  return (dispatch) => {
    return dispatch(fetchRemoveLdap(query, callback))
  }
}
