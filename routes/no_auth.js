/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/*
 * No auth route
 *
 * v0.1 - 2016-11-16
 * @author Zhangpc
*/
'use strict'

const authController = require('../controllers/auth')
const licenseController = require('../controllers/license')
const adminController = require('../controllers/admin')
const middlewares = require('../services/middlewares')
const alertController = require('../controllers/alert')
const oemController = require('../controllers/oem_info')
const globalConfigController = require('../controllers/global_config')

module.exports = function (Router) {
  const router = new Router({})

  // Auth
  router.get('/login', authController.login)
  router.get('/logout', authController.logout)
  router.post('/logout', authController.logout)
  router.post('/auth/users/verify', middlewares.verifyUser, authController.verifyUser)
  // Captcha
  router.get('/captcha/gen', authController.generateCaptcha)
  router.get('/captcha/:captcha/verify', authController.checkCaptchaIsCorrect)
  // Notfound
  router.get('/notfound', function* () {
    yield this.render(global.indexHtml, { title: 'Page not found', body: '' })
  })

  // oem info
  router.get('/oem/info', oemController.getOEMInfo)

  // License
  router.get('/api/v2/licenses/merged', licenseController.checkLicense)
  router.post('/api/v2/licenses', licenseController.addLicense)
  router.get('/api/v2/licenses/platform', licenseController.getPlatformID)

  // Admin
  router.get('/api/v2/admin/ispwset', adminController.isPasswordSet)
  router.patch('/api/v2/admin/setpw', adminController.SetPassword)

  // alert
  router.get('/alerts/invitations/join', function* (){
    yield this.render(global.indexHtml, { title: '邮箱验证 | 新智云', body: '' })
  })
  router.get('/alerts/invitations/join-code', alertController.acceptInvitation)

  return router.routes()
}