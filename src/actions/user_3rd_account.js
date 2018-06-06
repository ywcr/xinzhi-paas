/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for user 3rd account
 *
 * v0.1 - 2017-01-11
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const WECHAT_AUTH_QR_CODE_REQUEST = 'WECHAT_AUTH_QR_CODE_REQUEST'
export const WECHAT_AUTH_QR_CODE_SUCCESS = 'WECHAT_AUTH_QR_CODE_SUCCESS'
export const WECHAT_AUTH_QR_CODE_FAILURE = 'WECHAT_AUTH_QR_CODE_FAILURE'

// Fetches wechat auth qr code from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchWechatAuthQrCode() {
  return {
    [FETCH_API]: {
      types: [WECHAT_AUTH_QR_CODE_REQUEST, WECHAT_AUTH_QR_CODE_SUCCESS, WECHAT_AUTH_QR_CODE_FAILURE],
      endpoint: `${API_URL_PREFIX}/3rd_account/wechat/auth`,
      schema: {}
    }
  }
}

// Fetches wechat auth qr code from API
// Relies on Redux Thunk middleware.
export function getWechatAuthQrCode() {
  return (dispatch) => {
    return dispatch(fetchWechatAuthQrCode())
  }
}

export const WECHAT_AUTH_QR_CODE_STATUS_REQUEST = 'WECHAT_AUTH_QR_CODE_STATUS_REQUEST'
export const WECHAT_AUTH_QR_CODE_STATUS_SUCCESS = 'WECHAT_AUTH_QR_CODE_STATUS_SUCCESS'
export const WECHAT_AUTH_QR_CODE_STATUS_FAILURE = 'WECHAT_AUTH_QR_CODE_STATUS_FAILURE'

// Fetches wechat auth qr code status from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchWechatAuthQrCodeStatus(query) {
  let endpoint = `${API_URL_PREFIX}/3rd_account/wechat/auth/status`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [WECHAT_AUTH_QR_CODE_STATUS_REQUEST, WECHAT_AUTH_QR_CODE_STATUS_SUCCESS, WECHAT_AUTH_QR_CODE_STATUS_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches wechat auth qr code status from API
// Relies on Redux Thunk middleware.
export function getWechatAuthQrCodeStatus(query) {
  return (dispatch) => {
    return dispatch(fetchWechatAuthQrCodeStatus(query))
  }
}

export const BIND_WECHAT_REQUEST = 'BIND_WECHAT_REQUEST'
export const BIND_WECHAT_SUCCESS = 'BIND_WECHAT_SUCCESS'
export const BIND_WECHAT_FAILURE = 'BIND_WECHAT_FAILURE'

// Fetches bind wechat from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchBindWechat(body, callback) {
  return {
    [FETCH_API]: {
      types: [BIND_WECHAT_REQUEST, BIND_WECHAT_SUCCESS, BIND_WECHAT_FAILURE],
      endpoint: `${API_URL_PREFIX}/users/bind`,
      options: {
        method: 'PATCH',
        body,
      },
      schema: {}
    },
    callback,
  }
}

// Fetches unbind wechat from API
// Relies on Redux Thunk middleware.
export function bindWechat(body, callback) {
  return (dispatch) => {
    return dispatch(fetchBindWechat(body, callback))
  }
}

export const UNBIND_WECHAT_REQUEST = 'UNBIND_WECHAT_REQUEST'
export const UNBIND_WECHAT_SUCCESS = 'UNBIND_WECHAT_SUCCESS'
export const UNBIND_WECHAT_FAILURE = 'UNBIND_WECHAT_FAILURE'

// Fetches unbind wechat from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchUnbindWechat(body) {
  return {
    [FETCH_API]: {
      types: [UNBIND_WECHAT_REQUEST, UNBIND_WECHAT_SUCCESS, UNBIND_WECHAT_FAILURE],
      endpoint: `${API_URL_PREFIX}/users/unbind`,
      options: {
        method: 'PATCH',
        body,
      },
      schema: {}
    }
  }
}

// Fetches bind wechat from API
// Relies on Redux Thunk middleware.
export function unbindWechat(body) {
  return (dispatch) => {
    return dispatch(fetchUnbindWechat(body))
  }
}