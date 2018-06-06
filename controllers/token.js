/**
 * Licensed Materials - Property of paas.enncloud.cn

 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * User manage controller
 *
 * v0.1 - 2016-11-02
 * @author meng yuan
 */

'use strict'

// get namespace and token from session
exports.getTokenInfo = function* () {
  this.body = {
    username: this.session.loginUser.user,
    token: this.session.loginUser.token,
  }
}