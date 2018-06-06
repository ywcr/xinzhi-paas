/**
 * licensed materials - property of paas.enncloud.cn
 * (c) copyright 2016 tenxcloud. all rights reserved.
 *
 * redux reducers for app manage
 *
 * v0.1 - 2016-12-19
 * @author YangYuBiao
 */

import * as ActionTypes from '../actions/upload.js'
import reducerFactory from './factory.js'

export default function upload(state={}, action) {
  return {
    qiniuToken: reducerFactory({
      REQUEST: ActionTypes.QINIU_TOKEN_REQUEST,
      SUCCESS: ActionTypes.QINIU_TOKEN_SUCCESS,
      FAILURE: ActionTypes.QINIU_TOKEN_FAILURE
    })
  }
}

