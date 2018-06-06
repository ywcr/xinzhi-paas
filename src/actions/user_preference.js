/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for user preference
 *
 * v0.1 - 2016-09-23
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const UPGRADE_OR_RENEWALS_EDITION_REQUEST = 'UPGRADE_OR_RENEWALS_EDITION_REQUEST'
export const UPGRADE_OR_RENEWALS_EDITION_SUCCESS = 'UPGRADE_OR_RENEWALS_EDITION_SUCCESS'
export const UPGRADE_OR_RENEWALS_EDITION_FAILURE = 'UPGRADE_OR_RENEWALS_EDITION_FAILURE'

// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUpgradeOrRenewalsEdition(body) {
  let endpoint = `${API_URL_PREFIX}/user_preference/edition`
  /*if (query) {
    endpoint += `?${toQuerystring(query)}`
  }*/
  return {
    [FETCH_API]: {
      types: [UPGRADE_OR_RENEWALS_EDITION_REQUEST, UPGRADE_OR_RENEWALS_EDITION_SUCCESS, UPGRADE_OR_RENEWALS_EDITION_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    }
  }
}

// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function upgradeOrRenewalsEdition(body) {
  return (dispatch) => {
    return dispatch(fetchUpgradeOrRenewalsEdition(body))
  }
}

export const GET_EDITION_REQUEST = 'GET_EDITION_REQUEST'
export const GET_EDITION_SUCCESS = 'GET_EDITION_SUCCESS'
export const GET_EDITION_FAILURE = 'GET_EDITION_FAILURE'

// Fetches edition from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchEdition(query) {
  let endpoint = `${API_URL_PREFIX}/user_preference/edition`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [GET_EDITION_REQUEST, GET_EDITION_SUCCESS, GET_EDITION_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches edition from API
// Relies on Redux Thunk middleware.
export function getEdition(body) {
  return (dispatch) => {
    return dispatch(fetchEdition(body))
  }
}