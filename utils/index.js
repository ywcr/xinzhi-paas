/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Nomal tools
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
'use strict'

const moment = require('moment')
const constants = require('../constants')
const ADMIN_ROLE = constants.ADMIN_ROLE

exports.formatDate = function(timestamp) {
  if ( !timestamp || timestamp === '' ) {
    return moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
  } else {
    return moment(timestamp).format("YYYY-MM-DD HH:mm:ss")
  }
}

exports.calcuDate = function(beginDate){
  var begin = Date.parse(beginDate);
  var end = new Date();
  var date = end - begin;

  var days = Math.floor(date/(24*3600*1000));

  var months = Math.floor(days / 30);
  var leave1 = date%(24*3600*1000);
  var hours=Math.floor(leave1/(3600*1000));

  var leave2=leave1%(3600*1000);
  var minutes=Math.floor(leave2/(60*1000));

  var leave3=leave2%(60*1000);
  var seconds=Math.round(leave3/1000);

  if (months > 0) {
    return months + '月前';
  } else if (days > 0) {
    return days + '天前';
  } else if (hours > 0) {
    return hours + '小时前';
  } else if (minutes > 0) {
    return minutes + '分钟前';
  } else if (seconds > 0) {
    return seconds + '秒前';
  } else {
    return '1秒前';
  }
}

exports.getClientIP = function(req){
  var ipAddress;
  var headers = req.headers;
  // console.log('headers:\n' + JSON.stringify(req.headers, null, 4));
  var forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
  forwardedIpsStr ? (ipAddress = forwardedIpsStr) : (ipAddress = null);
  if (!ipAddress) {
    ipAddress = req.connection.remoteAddress;
  } else if (ipAddress.indexOf(',') > -1) {
    var ipAddressArray = ipAddress.split(',');
    ipAddress = ipAddressArray[0];
  }
  return ipAddress;
}

exports.getHostname = function () {
  return os.hostname()
}

exports.DateNow = function () {
  return new Date(moment().add(8, 'hour'))
}

exports.toUTCString = function (date) {
  if (!date || !date.toUTCString) {
    return null
  }
  return `${date.toUTCString()}+0800`
}

exports.promisify = function(fn, receiver) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key ++) {
      args[_key] = arguments[_key]
    }

    return new Promise(function (resolve, reject) {
      fn.apply(receiver, [].concat(args, [function (err, res) {
        return err ? reject(err) : resolve(res)
      }]))
    })
  }
}
exports.handleExecError = function(method, err) {
  if (!err || Object.keys(err).length < 1) {
    return {}
  }
  let stdout, stderr
  if (err.stdout) stdout = err.stdout.toString()
  if (err.stderr) stderr = err.stderr.toString()
  if (stdout || stderr) {
    logger.error(method, 'stdout: ' + stdout)
    logger.error(method, 'stderr: ' + stderr)
    return {stdout, stderr}
  }
  logger.error(method, JSON.stringify(err))
  return err
}

// Generate random string with specified length
exports.genRandomString = function(mytoken, len){
  var token="0123456789qwertyuioplkjhgfdsazxcvbnm"
  if (!len) {
    len = mytoken
    mytoken =null
  } else if(mytoken) {
    token = mytoken;
  }
  var result="";
  for(var   i=0;i< len;i++)   {
      result += token.charAt(Math.ceil(Math.random()*100000000)%token.length);
  }
  return result;
}

/**
 * To determine whether the admin user
 *
 * @param {Object} user
 * @returns {Bool}
 */
exports.isAdmin = function(user) {
  if (!user) {
    return false
  }
  if (user.role === ADMIN_ROLE) {
    return true
  }
  return false
}


/**
 * Check object if empty.
 */
exports.isEmptyObject = function(obj) {
  for (var name in obj) {
    return false
  }
  return true
}

exports.toQuerystring = function(obj, sep, eq) {
  sep = sep || '&'
  eq = eq || '='
  if (!obj) {
    return ''
  }
  return Object.keys(obj).map(function (k) {
    let ks = stringifyPrimitive(k) + eq
    if (Array.isArray(obj[k])) {
      return obj[k].map(function (v) {
        return ks + stringifyPrimitive(v)
      }).join(sep)
    } else {
      return ks + stringifyPrimitive(obj[k])
    }
  }).join(sep)
  function stringifyPrimitive(v) {
    switch (typeof v) {
      case 'string':
        return v
      case 'boolean':
        return v ? 'true' : 'false'
      case 'number':
        return isFinite(v) ? v : ''
      default:
        return ''
    }
  }
}