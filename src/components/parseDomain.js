/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * v0.1 - 2016/11/04
 * @author mengyuan
 */

import { isDomain } from '../common/tools'
import cloneDeep from 'lodash/cloneDeep'

export function parseServiceDomain(item, bindingDomainStr, bindingIPStr) {
  let bindingDomain = []
  let bindingIP = []
  try {
    bindingDomain = JSON.parse(bindingDomainStr)
  }
  catch (e) {
    bindingDomain = []
  }
  try {
    bindingIP = JSON.parse(bindingIPStr)
  }
  catch (e) {
    bindingIP = []
  }

  let domains = []

  if (!item || !item.metadata) {
    return domains
  }

  let portsForExternal = cloneDeep(item.portsForExternal)
  let portForInternal = cloneDeep(item.portForInternal)
  const lbgroup = item.lbgroup
  if (lbgroup) {
    const { type, id, address, domain } = lbgroup
    if (type === 'public' || type === 'private') {
      bindingIP = [ address ]
      bindingIPStr = JSON.stringify(bindingIP)
      bindingDomain = [ domain ]
      bindingDomainStr = JSON.stringify(bindingDomain)
    }
    if (type === 'none' || id === 'mismatch') {
      bindingDomain = []
      bindingDomainStr = JSON.stringify(bindingDomain)
      portsForExternal = null
    }
  }

  // parse external domain, item.portsForExternal is array like [{name:"abasd",port:12345,protocol:"TCP",targetPort:1234},...]
  let nameInfo = item.metadata.name
  if (portsForExternal) {
    portsForExternal.map((port) => {
      let portInfo = ":" + port.proxyPort
      if (bindingIP && bindingDomain && port.protocol.toLowerCase() == 'http') {
        portInfo = ''
        nameInfo = item.metadata.name
      }
      if (bindingIP.length > 0 && !isDomain(bindingDomainStr)) {
        bindingIP.map((bindingIP) => {
          let domain = bindingIP + portInfo
          domain = domain.replace(/^(http:\/\/.*):80$/, '$1')
          domain = domain.replace(/^(https:\/\/.*):443$/, '$1')
          domains.push({
            lbgroup,
            domain,
            isInternal: false,
            interPort: port.targetPort,
            protocol:port.protocol
          })
        })
      }
      else if (isDomain(bindingDomainStr)) {
        bindingDomain.map((bindingDomain) => {
          let domain = ''
          // 检查是bindingDomain是否是IP，（此正则并不精确但在此处够用了）
          if (/^(\d{1,3}\.){3}\d{1,3}$/.test(bindingDomain)) {
            // e.g. http://192.168.1.123:1234
            domain = bindingDomain + portInfo
          }
          else {
            // e.g. http://servicename-mengyuan.test.paas.enncloud.cn:8080
            domain = nameInfo+ '-' + item.metadata.namespace + '.' + bindingDomain + portInfo
          }
          // if prefix is http://, remove suffix :80
          domain = domain.replace(/^(http:\/\/.*):80$/, '$1')
          // if prefix is https://, remove suffix :443
          domain = domain.replace(/^(https:\/\/.*):443$/, '$1')
          domains.push({
            lbgroup,
            domain,
            isInternal: false,
            interPort: port.targetPort,
            protocol:port.protocol
          })
        })
      }
    })
  }
  // parse interanl domain item.portForInternal is ["1234", "4567", "5234"]
  if (nameInfo && portForInternal) {
    portForInternal.map(port => {
      domains.push({
        lbgroup,
        domain: `${nameInfo}:${port}`,
        isInternal: true,
        interPort: port
      })
    })
  }

  return domains
}

export function parseAppDomain(app, bindingDomainStr, bindingIPStr) {
  let domains = []
  app.services.map((item) => {
    domains.push({
      name: item.metadata.name,
      data: parseServiceDomain(item, bindingDomainStr, bindingIPStr)
    })
  })
  return domains
}