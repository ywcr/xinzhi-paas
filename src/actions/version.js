/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for version
 *
 * v0.1 - 2017-02-22
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const CHECK_VERSION_REQUEST = 'CHECK_VERSION_REQUEST'
export const CHECK_VERSION_SUCCESS = 'CHECK_VERSION_SUCCESS'
export const CHECK_VERSION_FAILURE = 'CHECK_VERSION_FAILURE'

// Fetches upgrade or renewals from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchCheckVersion(query, callback) {
  let endpoint = `${API_URL_PREFIX}/versions/check`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [CHECK_VERSION_REQUEST, CHECK_VERSION_SUCCESS, CHECK_VERSION_FAILURE],
      endpoint,
      schema: {}
    },
    callback
  }
}

// Fetches upgrade or renewals from API
// Relies on Redux Thunk middleware.
export function checkVersion(query, callback) {
  return (dispatch) => {
    return dispatch(fetchCheckVersion(query, callback))
  }
}