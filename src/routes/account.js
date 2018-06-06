/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * Account routes
 *
 * v0.1 - 2016-12-18
 * @author Zhangpc
*/

if (process.env.RUNNING_MODE === 'standard') { // Magic code, do not change
  module.exports = require('./account.standard')
} else {
  module.exports = require('./account.enterprise')
}