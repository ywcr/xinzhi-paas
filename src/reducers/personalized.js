/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for license
 *
 * v0.1 - 2017-05-19
 * @author Baiyu
 */

import * as ActionTypes from '../actions/personalized'
import reducerFactory from './factory'
// import merge from 'lodash/merge'

function copyright(state= false, action) {
  if (action.type === ActionTypes.SET_COPYRIGHT) {
    return action.types
  }
  return state
}

function info(state={result:{}},action) {

  switch(action.type) {
    case ActionTypes.GET_PERSONALIZED_REQUEST:{
      return Object.assign({}, state, {
          isFetching: true,
      })
    }
    case ActionTypes.GET_PERSONALIZED_SUCCESS:{
      return Object.assign({}, state, {
          isFetching: false,
          result: action.response.result
      })
    }
    case ActionTypes.GET_PERSONALIZED_FAILURE:{
      return Object.assign({}, state, {
          isFetching: false,
      })
    }
    case ActionTypes.GET_DEFAULT_INFO_SUCCESS:{
      return Object.assign({}, state, {
          isFetching: false,
          result: action.response.result
      })
    }
    default: return state

  }
}

export default function personalized(state = {info:{}}, action) {
  return {
    info: info(state.info, action),
    copyright: copyright(state.copyright,action)
  }
}