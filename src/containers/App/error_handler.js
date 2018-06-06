/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Error handler
 *
 * v0.1 - 2016-11-24
 * @author Zhangpc
*/

import React, { Component, PropTypes } from 'react'
import { notification, message as MSG } from 'antd'
import { defineMessages } from 'react-intl'

const messages = defineMessages({
  error: {
    id: 'App.error',
    defaultMessage: '请求错误',
  },
  error400: {
    id: 'App.error.400',
    defaultMessage: '请求{resource}发生客户端错误',
  },
  error401: {
    id: 'App.error.401',
    defaultMessage: '请求{resource}未授权',
  },
  error403: {
    id: 'App.error.403',
    defaultMessage: '请求{resource}被拒绝',
  },
  error404: {
    id: 'App.error.404',
    defaultMessage: '{resource}未找到',
  },
  error409: {
    id: 'App.error.409',
    defaultMessage: '请求{resource}发生冲突',
  },
  error500: {
    id: 'App.error.500',
    defaultMessage: '请求{resource}发生服务器错误',
  },
  error502: {
    id: 'App.error.502',
    defaultMessage: '请求{resource}无响应',
  },
  error503: {
    id: 'App.error.503',
    defaultMessage: '网络或服务暂时不可用，请您稍后再试',
  },
  error504: {
    id: 'App.error.504',
    defaultMessage: '请求{resource}超时',
  },
  error510: {
    id: 'App.error.510',
    defaultMessage: '网络暂时不可用，请您稍后再试',
  },
})

export default function handler(error, intl) {
  const { formatMessage } = intl
  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    error.message = {
      code: 503,
      message: ''
    }
  }
  const defaultError = formatMessage(messages.error)
  let { message, description } = _errorFormat(error)
  if (typeof message !== 'string') {
    message = '请求错误'
  }
  if (typeof description !== 'string') {
    description = ''
  }
  // For network interruption
  if (error.message.code === 503) {
    MSG.error(message)
  } else if (error.statusCode === 510) {
    MSG.error(error.message)
  } else {
    notification.error({
      message,
      description,
      duration:5
    })
  }

  // Formate error message
  function _errorFormat(error) {
    const errorMessage = error.message
    let { message, details, code } = errorMessage
    if (message === undefined) {
      message = error.message
    }
    const { title, duration } = _translateMessageByCode(errorMessage)
    return {
      message: title,
      description: message,
      duration,
    }
  }

  // Formate error message by code
  function _translateMessageByCode(message) {
    let { details, code } = message
    let { name, kind } = details || {}
    const data = {
      title: defaultError,
      duration: null,
    }
    const resource = _spellKindAndName(kind, name)
    if (code == 401) {
      data.title = formatMessage(messages.error401, { resource })
      return data
    }
    if (code == 403) {
      data.title = formatMessage(messages.error403, { resource })
      return data
    }
    if (code == 404) {
      data.title = formatMessage(messages.error404, { resource })
      data.duration = 8
      return data
    }
    if (code == 409) {
      data.title = formatMessage(messages.error409, { resource })
      return data
    }
    if (code < 500) {
      data.title = formatMessage(messages.error400, { resource })
      return data
    }
    if (code == 502) {
      data.title = formatMessage(messages.error502, { resource })
      return data
    }
    if (code == 503) {
      data.title = formatMessage(messages.error503)
      return data
    }
    if (code == 504) {
      data.title = formatMessage(messages.error504, { resource })
      return data
    }
    if (code == 510) {
      data.title = formatMessage(messages.error510, { resource })
      return data
    }
    if (code >= 500) {
      data.title = formatMessage(messages.error500, { resource })
      return data
    }
    return data
  }

  // Spell kind and name
  function _spellKindAndName(kind, name) {
    if (!kind && !name) {
      return ''
    }
    if (!kind || !name) {
      return kind || name
    }
    return `${kind} ${name}`
  }
}