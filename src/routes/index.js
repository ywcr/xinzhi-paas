/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Root routes
 *
 * v0.1 - 2016-11-22
 * @author Zhangpc
*/
if (process.env.RUNNING_MODE === 'standard') { // Magic code, do not change
  module.exports = require('./index.standard')
} else {
  module.exports = require('./index.enterprise')
}