/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Utility for different notification handler
 * v0.1 - 2016-12-09
 * @author Lei
 */

import React from 'react'
import { Spin, notification } from 'antd'
import { genRandomString } from './tools'

// Set notification global
notification.config({
  top: 60,
  duration: 10,
})

class NotificationHandler {
  // timeout is optional, and used for loading interval
  constructor(timeout) {
    // generate a key, only required for loading notification
    this.key = genRandomString(10)
    this.timeout = timeout
  }

  // Open loading notification
  spin(message) {
    let key = this.key
    notification.open({
      key,
      message: (
        <div>
          <Spin /> {message}
        </div>
      ),
      // Should close it manually
      duration: 0,
    })
    return () => {
      this.close(key)
    }
  }
  // Close loading notification
  close(key) {
    let _key = key || this.key
    let timeout = this.timeout || 500
    setTimeout(function () {
      notification.close(_key)
    }, timeout)
  }
  // Show success notification
  success(message, description) {
    let desc = description || ''
    notification.success({
      message: (
        <div style={{ fontSize: '13px', paddingRight: '20px', color: '#666'}}>
          {message}
        </div>
      ),
      description: desc,
      duration: 5,
    })
  }
  // Show info notification
  info(message) {
    notification.info({
      message: (
        <div style={{ fontSize: '13px', paddingRight: '20px', color: '#666'}}>
          {message}
        </div>
      ),
      duration: 5,
    })
  }
  // Show warn notification
  warn(message, description, duration) {
    let desc = description || ''
    let timeout = duration
    if (timeout === undefined) {
      timeout = 10
    }
    notification.info({
      message: (
        <div style={{ fontSize: '13px', paddingRight: '20px', color: '#666'}}>
          {message}
        </div>
      ),
      description: desc,
      duration: timeout
    })
  }
  // Show error notification: message & description
  error(message, description, duration) {
    let desc = description || ''
    let timeout = duration || 10
    notification.error({
      message: (
        <div style={{ fontSize: '13px', paddingRight: '20px', color: '#666'}}>
          {message}
        </div>
      ),
      description: desc,
      duration: timeout
    })
  }
}

module.exports = NotificationHandler