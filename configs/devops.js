/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * v0.1 - 2016-11-04
 * @author Lei
 */

/*
 *
 * Devops config file
 */
'use strict'
const env = process.env

const config = {
  "protocol": env.DEVOPS_PROTOCOL || "http",
  "host": env.DEVOPS_HOST || "10.39.0.119:38090", // '10.4.109.145:8090'
  "external_protocol": env.DEVOPS_EXTERNAL_PROTOCOL || "https",
  "external_host": env.DEVOPS_EXTERNAL_HOST || "10.39.0.119",
  "statusPath": "/stagebuild/status",
  "logPath": "/stagebuild/log"
}

module.exports = config
