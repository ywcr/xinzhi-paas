/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Service class for k8s
 *
 * v0.1 - 2016-10-11
 * @author Zhangpc
 */
'use strict'
const constants = require('../../constants')

const TENXCLOUD_PREFIX = 'tenxcloud.com/'
// const TENX_SCHEMA_PORTNAME = 'paas.enncloud.cn/schemaPortname'
const TENX_SCHEMA_PORTNAME = 'tenxcloud.com/schemaPortname'//zhanghongyi 后续优化
const TENX_SCHEMA_LBGROUP = 'system/lbgroup'

class Service {
    constructor(name, cluster) {
            this.kind = 'Service'
            this.apiVersion = 'v1'
            this.metadata = {
                name,
                labels: {
                    name
                }
            }
            this.spec = {
                ports: [],
                selector: {
                    name
                },
                externalIPs: []
            }
            if (cluster && cluster.publicIPs) {
                this.spec.externalIPs = JSON.parse(cluster.publicIPs)
            }
        }
        // Call from server side only
    importFromK8SService(k8sService) {
            if (k8sService.metadata) {
                if (k8sService.metadata.name) {
                    this.metadata.name = k8sService.metadata.name
                }
                if (k8sService.metadata.labels) {
                    for (let key in k8sService.metadata.labels) {
                        // Remove tenxcloud added labels
                        if (key.indexOf(TENXCLOUD_PREFIX) != 0) {
                            this.metadata.labels[key] = k8sService.metadata.labels[key]
                        }
                    }
                }
                if (k8sService.metadata.annotations) {
                    for (let key in k8sService.metadata.annotations) {
                        if (key == TENX_SCHEMA_PORTNAME) {
                            this.metadata.annotations = {}
                            this.metadata.annotations[key] = k8sService.metadata.annotations[key]
                            break;
                        }
                    }
                }
            }

            if (k8sService.spec) {
                if (k8sService.spec.ports) {
                    this.spec.ports = k8sService.spec.ports
                }
                if (k8sService.spec.selector) {
                    this.spec.selector = k8sService.spec.selector
                }
                if (k8sService.spec.externalIPs) {
                    this.spec.externalIPs = k8sService.spec.externalIPs
                }
                if (constants.PROXY_TYPE == constants.SERVICE_KUBE_NODE_PORT) {
                    if (k8sService.spec.type) {
                        this.spec.type = k8sService.spec.type
                    }
                }
            }
        }
        // Call from client side
    addPort(proxyType, name, protocol, targetPort, port, nodePort) {
        // K8s only support TCP and UDP protocol
        const k8sProtocol = (protocol === 'UDP' ? protocol : 'TCP')
        const portObj = {
            name,
            protocol: k8sProtocol,
            targetPort
        }
        if (port) {
            portObj.port = port
        }
        // Check service type, add nodeport if service type is 'kube-nodeport' and user defined port
        if (proxyType == constants.SERVICE_KUBE_NODE_PORT) {
            this.spec.type = 'NodePort'
            if (nodePort) {
                // Use user specified one
                portObj.nodePort = parseInt(nodePort)
            }
        }
        this.spec.ports.push(portObj)
    }

    // Add annotation to service to indicate proxy port
    addPortAnnotation(name, protocol, port) {
            if (!this.metadata.annotations) {
                this.metadata.annotations = {}
            }
            // Mark real protocol in annotations
            if (!this.metadata.annotations[TENX_SCHEMA_PORTNAME]) {
                this.metadata.annotations[TENX_SCHEMA_PORTNAME] = `${name}/${protocol}`
                if (protocol != "HTTP" && port) { // Add port if it's NOT HTTP'
                    this.metadata.annotations[TENX_SCHEMA_PORTNAME] += ("/" + port)
                }
            } else {
                this.metadata.annotations[TENX_SCHEMA_PORTNAME] += `,${name}/${protocol}`
                if (protocol != "HTTP" && port) { // Add port if it's NOT HTTP'
                    this.metadata.annotations[TENX_SCHEMA_PORTNAME] += ("/" + port)
                }
            }
        }
        // Add lbgroup info to service annotation
    addLBGroupAnnotation(groupName) {
        if (!this.metadata.annotations) {
            this.metadata.annotations = {}
        }
        this.metadata.annotations[TENX_SCHEMA_LBGROUP] = groupName
    }
}

module.exports = Service