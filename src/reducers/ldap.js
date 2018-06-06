/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Redux reducers for user 3rd accounts
 *
 * v0.1 - 2017-05-20
 * @author Zhangpc
 */

import * as ActionTypes from '../actions/ldap'
import reducerFactory from './factory'

const option = {
  overwrite: true
}

export default function ldap(state = { detail: {} }, action) {
  return {
    detail: reducerFactory({
      REQUEST: ActionTypes.GET_LDAP_REQUEST,
      SUCCESS: ActionTypes.GET_LDAP_SUCCESS,
      FAILURE: ActionTypes.GET_LDAP_FAILURE
    }, state.detail, action, option),
  }
}