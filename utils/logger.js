/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Logger Utility
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
'use strict'

const log4js = require('log4js')
let level = process.env.LOG_LEVEL || "INFO"
const LOGPATH = './logs'
const fs = require('fs')
const log4jsConfig = require('../configs/log4js.json')
let logger

fs.stat(LOGPATH, function (err, stats) {
  if (err) {
    fs.mkdir(LOGPATH, "0744", function () {
      // refresh configuration file every three minutes
      log4js.configure(log4jsConfig, {
        reloadSecs: 180
      })
    })
  } else {
    // refresh configuration file every three minutes
    log4js.configure(log4jsConfig, {
      reloadSecs: 180
    })
  }
})

exports.getLogger = function (name) {
  logger = log4js.getLogger(name)
  logger.setLevel(level)
  return logger
}

exports.setLevel = function (_level) {
  level = _level
}

exports.getLevel = function () {
  return level
}

exports.log4js = log4js