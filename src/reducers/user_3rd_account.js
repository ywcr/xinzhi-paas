/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/**
 * Redux reducers for user 3rd accounts
 *
 * v0.1 - 2017-02-08
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/user_3rd_account'

function wechatScanStatus(state, action) {
  switch (action.type) {
    case ActionTypes.WECHAT_AUTH_QR_CODE_STATUS_REQUEST:
      return Object.assign({}, state, {
        isFetching: true
      })
    case ActionTypes.WECHAT_AUTH_QR_CODE_STATUS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        result: action.response.result
      })
    case ActionTypes.WECHAT_AUTH_QR_CODE_STATUS_FAILURE:
      return Object.assign({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}

export default function user3rdAccount(state = {
  wechatScanStatus: {
    isFetching: false,
  },
}, action) {
  return {
    wechatScanStatus: wechatScanStatus(state.wechatScanStatus, action),
  }
}