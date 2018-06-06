/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  OpenAPI
 *
 * v0.1 - 2016/11/03
 * @author mengyuan
 */

import { FETCH_API } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

export const TOKEN_REQUEST = 'TOKEN_REQUEST'
export const TOKEN_SUCCESS = 'TOKEN_SUCCESS'
export const TOKEN_FAILURE = 'TOKEN_FAILURE'

// get token information
export function fetchTokenInfo() {
  const endpoint = `${API_URL_PREFIX}/token`
  return {
    [FETCH_API]: {
      types: [TOKEN_REQUEST, TOKEN_SUCCESS, TOKEN_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

export function loadApiInfo() {
  return (dispatch) => {
    return dispatch(fetchTokenInfo())
  }
}