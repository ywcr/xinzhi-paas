/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App manage controller
 *
 * v0.1 - 2016-12-05
 * @author mengyuan
 */

'use strict'

const constants = require('../constants')
const noneLBGroup = 'none'
const mismatchLBGroup = 'mismatch'

exports.addPort =  function (deployment, serviceList, lbgroupSettings) {
  if (!deployment || !serviceList) {
      return
  }
  deployment.portForInternal = []
  deployment.portsForExternal = []
  if (!Array.isArray(serviceList)) {
      serviceList = [serviceList]
  }
  var lbgroupMappings = new Object()
  if (lbgroupSettings && lbgroupSettings.length > 0) {
    lbgroupSettings.forEach(function(group) {
      lbgroupMappings[group.id] = {
        type: group.type,
        address: group.address,
        domain: group.domain
      }
    })
  }

  for (let i = 0; i < serviceList.length; i++) {
    if (serviceList[i].metadata.name === deployment.metadata.name || serviceList[i].metadata.name.indexOf( deployment.metadata.name)!=-1) {
      if (serviceList[i].spec.externalIPs && serviceList[i].spec.externalIPs.length > 0 && serviceList[i].spec.ports && serviceList[i].spec.ports.length > 0) {
        serviceList[i].spec.ports.forEach(function(port) {
          if (!serviceList[i].metadata.annotations) {
            return
          }
          let portAnnotation = serviceList[i].metadata.annotations[constants.ANNOTATION_SVC_SCHEMA_PORTNAME]
          if (portAnnotation) {
            let portDef = portAnnotation.split(",")
            for (let i = 0; i< portDef.length; i++) {
              let p = portDef[i].split('/')
              if (p && p.length > 1) {
                if (p[0] == port.name && p.length > 1) {
                  port.protocol = p[1]
                  // Update to the proxy port
                  if (p.length > 2) {
                    port.proxyPort = p[2]
                  }
                  break
                }
              }
            }
          }
        })
        deployment.portsForExternal = serviceList[i].spec.ports
        if (serviceList[i].metadata.annotations) {
          deployment.binding_domains = serviceList[i].metadata.annotations.binding_domains
          deployment.binding_port = serviceList[i].metadata.annotations.binding_port
          if (serviceList[i].metadata.annotations[constants.ANNOTATION_HTTPS] === 'true') {
            deployment.https = true
          }
          // Add lbgroup info to deployment
          let lbgroupAnnotation = serviceList[i].metadata.annotations[constants.ANNOTATION_LBGROUP_NAME]
          if (lbgroupAnnotation) {
            if (lbgroupMappings[lbgroupAnnotation]) {
              deployment.lbgroup = {
                id: lbgroupAnnotation,
                type: lbgroupMappings[lbgroupAnnotation].type,
                address: lbgroupMappings[lbgroupAnnotation].address,
                domain: lbgroupMappings[lbgroupAnnotation].domain
              }
            } else if (lbgroupAnnotation === noneLBGroup) {
              deployment.lbgroup = {
                type: noneLBGroup
              }
            } else {
              deployment.lbgroup = {
                id: mismatchLBGroup
              }
            }
          }
        }
      }
      serviceList[i].spec.ports.map((svcPort) => deployment.portForInternal.push(svcPort.port))
      break
    }
  }
}