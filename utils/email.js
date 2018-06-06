/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 */
/**
* Email tools
*
* v0.1 - 2016-11-04
* @author Zhangpc
*/


'use strict'

const nodemailer = require('nodemailer')
const moment = require('moment')
const logger = require('./logger').getLogger('email')
const config = require('../configs')
config.mail_server = global.globalConfig.mail_server
const constants = require('../configs/constants')
const fs = require('fs')
const EMAIL_TEMPLATES_DIR = `${__root__dirname}/templates/email`
const SendCloud = require('sendcloud')
var http = require('http');
// var crypto = require('crypto');
// var md5 = crypto.createHash('md5');
/**
 * Send email use SMTP
 *
 * ```
 * mailOptions = {
 *   from: "service@paas.enncloud.cn", // sender address
 *   to: "zhangpc@paas.enncloud.cn" || [], // list of receivers
 *   subject: 'Hello ✔', // Subject line
 *   text: 'Hello world ?', // plaintext body
 *   html: '<b>Hello world ?</b>' // html body
 * }
 * ```
 * @param {Object} transport
 * @param {Object} mailOptions
 * @returns {Promise}
 */
function mathRandom() {
  var charactors = "ab1cd2ef3gh4ij5kl6mn7opq8rst9uvw0xyz";
  var value = '', i;
  for (j = 1; j <= 4; j++) {
    i = parseInt(35 * Math.random());
    value = value + charactors.charAt(i);
  }
  return value
  // alert(value);
}

function sendEmail(transport, mailOptions) {
  const method = 'sendEmail'
  // In case there is no mail options provided
  if (!mailOptions) {
    mailOptions = transport
    transport = config.mail_server
  }
  // if SMTP not configured(lite) skip send email
  if (!transport.host) {
    logger.warn(method, 'SMTP not configured, skip send email')
    return Promise.reject({ message: 'config email first', status: 400 })
  }
  // Force to use this 'from' user if using sendEmail method
  mailOptions.from = transport.auth.user
  if (transport.auth.pass === '') {
    transport.auth = null
  }
  const smtpTransport = nodemailer.createTransport(transport)
  return new Promise(function (resovle, reject) {
    logger.info(method, 'Send email to: ' + mailOptions.to)
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        logger.error(method, error)
        reject(error)
      } else {
        logger.info(method, 'Email sent: ' + response.response)
      }
      smtpTransport.close()
      resovle(response)
    })
  })
}

exports.sendEmail = sendEmail
function sendPhone(transport, mailOptions, to) {
  const method = 'sendEmail'
  if (!mailOptions) {
    mailOptions = transport
    transport = config.mail_server
  }
  if (!transport.host) {
    logger.warn(method, 'SMTP not configured, skip send email')
    return Promise.reject({ message: 'config email first', status: 400 })
  }
  // const smtpTransport = nodemailer.createTransport(transport)

  // return new Promise(function (resovle, reject) {
  //   logger.info(method, 'Send email to: ' + mailOptions.to)
  //   smtpTransport.sendMail(mailOptions, function (error, response) {
  //     if (error) {
  //       logger.error(method, error)
  //       reject(error)
  //     } else {
  //       logger.info(method, 'Email sent: ' + response.response)
  //     }
  //     smtpTransport.close()
  //     resovle(response)
  //   })
  // })

  // let list = undefined
  const charactors = "ab1cd2ef3gh4ij5kl6mn7opq8rst9uvw0xyz";
  var value = '', i;
  for (let j = 1; j <= 4; j++) {
    i = parseInt(35 * Math.random());
    value = value + charactors.charAt(i);
  }
  // var content = md5.update(value).digest('base64');
  // var result = md5.update(value).digest('hex');
  let url = '/mdwebservice.asmx/SapSendSms?username=SAP_basis&password=E10ADC3949BA59ABBE56E057F20F883E&mobile='
  var options = {
    hostname: '10.36.128.10',
    path: url + `${to}` + '&content=' + `${value}` + '&ext=015',
    method: 'GET'
  };
  const _this = this
  var result = http.request(options, (result) => {
    console.log('STATUS: ' + result.statusCode);
    result.setEncoding('utf8');
  });

  console.log(result, '----------result-')
  return {
    to: value
  }
  console.log(result, '----------result-')
  result.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });
  result.end();



}

exports.sendPhone = sendPhone




// exports.checkPhoneAcceptMobile = function* () {
//   let list = undefined
//   const charactors = "ab1cd2ef3gh4ij5kl6mn7opq8rst9uvw0xyz";
//   var value = '', i;
//   for (let j = 1; j <= 4; j++) {
//     i = parseInt(35 * Math.random());
//     value = value + charactors.charAt(i);
//   }
//   var content = md5.update(value).digest('base64');
//   let url = '/mdwebservice.asmx/SapSendSms?username=SAP_basis&password=E10ADC3949BA59ABBE56E057F20F883E&mobile='
//   var options = {
//     hostname: '10.36.128.10',
//     path: url + `${this.query.phone}` + '&content=' + `${value}` + '&ext=015',
//     method: 'GET'
//   };
//   const _this= this
//   var req = http.request(options, (res) => {
//     console.log('STATUS: ' + res.statusCode);
//     res.setEncoding('utf8');
//     res.on('data', function (chunk) {
//       console.log('BODY: ' + chunk); 
//     });

//   });

//   req.on('error', function (e) {
//     console.log('problem with request: ' + e.message);
//   });
//   req.end();

// }
/**
 * Send email use sendcloud
 * 使用触发账号，发送邮件给某一个用户
 *
 * ```
 * mailOptions = {
 *   to: "zhangpc@paas.enncloud.cn" || [], // 邮件接收者
 *   subject: '个人账户充值到账通知', // 主题
 *   templateName: 'charge_success', // 模板名
 *   sub: {
 *     '%subject%': ['个人账户充值到账通知'],
 *     '%payMethod%': ['微信']
 *   } // 参数
 *   options: { } // 其他可选参数
 * }
 * ```
 * 当 to 为字符串时使用触发 API user 以及触发邮件接口，对应的邮件模板也必须是触发邮件
 * 当 to 为数组时使用批量API user 以及批量邮件接口，对应的邮件模板也必须是批量邮件
 *
 * @param {Object} mailOptions
 * @returns {Promise}
 */
function sendEmailBySendcloud(mailOptions) {
  const sendcloudConfig = config.sendcloud
  let apiUser
  let _send
  let sendcloud
  if (Array.isArray(mailOptions.to)) {
    // 批量邮件
    apiUser = sendcloudConfig.apiUserBatch
    sendcloud = new SendCloud(sendcloudConfig.apiUser,
      sendcloudConfig.apiKeyBatch,
      sendcloudConfig.from,
      sendcloudConfig.fromname,
      apiUser)
    _send = sendcloud.sendByTemplate.bind(sendcloud)
  } else {
    // 触发邮件
    apiUser = sendcloudConfig.apiUser
    sendcloud = new SendCloud(sendcloudConfig.apiUser,
      sendcloudConfig.apiKeyTrigger,
      sendcloudConfig.from,
      sendcloudConfig.fromname,
      apiUser)
    _send = sendcloud.templateToOne.bind(sendcloud)
  }
  return _send(mailOptions.to,
    mailOptions.subject,
    mailOptions.templateName,
    mailOptions.sub,
    mailOptions.options).then(result => {
      if (result.message !== 'success') {
        logger.error(result.errors)
        throw new Error(result.errors || result.message)
      }
      return result
    })
}
exports.sendEmailBySendcloud = sendEmailBySendcloud
// sendMobileVerificationMobile shouji
function sendEmailBySendcloud(mailOptions) {
  const sendcloudConfig = config.sendcloud
  let apiUser
  let _send
  let sendcloud
  if (Array.isArray(mailOptions.to)) {
    // 批量邮件
    apiUser = sendcloudConfig.apiUserBatch
    sendcloud = new SendCloud(sendcloudConfig.apiUser,
      sendcloudConfig.apiKeyBatch,
      sendcloudConfig.from,
      sendcloudConfig.fromname,
      apiUser)
    _send = sendcloud.sendByTemplate.bind(sendcloud)
  } else {
    // 触发邮件
    apiUser = sendcloudConfig.apiUser
    sendcloud = new SendCloud(sendcloudConfig.apiUser,
      sendcloudConfig.apiKeyTrigger,
      sendcloudConfig.from,
      sendcloudConfig.fromname,
      apiUser)
    _send = sendcloud.templateToOne.bind(sendcloud)
  }
  return _send(mailOptions.to,
    mailOptions.subject,
    mailOptions.templateName,
    mailOptions.sub,
    mailOptions.options).then(result => {
      if (result.message !== 'success') {
        logger.error(result.errors)
        throw new Error(result.errors || result.message)
      }
      return result
    })
}
exports.sendEmailBySendcloud = sendEmailBySendcloud
/**
 * Send ensure email
 * At first send email by sendcloud, if send failed use sendEmail
 * @param {Object} mailOptions
 * @param {String} htmlName (html template file name)
 * @returns {Promise}
 */
function sendEnsureEmail(mailOptions, htmlName) {
  return sendEmailBySendcloud(mailOptions).catch(err => {
    logger.error("Failed to send using sendcloud: " + JSON.stringify(err))
    let html = fs.readFileSync(`${EMAIL_TEMPLATES_DIR}/${htmlName}`, 'utf8')
    const sub = mailOptions.sub
    for (let key in sub) {
      if (sub.hasOwnProperty(key)) {
        let regExp = new RegExp(key, 'g')
        html = html.replace(regExp, sub[key][0])
      }
    }
    mailOptions.html = html
    return sendEmail(mailOptions)
  })
}
exports.sendEnsureEmail = sendEnsureEmail


/**
 * Send verification email
 * At first send email by sendcloud, if send failed use sendEmail
 * @param {Object} transport
 * @param {Object} mailOptions
 * @param {String} htmlName (html template file name)
 * @returns {Promise}
 */
function sendVerificationEmail(transport, mailOptions, htmlName) {
  return sendEmailBySendcloud(mailOptions).catch(err => {
    logger.error("Failed to send using sendcloud: " + JSON.stringify(err))
    let html = fs.readFileSync(`${EMAIL_TEMPLATES_DIR}/${htmlName}`, 'utf8')
    const sub = mailOptions.sub
    for (let key in sub) {
      if (sub.hasOwnProperty(key)) {
        let regExp = new RegExp(key, 'g')
        html = html.replace(regExp, sub[key][0])
      }
    }
    mailOptions.html = html
    return sendEmail(transport, mailOptions)
  })
}
exports.sendVerificationEmail = sendVerificationEmail
// sendVerificationPhone
function sendVerificationPhone(transport, mailOptions, to) {

  return sendPhone(transport, mailOptions, to)

}
exports.sendVerificationPhone = sendVerificationPhone
// sendVerificationMobile
// function sendVerificationMobile(transport,mailOptions, htmlName) {
// 	return sendBySendcloud(mailOptions).catch(err => {
// 		logger.error("Failed to send using sendcloud: " + JSON.stringify(err))
// 		let html = fs.readFileSync(`${EMAIL_TEMPLATES_DIR}/${htmlName}`, 'utf8')
// 		const sub = mailOptions.sub
// 		for(let key in sub) {
// 			if (sub.hasOwnProperty(key)) {
// 				let regExp = new RegExp(key, 'g')
// 				html = html.replace(regExp, sub[key][0])
// 			}
// 		}
// 		mailOptions.html = html
// 		return sendEmail(transport,mailOptions)
// 	})
// }
// exports.sendVerificationMobile = sendVerificationMobile

/**
 * Send email when user created
 *
 * Calling sample: `sendUserCreationEmail("zhangsh@paas.enncloud.cn", "shouhong", "zhangsh@paas.enncloud.cn", "test_user", "11111111")`
 * @param {String} to
 * @param {String} creatorName
 * @param {String} creatorEmail
 * @param {String} userName
 * @param {String} userPassword
 * @returns {Promise}
 */
exports.sendUserCreationEmail = function (to, creatorName, creatorEmail, userName, userPassword) {
  const method = "sendUserCreationEmail"
  const subject = `已为您创建新智云帐号`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  const url = config.url.replace(/http[s]?:/g, "https:")
  // const url = 'https://'+location.host
  const loginURL = url + '/login'
  const mailOptions = {
    to,
    subject,
    templateName: 'user_creation',
    sub: {
      '%subject%': [subject],
      '%creatorName%': [creatorName],
      '%creatorEmail%': [creatorEmail],
      '%systemEmail%': [systemEmail],
      '%userName%': [userName],
      '%userPassword%': [userPassword],
      '%loginURL%': [loginURL],
      '%date%': [date],
    }
  }
  return sendEnsureEmail(mailOptions, 'user_creation.html')
}

/**
 * Send invite team member email
 *
 * Calling sample: `sendInviteTeamMemberEmail("zhangsh@paas.enncloud.cn", "shouhong", "zhangsh@paas.enncloud.cn", "研发Team", "http://paas.enncloud.cn")`
 * @param {String} to
 * @param {String} invitorName
 * @param {String} invitorEmail
 * @param {String} teamName
 * @param {String} inviteURL
 * @returns {Promise}
 */
exports.sendInviteTeamMemberEmail = function (to, invitorName, invitorEmail, teamName, inviteURL) {
  const method = "sendInviteTeamMemberEmail"
  const subject = `${teamName} 团队动态通知（邀请新成员）`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  const mailOptions = {
    to,
    subject,
    templateName: 'invite_team_member',
    sub: {
      '%subject%': [subject],
      '%invitorName%': [invitorName],
      '%invitorEmail%': [invitorEmail],
      '%systemEmail%': [systemEmail],
      '%teamName%': [teamName],
      '%inviteURL%': [inviteURL],
      '%date%': [date],
    }
  }
  return sendEnsureEmail(mailOptions, 'invite_team_member.html')
}

/**
 * Send cancel invitation email
 *
 * Calling sample: `sendCancelInvitationEmail("zhangsh@paas.enncloud.cn", "shouhong", "zhangsh@paas.enncloud.cn", "研发Team")`
 * @param {String} to
 * @param {String} invitorName
 * @param {String} invitorEmail
 * @param {String} teamName
 * @returns {Promise}
 */
exports.sendCancelInvitationEmail = function (to, invitorName, invitorEmail, teamName) {
  const method = "sendCancelInvitationEmail"

  const subject = `${teamName} 团队动态通知（取消邀请）`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  var mailOptions = {
    to,
    subject,
    templateName: 'cancel_invitation',
    sub: {
      '%subject%': [subject],
      '%invitorName%': [invitorName],
      '%invitorEmail%': [invitorEmail],
      '%systemEmail%': [systemEmail],
      '%teamName%': [teamName],
      '%date%': [date],
    }
  }
  return sendEnsureEmail(mailOptions, 'cancel_invitation.html')
}

/**
 * Send dismiss team emails
 *
 * Calling sample: `sendDismissTeamEmail("shouhong", "zhangsh@paas.enncloud.cn", "zhangsh@paas.enncloud.cn", "研发Team", true)`
 * @param {String} teamAdminName
 * @param {String} teamAdminEmail
 * @param {Array} teamMemberEmails
 * @param {String} teamName
 * @param {Boolean} hasRefund
 * @returns {Promise}
 */
exports.sendDismissTeamEmail = function (teamAdminName, teamAdminEmail, teamMemberEmails, teamName, hasRefund) {
  const method = "sendDismissTeamEmail"
  const subject = `${teamName} 团队动态通知（解散团队）`
  const emails = [teamAdminEmail, teamMemberEmails]
  const templates = ['dismiss_team_admin', 'dismiss_team_user']
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  let showRefund = "table-cell"
  let showNoRefund = "none"
  if (!hasRefund) {
    showRefund = "none"
    showNoRefund = "table-cell"
  }
  const promiseArray = []
  for (let i = 0; i < 2; i++) {
    if (emails[i].length == 0) {
      continue
    }
    let emailsItem = emails[i]
    let templateName = templates[i]
    let mailOptions = {
      to: emailsItem,
      subject: subject,
      templateName,
      sub: {
        '%subject%': [],
        '%teamAdminName%': [],
        '%teamAdminEmail%': [],
        '%teamName%': [],
        '%showRefund%': [],
        '%showNoRefund%': [],
        '%date%': [],
        '%systemEmail%': [],
      }
    }
    if (!Array.isArray(emailsItem)) {
      emailsItem = [emailsItem]
    }
    emailsItem.map(email => {
      mailOptions.sub['%subject%'].push(subject)
      mailOptions.sub['%teamAdminName%'].push(teamAdminName)
      mailOptions.sub['%teamAdminEmail%'].push(teamAdminEmail)
      mailOptions.sub['%teamName%'].push(teamName)
      mailOptions.sub['%showRefund%'].push(showRefund)
      mailOptions.sub['%showNoRefund%'].push(showNoRefund)
      mailOptions.sub['%date%'].push(date)
      mailOptions.sub['%systemEmail%'].push(systemEmail)
    })
    promiseArray.push(sendEnsureEmail(mailOptions, `${templateName}.html`))
  }
  return Promise.all(promiseArray)
}

/**
 * Send exit team emails
 *
 * Calling sample: `sendExitTeamEmail("zhangsh@paas.enncloud.cn", "zhangsh@paas.enncloud.cn", "shouhong", "研发Team")`
 * @param {String} teamAdminEmail
 * @param {String} teamMemberEmail
 * @param {String} teamMemberName
 * @param {String} teamName
 * @returns {Promise}
 */
exports.sendExitTeamEmail = function (teamAdminEmail, teamMemberEmail, teamMemberName, teamName) {
  const method = "sendEixtTeamEmail"

  const subject = `${teamName} 团队动态通知（${teamMemberName} 退出团队）`
  const emails = [teamAdminEmail, teamMemberEmail]
  const contents = [`${teamMemberName}成员退出团队"${teamName}"`, `您已退出"${teamName}"`]
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  const promiseArray = []
  for (let i = 0; i < 2; i++) {
    if (emails[i].length == 0) {
      continue
    }
    let mailOptions = {
      to: emails[i],
      subject,
      templateName: 'remove_team_member',
      sub: {
        '%subject%': [subject],
        '%content%': [contents[i]],
        '%date%': [date],
        '%systemEmail%': [systemEmail],
      }
    }
    promiseArray.push(sendEnsureEmail(mailOptions, `remove_team_member.html`))
  }
  return Promise.all(promiseArray)
}

/**
 * Send remove member emails
 *
 * Calling sample: `sendRemoveTeamMemberEmail("shouhong", "zhangsh@paas.enncloud.cn", "zhangsh@paas.enncloud.cn", "shouhong", "研发Team")`
 * @param {String} teamAdminName
 * @param {String} teamAdminEmail
 * @param {String} teamMemberName
 * @param {String} teamMemberEmail
 * @param {String} teamName
 * @returns {Promise}
 */
exports.sendRemoveTeamMemberEmail = function (teamAdminName, teamAdminEmail, teamMemberName, teamMemberEmail, teamName) {
  const method = "sendRemoveTeamMemberEmail"
  const subject = `${teamName} 团队动态通知（移除成员 ${teamMemberName}）`
  const emails = [teamAdminEmail, teamMemberEmail]
  const contents = [`您已将团队“${teamName}”团队成员${teamMemberName}移除`, `${teamAdminName}将您移除团队"${teamName}"`]
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  const promiseArray = []
  for (let i = 0; i < 2; i++) {
    if (emails[i].length == 0) {
      continue
    }
    let mailOptions = {
      to: emails[i],
      subject,
      templateName: 'remove_team_member',
      sub: {
        '%subject%': [subject],
        '%content%': [contents[i]],
        '%date%': [date],
        '%systemEmail%': [systemEmail],
      }
    }
    promiseArray.push(sendEnsureEmail(mailOptions, `remove_team_member.html`))
  }
  return Promise.all(promiseArray)
}

/**
 * Send reset password email
 *
 * Calling sample: `sendResetPasswordEmail("zhangsh@paas.enncloud.cn", "http://paas.enncloud.cn")`
 * @param {String} to
 * @param {String} resetPasswordURL
 * @returns {Promise}
 */
exports.sendResetPasswordEmail = function (to, resetPasswordURL) {
  const method = "sendResetPasswordEmail"
  const subject = `新智云用户重置密码`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  let mailOptions = {
    to,
    subject,
    templateName: 'reset_password',
    sub: {
      '%subject%': [subject],
      '%systemEmail%': [systemEmail],
      '%resetPasswordURL%': [resetPasswordURL],
      '%date%': [date],
    }
  }
  return sendEnsureEmail(mailOptions, 'reset_password.html')

  /*let data = fs.readFileSync(`${EMAIL_TEMPLATES_DIR}/reset_password.html`, 'utf8');

  data = data.replace(/\${subject}/g, subject)
  data = data.replace(/\${systemEmail}/g, systemEmail)
  data = data.replace(/\${resetPasswordURL}/g, resetPasswordURL)
  data = data.replace(/\${date}/g, date)
  mailOptions.html = data
  return sendEmail(mailOptions)*/
}

/**
 * 充值成功邮件通知函数
 *
 * @param {String} to
 * @param {String} payMethod
 * @param {String} payAmount
 * @param {String} payBalance
 * @param {String} paymentsHistoryUrl
 * @param {String} teamName
 * @returns {Promise}
 */
exports.sendChargeSuccessEmail = function (to, payMethod, payAmount, payBalance, paymentsHistoryUrl, teamName) {
  const method = 'sendChargeSuccessEmail'

  let subject = `个人帐户充值到帐通知`
  let payTarget = `个人帐户`
  if (teamName) {
    subject = `团队帐户充值到帐通知`
    payTarget = `团队 ${teamName} `
  }
  payMethod = switchPayTypeToText(payMethod)
  const date = moment(new Date()).format("YYYY-MM-DD")
  const mailOptions = {
    to,
    subject,
    templateName: 'charge_success',
    sub: {
      '%subject%': [subject],
      '%pay_method%': [payMethod],
      '%pay_target%': [payTarget],
      '%pay_amount%': [payAmount],
      '%pay_balance%': [payBalance],
      '%payments_history_url%': [paymentsHistoryUrl],
      '%date%': [date],
    }
  }

  return sendEnsureEmail(mailOptions, 'charge_success.html')
}

/**
 * Send user active email
 *
 * @param {String} to
 * @param {String} userActivationURL
 * @returns {Promise}
 */
exports.sendUserActivationEmail = function (to, userActivationURL) {
  const method = "sendUserActivationEmail"

  const subject = `新智云用户完成注册`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  let mailOptions = {
    to,
    subject,
    templateName: 'user_activation',
    sub: {
      '%subject%': [subject],
      '%systemEmail%': [systemEmail],
      '%userActivationURL%': [userActivationURL],
      '%date%': [date],
    }
  }
  return sendEnsureEmail(mailOptions, 'user_activation.html')

  /*fs.readFile(`${EMAIL_TEMPLATES_DIR}/user_activation.html`, 'utf8', function (err, data) {
    if (err) {
      logger.error(method, err)
        return
    }
    data = data.replace(/\${subject}/g, subject)
    data = data.replace(/\${systemEmail}/g, systemEmail)
    data = data.replace(/\${userActivationURL}/g, userActivationURL)
    data = data.replace(/\${date}/g, date)
    mailOptions.html = data
    sendEmail(mailOptions)
  });*/
}

/**
 * 将支付类型转换为文本
 *
 * @param {Number} type
 * @returns {String}
 */
function switchPayTypeToText(type) {
  type = parseInt(type)
  switch (type) {
    case 100:
      return '微信'
    case 101:
      return '支付宝'
    default:
      return '其他方式'
  }
}
// sendNotifyGroupInvitationPhone
exports.sendNotifyGroupInvitationPhone = function* (to, transport) {
  const subject = `[新智云]告警通知组|邮箱验证`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  const url = config.phonehost
  const inviteURL = url + '&mobile=' + `${to}` + '&content=' + `${1234}` + '&ext=015'
  const mailOptions = {
    to,
    sub: {
      '%to%': [to],
      '%inviteURL%': [inviteURL],
      '%date%': [date],
    }
  }
  return sendVerificationPhone(transport, mailOptions, to)
}
exports.sendNotifyGroupInvitationEmail = function* (to, invitorName, invitorEmail, code, transport) {
  const subject = `[新智云]告警通知组|邮箱验证`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  const url = config.url.replace(/http[s]?:/g, "https:")
  // const url = "https"+config.url.substring(4)
  //const inviteURL = `${config.url}/alerts/invitations/join?code=${code}`
  // const url = 'https://'+location.host
  const inviteURL = url + '/alerts/invitations/join?code=' + `${code}`
  const mailOptions = {
    to,
    subject,
    templateName: 'alarm_group',
    sub: {
      '%subject%': [subject],
      '%invitorName%': [invitorName],
      '%invitorEmail%': [invitorEmail],
      '%systemEmail%': [systemEmail],
      '%receiverEmail%': [to],
      '%inviteURL%': [inviteURL],
      '%date%': [date],
    }
  }
  return sendVerificationEmail(transport, mailOptions, 'alarm_group.html')
}
// sendNotifyGroupInvitationPhone
// item.addr, loginUser.user, loginUser.email, item.code,transport
// exports.sendNotifyGroupInvitationPhone = function* (phone,invitorName,code,transport) {
//   const subject = `[新智云]告警通知组|手机验证`
//   const systemEmail = config.mail_server.service_mail
//   const date = moment(new Date()).format("YYYY-MM-DD")
//   var charactors="ab1cd2ef3gh4ij5kl6mn7opq8rst9uvw0xyz";
//   let url ='http://10.36.128.10/mdwebservice.asmx/SapSendSms?username=SAP_basis&password=E10ADC3949BA59ABBE56E057F20F883E'
// 	var value='',i;
// 	for(let j=1;j<=4;j++){
// 		i = parseInt(35*Math.random()); 　
// 		value = value + charactors.charAt(i);
// 	}
//   const inviteURL = url+'&mobile='+`${phone}`+'&content='+`${value}`+'&ext=015'
//   return save(inviteURL)
// }
exports.sendGlobalConfigVerificationEmail = function* (body, invitorName, invitorEmail) {
  const subject = `[新智云]邮件报警|邮箱验证`
  const systemEmail = config.mail_server.service_mail
  const date = moment(new Date()).format("YYYY-MM-DD")
  const mailOptions = {
    from: body.email,
    to: body.email,
    subject,
    templateName: 'alarm_email',
    sub: {
      '%subject%': [subject],
      '%invitorName%': [invitorName],
      '%invitorEmail%': [invitorEmail],
      '%systemEmail%': [systemEmail],
      '%receiverEmail%': [body.email],
      '%date%': [date],
    }
  }
  var senderHost = body.host
  var senderEmail = senderHost.split(':')
  const transport = {
    host: senderEmail[0],
    secure: body.secure, // 使用 SSL
    port: senderEmail[1], // SMTP 端口
    auth: {
      user: body.email, // 账号
      pass: body.password, // 密码
    },
    service_mail: body.email
  }
  return sendVerificationEmail(transport, mailOptions, 'alarm_email.html')
}
