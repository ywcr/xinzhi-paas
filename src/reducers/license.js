/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for license
 *
 * v0.1 - 2017-02-09
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/license'
import reducerFactory from './factory'
import merge from 'lodash/merge'

const options = { overwrite: true }

function licenseList(state ={}, action) {
  const defaultState = {
    isFetching: false
  }
  switch (action.type) {
    case ActionTypes.LICENSE_LIST_REQUEST:
      return merge({}, defaultState, state, {
        isFetching: true
      })
    case ActionTypes.LICENSE_LIST_SUCCESS: {
      let list = action.response.result
      list.data.licenses.reverse()
      return Object.assign({}, state, {
        isFetching: false,
        result: list
      })
    }
    case ActionTypes.LICENSE_LIST_FAILURE:
      return merge({}, defaultState, state, {
        isFetching: false
      })
    default:
      return state
  }
}

export default function license(state = {
  licenses: {},
  mergedLicense: {},
  platform: {}
}, action) {
  return {
    licenses: licenseList(state.licenses, action),
    mergedLicense: reducerFactory({
      REQUEST: ActionTypes.LICENSE_MERGED_REQUEST,
      SUCCESS: ActionTypes.LICENSE_MERGED_SUCCESS,
      FAILURE: ActionTypes.LICENSE_MERGED_FAILURE
    }, state.mergedLicense, action, options),
    platform: reducerFactory({
      REQUEST: ActionTypes.LICENSE_PLATFORM_REQUEST,
      SUCCESS: ActionTypes.LICENSE_PLATFORM_SUCCESS,
      FAILURE: ActionTypes.LICENSE_PLATFORM_FAILURE
    }, state.platform, action, options)
  }
}