/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux actions for upload
 *
 * v0.1 - 2016-12-19 
 * @author YangYuBiao
 */
'use strict'
import { FETCH_API, Schemas } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'

const QINIU_TOKEN_REQUEST = 'QINIU_TOKEN_REQUEST'
const QINIU_TOKEN_SUCCESS = 'QINIU_TOKEN_SUCCESS'
const QINIU_TOKEN_FAILURE = 'QINIU_TOKEN_FAILURE'

function fetchQiNiuToken(type, body, callback) {
  return {
    [FETCH_API]: {
      types: [QINIU_TOKEN_REQUEST, QINIU_TOKEN_SUCCESS, QINIU_TOKEN_FAILURE],
      endpoint: `${API_URL_PREFIX}/store/token?bucket=${type}&fileName=${body.fileName}&protocol=${body.protocol.replace(':', '')}`,
        schema: {}
    },
    callback
  }
}

export function getQiNiuToken(type, body, callback) {
  return (dispath, getState) => {
    return dispath(fetchQiNiuToken(type, body, callback))
  }
}
