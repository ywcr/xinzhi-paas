/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for charge
 *
 * v0.1 - 2017-02-27
 * @author shouhong.zhang
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const CHARGE_USER_REQUEST = 'CHARGE_USER_REQUEST'
export const CHARGE_USER_SUCCESS = 'CHARGE_USER_SUCCESS'
export const CHARGE_USER_FAILURE = 'CHARGE_USER_FAILURE'

// Charge user from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchChargeUser(body, callback) {
  let endpoint = `${API_URL_PREFIX}/charge/user`
  return {
    [FETCH_API]: {
      types: [CHARGE_USER_REQUEST, CHARGE_USER_SUCCESS, CHARGE_USER_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

// Charge user from API
// Relies on Redux Thunk middleware.
export function chargeUser(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchChargeUser(body, callback))
  }
}

export const CHARGE_TEAMSPACE_REQUEST = 'CHARGE_TEAMSPACE_REQUEST'
export const CHARGE_TEAMSPACE_SUCCESS = 'CHARGE_TEAMSPACE_SUCCESS'
export const CHARGE_TEAMSPACE_FAILURE = 'CHARGE_TEAMSPACE_FAILURE'

// Charge teamspace from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchChargeTeamspace(body, callback) {
  let endpoint = `${API_URL_PREFIX}/charge/teamspace`
  return {
    [FETCH_API]: {
      types: [CHARGE_TEAMSPACE_REQUEST, CHARGE_TEAMSPACE_SUCCESS, CHARGE_TEAMSPACE_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body
      },
      schema: {}
    },
    callback
  }
}

// Charge teamspace from API
// Relies on Redux Thunk middleware.
export function chargeTeamspace(body, callback) {
  return (dispatch, getState) => {
    return dispatch(fetchChargeTeamspace(body, callback))
  }
}