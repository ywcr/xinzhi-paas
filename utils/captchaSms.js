/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * v0.1 - 2016-12-20
 * @author mengyuan
 */
'use strict'

const logger = require('./logger').getLogger('captchaSms')
const urllib = require('urllib')
const md5 = require('md5')
const constants = require('../constants')
const redisClient = require('./redis').client
const internalError = genInternalError()

function sendCaptchaToPhone(mobile, redisConf) {
  const method = 'sendCaptchaToPhone'
  // check mobile format
  if (!mobile || !constants.PHONE_REGEX.test(mobile)) {
    logger.info(method, 'check mobile failed. mobile is', mobile)
    const err = new Error('手机号不合法')
    err.status = 400
    return Promise.reject(err)
  }

  const captchaPrefix = redisConf.captchaPrefix
  const captchaRetainSec = redisConf.captchaRetaiSec || 900 // 15 minute
  const captchaSendFrequencePrefix = redisConf.captchaSendFrequencePrefix
  const captchaSendFrequenceSec = redisConf.captchaSendFrequenceSec || 60 // 1 minute
  if (!captchaPrefix || !captchaSendFrequencePrefix) {
    logger.error(method, 'redisConf invalid. redisConf:', redisConf)
    return Promise.reject(internalError)
  }

  // generate captcha
  const captcha = Math.random().toString().substr(2,6)
  
  // set sms sending frequence to 60 second
  const setFrequence = new Promise((resolve, reject) => {
    const sendCaptchaFrequenceKey = `${captchaSendFrequencePrefix}#${mobile}`
    redisClient.set(sendCaptchaFrequenceKey, '1', 'NX', 'EX', captchaSendFrequenceSec, function(err, reply) {
      if (err) {
        logger.error(method, 'write frequence limit to redis failed.', err)
        return Promise.reject(internalError)
      }
      if (reply == null) {
        logger.info(method, 'frequence limit not timeout, not send captcha sms')
        const returnError = new Error('短信发送太快了，请稍后再试')
        returnError.status = 403
        return reject(returnError)
      }
      resolve()
    })
  })

  return setFrequence.then(() => {
    // save captcha in redis, expire time 15 minute
    return new Promise((resolve, reject) => {
      const redisKey = `${captchaPrefix}#${mobile}`
      redisClient.set(redisKey, captcha, 'EX', 15 * 60, function(err, reply) {
        if (err) {
          logger.error(method, 'write captcha to redis failed.', err)
          return reject(internalError)
        }
        resolve()
      })
    })
  }).then(() => {
    // send sms
    const smsConfig = require('../configs/_standard').sms
    if (!smsConfig.apiKey || !smsConfig.account) {
      logger.error(method, 'get sms service account/apiKey failed. please check envionment variables USERPORTAL_IHUYI_ACCOUNT/USERPORTAL_IHUYI_APIKEY')
      return Promise.reject(internalError)
    }
    const content = `您的验证码是：${captcha}。请不要把验证码泄露给其他人。`
    const timestamp = Date.parse(new Date()) / 1000
    const rawData = `${smsConfig.account}${smsConfig.apiKey}${mobile}${content}${timestamp}`
    const md5Pwd = md5(rawData)
    // 当参数format为json，请求失败时还是有可能返回xml，所以没有设置format参数为json
    const url = `${smsConfig.host}?method=Submit&account=${smsConfig.account}&password=${md5Pwd}&mobile=${mobile}&content=${encodeURI(content)}&time=${timestamp}`
    logger.info(method, `sending captcha to ${mobile} url: ${url}`)
    return new Promise((resolve, reject) => {
      urllib.request(url, {secureProtocol: 'TLSv1_method'}, function(err, data, res) {
        if (err) {
          logger.error(method, 'call sms service failed.', err)
          return reject(internalError)
        }
        if (res.statusCode !== 200) {
          logger.error(method, 'return status code is', res.statusCode)
          return reject(internalError)
        }
        const parseString = require('xml2js').parseString
        parseString(data, function(err2, result) {
          if (err2) {
            logger.error(method, 'parse response xml failed. return xml:', data, 'err:', err2)
            return reject(internalError)
          }
          if (result && result.SubmitResult && result.SubmitResult.code.length === 1) {
            const code = result.SubmitResult.code[0]
            switch (code) {
            case '2':
              logger.info(method, `send captcha(${captcha}) to phone(${mobile}) success`)
              return resolve(captcha)
            case '4085': {
              const err3 = new Error('同一手机号验证码短信发送超出5条')
              err3.status = 400
              return reject(err3)
            }
            case '4030': {
              const err4 = new Error('手机号码已被列入黑名单')
              err4.status = 400
              return reject(err4)
            }
            default:
              logger.error(method, `send captcha(${captcha}) to phone(${mobile}) failed. respond code(${code})`)
              return reject(internalError)
            }
          }
          else {
            logger.error(method, 'send sms failed. return xml:', data, 'exception:', e)
            return reject(internalError)
          }
        })
      })
    })
  })
}

function genInternalError() {
  const internalError = new Error('内部错误')
  internalError.status = 500
  return internalError
}

exports.sendCaptchaToPhone = sendCaptchaToPhone