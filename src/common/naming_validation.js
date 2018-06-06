/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * v0.1 - 2016/12/08
 * @author Lei
 */

/*
Validation for k8s resource, including service, deployment, ...
*/
export function validateK8sResource(name) {
  if (!name) {
    return false
  }
  if (name.length < 3 || name.length > 64) {
    return false
  }
  // TODO: not work with below syntax
  // let regx = /^[a-z0-9]+([-.~/][a-z0-9]+)*$/
  let regx = new RegExp('^[a-z][-a-z0-9]{1,61}[a-z0-9]$')
  if (!regx.test(name)) {
    return false
  }
  return true
}
/*
 * Validation for service name
 */
export function validateK8sResourceForServiceName(name) {
  if (!name) {
    return false
  }
  console.log(name.length)
  if (name.length < 3 || name.length >40) {
    return false
  }
  // TODO: not work with below syntax
  // let regx = /^[a-z0-9]+([-.~/][a-z0-9]+)*$/
  let regx = new RegExp('^[a-z][-a-z0-9]{1,40}[a-z0-9]$')
  if (!regx.test(name)) {
    return false
  }
  return true
}
/*
 * Validation for service config
 */
export function validateServiceConfig(name) {
  if (!name) {
    return false
  }
  if (name.length < 3 || name.length > 63) {
    return false
  }
  // TODO: not work with below syntax
  // let regx = /^[a-z0-9]+([-.~/][a-z0-9]+)*$/
  let regx = new RegExp('^[-_.a-zA-Z0-9]{3,63}$')
  if (!regx.test(name)) {
    return false
  }
  return true
}

/*
 * Validation for config file of config group
 */
export function validateServiceConfigFile(name) {
  if (!name) {
    return false
  }
  if (name.length > 253) {
    return false
  }
  let regx = new RegExp('^\\.?[a-zA-Z0-9]([-a-zA-Z0-9_]*[a-zA-Z0-9])?(\\.[a-zA-Z0-9]([-a-zA-Z0-9_]*[a-zA-Z0-9])?)*$')
  if (!regx.test(name)) {
    return false
  }
  return true
}
/*
Validation for app name
*/
export function validateAppName(name) {
  if (!name) {
    return new Error('请输入应用名称')
  }
  if (name.length < 3) {
    return new Error('请输入3个以上字符')
  }
  if (name.length > 63) {
    return new Error('请输入63个以下字符')
  }
  let regx = /^[a-zA-Z0-9]+([-.~/][a-zA-Z0-9]+)*$/
  if (!regx.test(name)) {
    return new Error('可由数字、中划线、下划线组成，以字母开头，字母或者数字结尾')
  }
  return
}

/**
 * this function for app, storage, compose file, tenxflow, repository,
 * docker file, image name, image store, users, team,
 * teamspeace, integration
 */
export function appNameCheck(name, itemName, existNameFlag) {
  //name for check, itemName for show, existNameFlag for show existed
  let errorMsg = '';
  //null check
  if (!name || name.length == 0) {
    errorMsg = '请输入' + itemName;
    return errorMsg;
  }
  //a-zA-Z start check
  let startCheck = new RegExp('^[A-Za-z]{1}');
  if (!startCheck.test(name)) {
    errorMsg = '请以字母开头';
    return errorMsg;
  }
  //a-zA-Z0-9_- body check
  let bodyCheck = new RegExp('^[A-Za-z]+([_-]?[A-Za-z0-9]+)*$');

    // '^[a-z0-9]+(?:[._-][a-z0-9]+)*$
  if (!bodyCheck.test(name)) {
    errorMsg = '由字母、数字、非连续的中划线-和下划线_组成,由字母或数字结尾';
    return errorMsg;
  }
  //min length check
  if (name.length < 3) {
    errorMsg = '请输入3个以上字符';
    errorMsg = `${itemName}至少为3个字符`;
    return errorMsg;
  }
  //existName check
  if (!!existNameFlag) {
    errorMsg = itemName + '已经存在';
    return errorMsg;
  }
  //max length check
  if (name.length > 63) {
    errorMsg = '不能超过63个字符';
    return errorMsg;
  }
  //a-zA-Z0-9 end check
  let endCheck = new RegExp('^[A-Za-z]{1}[A-Za-z0-9_\-]{1,61}[A-Za-z0-9]$');
  if (!endCheck.test(name)) {
    errorMsg = '由字母或数字结尾';
    return errorMsg;
  }
  return 'success';
}

export function volNameCheck(name, itemName) {
  if (name && name.length > 32) {
    return '不能超过32个字符'
  }
  return appNameCheck(name, itemName)
}
/*
 * this function for service, service config, database cluster
 */
export function serviceNameCheck(name, itemName, existNameFlag) {
  //name for check, itemName for show, existNameFlag for show existed
  let errorMsg = '';
  //null check
  if (name.length == 0 || !name) {
    errorMsg = '请输入' + itemName;
    return errorMsg;
  }
  //a-zA-Z start check
  let startCheck = new RegExp('^[a-z]{1}');
  if (!startCheck.test(name)) {
    errorMsg = '请以小写字母开头';
    return errorMsg;
  }
  //a-zA-Z0-9_- body check
  let bodyCheck = new RegExp('^[a-z]{1}[a-z0-9_-]*$');
  if (!bodyCheck.test(name)) {
    errorMsg = '由小写字母、数字、中划线-、下划线_组成';
    return errorMsg;
  }
  //min length check
  if (name.length < 3) {
    errorMsg = '请输入3个以上字符';
    return errorMsg;
  }
  //existName check
  if (!!existNameFlag) {
    errorMsg = itemName + '已经存在';
    return errorMsg;
  }
  //max length check
  if (name.length > 63) {
    errorMsg = '不能超过63个字符';
    return errorMsg;
  }
  //a-z0-9 end check
  let endCheck = new RegExp('^[a-z]{1}[a-z0-9_\-]{1,61}[a-z0-9]$');
  if (!endCheck.test(name)) {
    errorMsg = '由小写字母或数字结尾';
    return errorMsg;
  }
  return 'success';
}

/**
 * this function for create app service env check
 */
export function appEnvCheck(name, itemName, existNameFlag) {
  //name for check, itemName for show, existNameFlag for show existed
  let errorMsg = '';
  //null check
  if (!name || name.length == 0) {
    errorMsg = '请输入' + itemName;
    return errorMsg;
  }
  //a-zA-Z start check
  let startCheck = new RegExp('^[A-Za-z_]{1}');
  if (!startCheck.test(name)) {
    errorMsg = '请以字母或下划线开头';
    return errorMsg;
  }
  //a-zA-Z0-9_- body check
  let bodyCheck = new RegExp('^[A-Za-z_]{1}[A-Za-z0-9_]*$');
  if (!bodyCheck.test(name)) {
    errorMsg = '由字母、数字、下划线_组成';
    return errorMsg;
  }
  //min length check
  if (name.length < 2) {
    errorMsg = '请输入2个以上字符';
    return errorMsg;
  }
  //existName check
  if (!!existNameFlag) {
    errorMsg = itemName + '已经存在';
    return errorMsg;
  }
  //max length check
  if (name.length > 63) {
    errorMsg = '不能超过63个字符';
    return errorMsg;
  }
  return 'success';
}
export function IDValide(ID) {
  if (!/^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$/.test(ID) && !/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(ID)) {
    return '请输入正确的身份证号码'
  }
  if (ID.length == 15) {
    return ''
  }
  const v = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const remainder = [1, 0, 'x', 9, 8, 7, 6, 5, 4, 3, 2]
  let valide = 0
  for (var index = 0; index < 18; index++) {
    if (index == 17) {
      continue
    }
    valide += (ID[index].charCodeAt(0) - 48) * v[index]
  }
  if (remainder[valide % 11] == ID[17]) {
    return ''
  }
  return '请输入正确的身份证号码'
}

// github.com/kubernetes/apimachinery/pkg/util/validation/validation.go
export function KubernetesValidator() {
  this.DNS1123SubdomainMaxLength = 253
  this.dns1123LabelFmt = "[a-z0-9]([-a-z0-9]*[a-z0-9])?"
  this.dns1123SubdomainFmt = this.dns1123LabelFmt + "(\\." + this.dns1123LabelFmt + ")*"
  this.dns1123SubdomainRegexp = new RegExp("^" + this.dns1123SubdomainFmt + "$")
  this.qualifiedNameMaxLength = 63
  this.qnameCharFmt = "[A-Za-z0-9]"
  this.qnameExtCharFmt = "[-A-Za-z0-9_.]"
  this.qualifiedNameFmt = "(" + this.qnameCharFmt + this.qnameExtCharFmt + "*)?" + this.qnameCharFmt
  this.qualifiedNameRegexp = new RegExp("^" + this.qualifiedNameFmt + "$")
  this.qualifiedNameErrMsg = "must consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character"
  this.dns1123SubdomainErrorMsg  = "a DNS-1123 subdomain must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character"
  this.LabelValueMaxLength = 63
  this.labelValueFmt = "(" + this.qualifiedNameFmt + ")?"
  this.labelValueRegexp = new RegExp("^" + this.labelValueFmt + "$")
  this.labelValueErrMsg = "a valid label must be an empty string or consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character"
  this.EmptyError = function() {
    return "must be non-empty"
  }

  this.RegexError = function(msg, fmt, examples) {
    if (examples.length == 0) {
      return msg + " (regex used for validation is '" + fmt + "')"
    }
    msg += " (e.g. "
    examples.forEach((example, i) => {
      if (i > 0) {
        msg += " or "
      }
      msg += "'" + example + "', "
    })
    msg += "regex used for validation is '" + fmt + "')"
    return msg
  }

  this.MaxLenError = function(length) {
    return "must be no more than " + length + " characters"
  }

  this.IsDNS1123Subdomain = function(value) {
    let errs = []
    if (value.length > this.DNS1123SubdomainMaxLength) {
      errs.push(this.MaxLenError(this.DNS1123SubdomainMaxLength))
    }
    if (!this.dns1123SubdomainRegexp.test(value)) {
      errs.push(this.RegexError(this.dns1123SubdomainErrorMsg, this.dns1123SubdomainFmt, ["example.com"]))
    }
    return errs
  }

  this.IsQualifiedName = function(value) {
    let errs = []
    const parts = value.split("/")
    let name = ""
    switch (parts.length) {
      case 1:
        name = parts[0]
        break
      case 2:
        const prefix = parts[0]
        name = parts[1]
        if (prefix.length == 0) {
          errs.push("prefix part " + this.EmptyError())
        } else {
          const msgs = this.IsDNS1123Subdomain(prefix)
          if (msgs.length > 0) {
            msgs.map(msg => "prefix part " + msg).forEach(msg => errs.push(msg))
          }
        }
        break
      default:
        errs.push("a qualified name "
          + this.RegexError(this.qualifiedNameErrMsg, this.qualifiedNameFmt, ["MyName", "my.name", "123-abc"])
          + " with an optional DNS subdomain prefix and '/' (e.g. 'example.com/MyName')")
        return errs
    }
    const nameLength = name.length
    if (nameLength == 0) {
      errs.push("name part " + this.EmptyError())
    } else if (nameLength > this.qualifiedNameMaxLength) {
      errs.push("name part " + this.MaxLenError(this.qualifiedNameMaxLength))
    }
    if (!this.qualifiedNameRegexp.test(name)) {
      errs.push("name part "
        + this.RegexError(this.qualifiedNameErrMsg, this.qualifiedNameFmt, ["MyName", "my.name", "123-abc"]))
    }
    return errs
  }

  this.IsValidLabelValue = function(value) {
    let errs = []
    if (value.length > this.LabelValueMaxLength) {
      errs.push(this.MaxLenError(this.LabelValueMaxLength))
    }
    if (!this.labelValueRegexp.test(value)) {
      errs.push(this.RegexError(this.labelValueErrMsg, this.labelValueFmt, ["MyValue", "my_value", "12345"]))
    }
    return errs
  }
}
