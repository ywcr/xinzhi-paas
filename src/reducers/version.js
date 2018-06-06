// CHECK_VERSION_REQUEST
/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */
/**
 * Redux reducers for app manage
 *
 * v0.1 - 2016-12-24
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/version'
import merge from 'lodash/merge'

function checkVersion(state, action) {
  switch (action.type) {
    case ActionTypes.CHECK_VERSION_REQUEST:
      return Object.assign({}, state, {
        isFetching: true
      })
    case ActionTypes.CHECK_VERSION_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        data: action.response.result.data
      })
    case ActionTypes.CHECK_VERSION_FAILURE:
      return Object.assign({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}

export default function userPreference(state = {
  checkVersion: {
    isFetching: false,
    data: {}
  },
}, action) {
  return {
    checkVersion: checkVersion(state.checkVersion, action),
  }
}