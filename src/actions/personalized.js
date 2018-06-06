/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux reducers for personalized
 *
 * v0.1 - 2017-05-19
 * @author Baiyu
 */
import { FETCH_API } from '../middleware/api'
import { API_URL_PREFIX } from '../constants'
import { SPI_URL_PREFIX } from '../constants'

export const GET_PERSONALIZED_REQUEST = 'GET_PERSONALIZED_REQUEST'
export const GET_PERSONALIZED_SUCCESS = 'GET_PERSONALIZED_SUCCESS'
export const GET_PERSONALIZED_FAILURE = 'GET_PERSONALIZED_FAILURE'

function fetchPersonalized(callback) {
  return {
    [FETCH_API]: {
      types: [GET_PERSONALIZED_REQUEST, GET_PERSONALIZED_SUCCESS, GET_PERSONALIZED_FAILURE],
      endpoint: '/oem/info',
      schema: {}
    },
    callback
  }
}

export function getPersonalized(callback) {
  return (dispatch) => {
    dispatch(fetchPersonalized(callback))
  }
}

export const SET_COPYRIGHT_REQUEST = 'SET_COPYRIGHT_REQUEST'
export const SET_COPYRIGHT_SUCCESS = 'SET_COPYRIGHT_SUCCESS'
export const SET_COPYRIGHT_FAILURE = 'SET_COPYRIGHT_FAILURE'

function fetchCopyright(body,callback) {
  return {
    [FETCH_API]: {
      types: [SET_COPYRIGHT_REQUEST, SET_COPYRIGHT_SUCCESS, SET_COPYRIGHT_FAILURE],
      endpoint: `${API_URL_PREFIX}/oem/info`,
      options:{
        method:'PUT',
        body:body
      },
      schema: {}
    },
    callback
  }
}

export function isCopyright (body, callback) {
  return (dispatch) => {
    return dispatch(fetchCopyright(body, callback))
  }
}

export const UPDATE_LOGO_REQUEST = 'UPDATE_LOGO_REQUEST'
export const UPDATE_LOGO_SUCCESS = 'UPDATE_LOGO_SUCCESS'
export const UPDATE_LOGO_FAILURE = 'UPDATE_LOGO_FAILURE'

function fetchUpdateLogo(body,callback) {
  return {
    [FETCH_API]: {
      types: [UPDATE_LOGO_REQUEST, UPDATE_LOGO_SUCCESS, UPDATE_LOGO_FAILURE],
      endpoint: `${API_URL_PREFIX}/oem/logo`,
      options:{
        method: 'PUT',
        noContentType: true,
        body: body
      },
      schema: {}
    },
    callback
  }
}

export function updateLogo(body,callback) {
  return (dispatch)=> {
    return dispatch(fetchUpdateLogo(body,callback))
  }
}


export const UPDATE_CONFIG_REQUEST = 'UPDATE_CONFIG_REQUEST'
export const UPDATE_CONFIG_SUCCESS = 'UPDATE_CONFIG_SUCCESS'
export const UPDATE_CONFIG_FAILURE = 'UPDATE_CONFIG_FAILURE'

function fetchUploadLogo(body,callback) {
    return {
        [FETCH_API]: {
            types: [UPDATE_CONFIG_REQUEST, UPDATE_CONFIG_SUCCESS, UPDATE_CONFIG_FAILURE],
            endpoint: `${API_URL_PREFIX}/oem/logo/file`,
            options:{
                method: 'POST',
                noContentType: true,
                body: body
            },
            schema: {}
        },
        callback
    }
}

export function uploadImage(body,callback) {
    return (dispatch)=> {
        return dispatch(fetchUploadLogo(body,callback))
    }
}


export const UPDATE_QUERY_REQUEST = 'UPDATE_QUERY_REQUEST'
export const UPDATE_QUERY_SUCCESS = 'UPDATE_QUERY_SUCCESS'
export const UPDATE_QUERY_FAILURE = 'UPDATE_QUERY_FAILURE'

function fetchQueryLogo(id,callback) {
    return {
        [FETCH_API]: {
            types: [UPDATE_QUERY_REQUEST, UPDATE_QUERY_SUCCESS, UPDATE_QUERY_FAILURE],
            endpoint: `${API_URL_PREFIX}/oem/media/${id}`,
            options:{
                method: 'GET',
                contentType:'blob'
            },
            schema: {}
        },
        callback
    }
}

export function queryImage(id,callback) {
    return (dispatch)=> {
        return dispatch(fetchQueryLogo(id,callback))
    }
}



export const GET_DEFAULT_INFO_REQUEST = 'GET_DEFAULT_INFO_REQUEST'
export const GET_DEFAULT_INFO_SUCCESS = 'GET_DEFAULT_INFO_SUCCESS'
export const GET_DEFAULT_INFO_FAILURE = 'GET_DEFAULT_INFO_FAILURE'

function fetchDefaultInfo(type,callback) {
  return {
    [FETCH_API]: {
      types: [GET_DEFAULT_INFO_REQUEST, GET_DEFAULT_INFO_SUCCESS, GET_DEFAULT_INFO_FAILURE],
      endpoint: `${API_URL_PREFIX}/oem/${type}/default`,
      options:{
        method: 'PUT'
      },
      schema: {}
    },
    callback
  }
}

export function restoreDefault(type,callback) {
  return (dispatch)=> {
    return dispatch(fetchDefaultInfo(type,callback))
  }
}


/*创建私有应用模板*/

export const UPDATE_CREATE_TEMPLATES_REQUEST = 'UPDATE_CREATE_TEMPLATES_REQUEST'
export const UPDATE_CREATE_TEMPLATES_SUCCESS = 'UPDATE_CREATE_TEMPLATES_SUCCESS'
export const UPDATE_CREATE_TEMPLATES_FAILURE = 'UPDATE_CREATE_TEMPLATES_FAILURE'

function fetchCreateTemplate(body,callback) {
    return {
        [FETCH_API]: {
            types: [UPDATE_CONFIG_REQUEST, UPDATE_CONFIG_SUCCESS, UPDATE_CONFIG_FAILURE],
            endpoint: `${API_URL_PREFIX}/templates`,
            options:{
                method: 'POST',
                body:body
            },
            schema: {}
        },
        callback
    }
}

export function createTemplate(cluster,callback) {
    return (dispatch)=> {
        return dispatch(fetchCreateTemplate(cluster,callback))
    }
}
