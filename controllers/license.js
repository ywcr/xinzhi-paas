/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Redux actions for licenses
 *
 * v0.1 - 2017-02-09
 * @author shouhong.zhang
 */

'use strict'
const apiFactory = require('../services/api_factory')
const indexService = require('../services')
const constants = require('../constants')

const DEFAULT_LICENSE = constants.DEFAULT_LICENSE
const UNLIMITED_LICENSE = constants.UNLIMITED_LICENSE
const USE_LICENSE = constants.USE_LICENSE

// license_status: VALID, NO_LICENSE, EXPIRED
// left_license_days: xxxx
// left_trial_days: xxx
// UI behaviors baased on above information:
// scenario-1: license_status is VALID and left_license_days > 7, allow login
// scenario-2: license_status is VALID and left_license_days <= 7, show warning and allow login
// scenario-3: license_status is NO_LICENSE and left_trial_days > 0, show warning and allow login
// scenario-4: license_status is NO_LICENSE and left_trial_days <= 0, show error and not allow login
// scenario-5: license_status is EXPIRED, show error and not allow login
exports.checkLicense = function* () {
  if ( ! USE_LICENSE ){
    let trial_end_time = new Date()
    let license_status = 'VALID'
    let days=3650
    trial_end_time.setYear(trial_end_time.getYear()+10)
    const result = {
      status: 'Success',
      code: 200,
      data: {
        license_status,
        days,
        days,
        trial_end_time,
        trial_end_time
      }
    }
    this.body = result
    return 
  }

  const api = apiFactory.getApi()
  const license = this.request.body
  const license_info = yield api.licenses.getBy(["merged"])
  const trial_info = yield api.licenses.getBy(["trial"])

  if(!license_info || license_info.code != 200) {
    const err = new Error('failed to get merged license information')
    err.status = license_info ? license_info.code : 404
    throw err
  }

  if (!trial_info || trial_info.code != 200) {
    const err = new Error('failed to get trial information')
    err.status = trial_info ? trial_info.code : 404
    throw err
  }

  let license_status = 'NO_LICENSE'
  let left_license_days = 0
  let end
  if (license_info.data && license_info.data.end) {
    end = license_info.data.end
    let end_time = Date.parse(end);
    let now = new Date();
    let date = end_time - now;
    const days = date/(24*3600*1000);
    if (days > 0) {
      license_status = 'VALID'
      left_license_days = days
    } else {
      license_status = 'EXPIRED'
    }
  }

  let left_trial_days = 0
  let trial_end_time = new Date()
  if (trial_info.data && trial_info.data.left_trial_days) {
    left_trial_days = trial_info.data.left_trial_days
    trial_end_time = trial_info.data.trial_end_time
  }

  const result = {
    status: 'Success',
    code: 200,
    data: {
      license_status,
      left_license_days,
      left_trial_days,
      trial_end_time,
      end: end || trial_end_time
    }
  }
  this.body = result
}

// get all licenses
// license info: license_uid, start, duration, end, add_time, add_user
exports.getLicenses = function* () {
  if ( USE_LICENSE ){
    const loginUser = this.session.loginUser
    const api = apiFactory.getApi(loginUser)
    const result = yield api.licenses.get()
    this.body = result
  }else
  {
    this.body = UNLIMITED_LICENSE
  }
}

// input: license key
// output: success, invalid_license
exports.addLicense = function* () {
  const loginUser = this.session.loginUser
  const api = apiFactory.getApi(loginUser)
  const license = this.request.body
  if (!license || !license.rawlicense) {
    const err = new Error('rawlicense field is required.')
    err.status = 400
    throw err
  }
  const result = yield api.licenses.create(license)
  this.body = result
}

// get platform_id
exports.getPlatformID = function* () {
  const platform = this.session.platform
  if (platform) {
    this.body = platform
    return
  }
  const api = apiFactory.getApi()
  const result = yield api.licenses.getBy(["platform"])
  this.session.platform = result
  this.body = result
}
