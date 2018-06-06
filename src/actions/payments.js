/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Redux actions for payments
 *
 * v0.1 - 2016-09-23
 * @author Zhangpc
 */

import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { toQuerystring } from '../common/tools'

export const WECHAT_PAY_QR_CODE_REQUEST = 'WECHAT_PAY_QR_CODE_REQUEST'
export const WECHAT_PAY_QR_CODE_SUCCESS = 'WECHAT_PAY_QR_CODE_SUCCESS'
export const WECHAT_PAY_QR_CODE_FAILURE = 'WECHAT_PAY_QR_CODE_FAILURE'

// Fetches wechat pay qr code from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchWechatPayQrCode(amount, teamspace, query) {
  let endpoint = `${API_URL_PREFIX}/payments/wechat_pay`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [WECHAT_PAY_QR_CODE_REQUEST, WECHAT_PAY_QR_CODE_SUCCESS, WECHAT_PAY_QR_CODE_FAILURE],
      endpoint,
      options: {
        method: 'POST',
        body: {
          amount
        },
        headers: { teamspace }
      },
      schema: {}
    }
  }
}

// Fetches wechat pay qr code from API
// Relies on Redux Thunk middleware.
export function getWechatPayQrCode(amount, teamspace, query) {
  return (dispatch) => {
    return dispatch(fetchWechatPayQrCode(amount, teamspace, query))
  }
}

export const WECHAT_PAY_ORDER_REQUEST = 'WECHAT_PAY_ORDER_REQUEST'
export const WECHAT_PAY_ORDER_SUCCESS = 'WECHAT_PAY_ORDER_SUCCESS'
export const WECHAT_PAY_ORDER_FAILURE = 'WECHAT_PAY_ORDER_FAILURE'

// Fetches wechat pay order from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchWechatPayOrder(orderId, teamspace, query) {
  let endpoint = `${API_URL_PREFIX}/payments/wechat_pay/${orderId}`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [WECHAT_PAY_ORDER_REQUEST, WECHAT_PAY_ORDER_SUCCESS, WECHAT_PAY_ORDER_FAILURE],
      endpoint,
      options: {
        headers: { teamspace }
      },
      schema: {}
    }
  }
}

// Fetches wechat pay order from API
// Relies on Redux Thunk middleware.
export function getWechatPayOrder(orderId, teamspace, query) {
  return (dispatch) => {
    return dispatch(fetchWechatPayOrder(orderId, teamspace, query))
  }
}

export const PAY_ORDER_STATUS_REQUEST = 'PAY_ORDER_STATUS_REQUEST'
export const PAY_ORDER_STATUS_SUCCESS = 'PAY_ORDER_STATUS_SUCCESS'
export const PAY_ORDER_STATUS_FAILURE = 'PAY_ORDER_STATUS_FAILURE'

// Fetches wechat pay order from API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function fetchPayOrderStatus(query) {
  let endpoint = `${API_URL_PREFIX}/payments/orders/status`
  if (query) {
    endpoint += `?${toQuerystring(query)}`
  }
  return {
    [FETCH_API]: {
      types: [PAY_ORDER_STATUS_REQUEST, PAY_ORDER_STATUS_SUCCESS, PAY_ORDER_STATUS_FAILURE],
      endpoint,
      schema: {}
    }
  }
}

// Fetches wechat pay order from API
// Relies on Redux Thunk middleware.
export function getPayOrderStatus(query) {
  return (dispatch) => {
    return dispatch(fetchPayOrderStatus(query))
  }
}