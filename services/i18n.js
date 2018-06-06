/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * I18n service for init and middleware
 *
 * v0.1 - 2016-09-13
 * @author Zhangpc
 */
'use strict'
const fs = require('fs')
const path = require('path')
const c2k = require('koa-connect')
const i18next = require('i18next')
const i18nBackend = require('i18next-node-fs-backend')
const i18Middleware = require('i18next-express-middleware')
const DEFAULT_LOCALE = 'zh'
const INTL_LOCALE_LIST = ['zh', 'en']
const config = require('../configs')

// Init and handle i18n
exports.handle = function () {
  const nsFills = fs.readdirSync(path.join(__root__dirname, 'static/locales/backend/zh'))
  let i18nNS = []
  nsFills.forEach(function (name) {
    if (path.extname(name) === '.json') {
      i18nNS.push(path.basename(name, '.json'))
    }
  })
  const i18nOptions = {
    ns: i18nNS,
    load: "languageOnly",
    fallbackLng: DEFAULT_LOCALE,
    debug: false,
    backend: {
      loadPath: path.join(__root__dirname, 'static/locales/backend/{{lng}}/{{ns}}.json')
    },
    detection: {
      order: ['cookie', 'header'],
      lookupCookie: config.intl_cookie_name,
      caches: false
    }
  }
  i18next
    .use(i18nBackend)
    .use(i18Middleware.LanguageDetector)
    .init(i18nOptions)
  return c2k(i18Middleware.handle(i18next))
}

// Middleware for set cookie and state for internationalization
exports.middleware = function* (next) {
  let t = i18next.t.bind(i18next)
  this.t = t
  this.state.t = t
  let localeCookie = this.cookies.get(config.intl_cookie_name)
  if (localeCookie && INTL_LOCALE_LIST.indexOf(localeCookie) > -1) {
    this.state.intl_locale = localeCookie
    return yield next
  }
  this.state.intl_locale = DEFAULT_LOCALE
  let expdate = new Date()
  expdate.setMonth(expdate.getMonth() + 3)
  this.cookies.set(config.intl_cookie_name, DEFAULT_LOCALE, { expires: expdate, signed: true, httpOnly: false })
  yield next
}