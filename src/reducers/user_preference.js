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

import * as ActionTypes from '../actions/user_preference'
import merge from 'lodash/merge'

function editions(state, action) {
  switch (action.type) {
    case ActionTypes.GET_EDITION_REQUEST:
      return Object.assign({}, state, {
        isFetching: true
      })
    case ActionTypes.GET_EDITION_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        list: action.response.result.data
      })
    case ActionTypes.GET_EDITION_FAILURE:
      return Object.assign({}, state, {
        isFetching: false
      })
    default:
      return state
  }
}

export default function userPreference(state = {
  editions: {
    isFetching: false,
    list: []
  },
}, action) {
  return {
    editions: editions(state.editions, action),
  }
}