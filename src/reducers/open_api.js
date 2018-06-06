/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * v0.1 - 2016-11-03
 * @author mengyuan
 */

import * as ActionTypes from '../actions/open_api'
import reducerFactory from './factory'

export default function openApi(state = {}, action) {
  return reducerFactory({
      REQUEST: ActionTypes.TOKEN_REQUEST,
      SUCCESS: ActionTypes.TOKEN_SUCCESS,
      FAILURE: ActionTypes.TOKEN_FAILURE
    }, state, action)
}