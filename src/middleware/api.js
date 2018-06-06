/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Middleware for request api
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */

import { Schema, arrayOf, normalize } from 'normalizr'
import { camelizeKeys } from 'humps'
import 'isomorphic-fetch'
import { genRandomString, getType } from '../common/tools'
import 'whatwg-fetch' // For Edge browser
import cloneDeep from 'lodash/cloneDeep'

// Fetches an API response
function fetchApi(endpoint, options, schema) {
  if (!options) {
    options = {
      method: 'GET'
    }
  }
  if (!options.credentials) {
    options.credentials = 'same-origin'
    // options.credentials = 'include'
  }
  // The request body can be of the type String, Blob, or FormData.
  // Other data structures need to be encoded before hand as one of these types.
  // https://github.github.io/fetch/#request-body
  const REQUEST_BODY_METHODS = ['POST', 'PUT', 'PATCH']
  // if set options.noContentType true skip set 'Content-Type'
  if (!options.noContentType && REQUEST_BODY_METHODS.indexOf(options.method) > -1) {
    if (!options.headers) options.headers = {}
    if (!options.headers['Content-Type']) {
      options.headers['Content-Type'] = 'application/json'
    }
    let bodyType = getType(options.body)
    if (bodyType === 'object' || bodyType === 'array') {
      options.body = JSON.stringify(options.body)
    }
  }
  // And random string in query for IE(avoid use cache)
  let randomQuery = '_=' + genRandomString()
  if (endpoint.indexOf('?') > -1) {
    endpoint += `&${randomQuery}`
  } else {
    endpoint += `?${randomQuery}`
  }
  // Encode url before fetch(multiple encoding produce errors !!!)
  endpoint = encodeURI(endpoint)
  return fetch(endpoint, options).then(response =>
    response.json().then(json => ({ json, response })).catch(error => {
      return Promise.reject({
        message: '网络或服务暂时不可用，请稍后重试',
      })
    })
  ).then(({json, response}) => {
    if (!response.ok) {
      return Promise.reject(json)
    }
    const camelizedJson = camelizeKeys(json)
    return Object.assign({},
      normalize(camelizedJson, schema)
    )
  })
}

// We use this Normalizr schemas to transform API responses from a nested form
// to a flat form where repos and users are placed in `entities`, and nested
// JSON objects are replaced with their IDs. This is very convenient for
// consumption by reducers, because we can easily build a normalized tree
// and keep it updated as we fetch more data.

// Read more about Normalizr: https://github.com/gaearon/normalizr

const userSchema = new Schema('users', {
  idAttribute: 'namespace'
})

const appSchema = new Schema('apps', {
  idAttribute: 'name'
})

const serviceSchema = new Schema('services', {
  idAttribute: 'id'
})

const containerSchema = new Schema('containers', {
  idAttribute: 'id'
})

const storageSchema = new Schema('storage', {
  idAttribute: 'namespace'
})

const configSchema = new Schema('configGroupList', {
  idAttribute: 'groupId'
})

const registrySchema = new Schema('registries', {
  idAttribute: 'name'
})

// Schemas for API responses.
export const Schemas = {
  USER: userSchema,
  APP: appSchema,
  APPS: {
    appList: arrayOf(appSchema)
  },
  SERVICE: serviceSchema,
  SERVICES: {
    servicesList: arrayOf(serviceSchema)
  },
  CONTAINER: containerSchema,
  CONTAINERS: {
    containerList: arrayOf(containerSchema)
  },
  STORAGE: {
    storageList: arrayOf(storageSchema)
  },
  CONFIG: configSchema,
  CONFIGS: {
    configGroup: arrayOf(configSchema)
  },
  REGISTRY: registrySchema,
  REGISTRYS: {
    appList: arrayOf(registrySchema)
  },
}

// Action key that carries API call info interpreted by this Redux middleware.
export const FETCH_API = Symbol('FETCH API')
// A Redux middleware that interprets actions with FETCH_API info specified.
// Performs the call and promises when such actions are dispatched.
export default store => next => action => {
  const fetchAPI = action[FETCH_API]
  if (typeof fetchAPI === 'undefined') {
    return next(action)
  }

  let { endpoint } = fetchAPI
  const { schema, types } = fetchAPI

  if (typeof endpoint === 'function') {
    endpoint = endpoint(store.getState())
  }
  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.')
  }
  if (!schema) {
    throw new Error('Specify one of the exported Schemas.')
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.')
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings.')
  }

  function actionWith(data) {
    const finalAction = Object.assign({}, action, data)
    delete finalAction[FETCH_API]
    return finalAction
  }

  // Add current.space.namespace for every fetch in headers
  const space = cloneDeep(store.getState().entities.current.space || {})
  const options = fetchAPI.options || {}
  options.headers = options.headers || {}
  // sys admin check user personal space
  if (space.userName) {
    options.headers.onbehalfuser = space.userName
    space.namespace = 'default'
  }
  options.headers.teamspace = options.headers.teamspace || space.namespace || ''

  const [requestType, successType, failureType] = types
  next(actionWith({ type: requestType }))
  return fetchApi(endpoint, options, schema).then(
    response => next(actionWith({
      response,
      type: successType
    })),
    error => {
      next(actionWith({
        type: failureType,
        // error: error.message || 'Something bad happened'
        error: error
      }))
    }
  )
}