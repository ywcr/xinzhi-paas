/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/20
 * @author mengyuan
 */
'use strict'

const redis = require("redis")
const redisConfig = require('../configs').redis || {}
const client = getRedisClient()
const logger = require('./logger').getLogger('security')

function getRedisClient() {
  let redisOption = {
    host: redisConfig.host,
    port: redisConfig.port,
  }
  if (redisConfig.password) {
    redisOption.password = redisConfig.password
  }
  const redisClient = redis.createClient(redisOption)

  redisClient.on("error", function (err) {
      logger.error("redis error " + err);
  });
  return redisClient
}

exports.client = client

exports.redisKeyPrefix = {
  captcha: 'register_captcha',
  frequenceLimit: 'register_send_captcha_frequence',
  resetPassword: 'reset_password',
}