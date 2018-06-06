/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for admin
 *
 * v0.1 - 2017-02-13
 * @author shouhong.zhang
 */

import * as ActionTypes from '../actions/admin'
import reducerFactory from './factory'

const options = { overwrite: true }

export default function admin(state = {
  isPasswordSet: {},
}, action) {
  return {
    isPasswordSet: reducerFactory({
      REQUEST: ActionTypes.ADMIN_IS_PW_SET_REQUEST,
      SUCCESS: ActionTypes.ADMIN_IS_PW_SET_SUCCESS,
      FAILURE: ActionTypes.ADMIN_IS_PW_SET_FAILURE
    }, state.isPasswordSet, action, options),
  }
}