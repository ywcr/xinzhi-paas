/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Default reducers factory
 *
 * v0.1 - 2016-10-09
 * @author Zhangpc
 */

import merge from 'lodash/merge'

export default function reducerFactory(ActionTypes = {}, state, action, options = {}) {
  const defaultState = {
    isFetching: false
  }
  switch (action.type) {
    case ActionTypes.REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.SUCCESS:
      if (options.overwrite) {
        return Object.assign({}, state, {
          isFetching: false,
          result: action.response.result
        })
      }
      return merge({}, state, {
        isFetching: false,
        result: action.response.result
      })
    // case ActionTypes.RESET:
    //   console.log(action)
    //   return Object.assign({}, state, {
    //     isFetching: false,
    //     result:{
    //       searchList: action.searchList
    //     }
    //   })
    case ActionTypes.FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}