/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Deployment class for k8s
 *
 * v0.1 - 2016-10-11
 * @author Zhangpc
 */
'use strict'

const constants = require('../../constants')
const TENX_LOCAL_TIME_VOLUME = constants.TENX_LOCAL_TIME_VOLUME
const K8S_NODE_SELECTOR_KEY = constants.K8S_NODE_SELECTOR_KEY
const DEFAULT_DISKTYPE = 'rbd'
const Container = require('./container')
const TENXCLOUD_PREFIX = 'tenxcloud.com/'
const utils = require('../utils')

class Deployment {
  constructor(name) {
    this.kind = 'Deployment'
    this.apiVersion = 'v1'
    this.metadata = {
      name,
      labels: {
        name
      }
    }
    this.spec = {
      replicas: 1,
      selector: {
        matchLabels: {
          name
        }
      },
      template: {
        metadata: {
          labels: {
            name,
            diskType: ''
          }
        },
        spec: {
          containers: []
        }
      }
    }
  }

  importFromK8SDeployment(k8sDeployment) {
    if (k8sDeployment.metadata) {
      let metadata = {}
      if (k8sDeployment.metadata.name) {
        metadata.name = k8sDeployment.metadata.name
      }
      if (k8sDeployment.metadata.labels) {
        let labels = {}
        for (let key in k8sDeployment.metadata.labels) {
          //Remove tenxcloud added labels
          if (key.indexOf(TENXCLOUD_PREFIX) != 0) {
            labels[key] = k8sDeployment.metadata.labels[key]
          }
        }
        if (Object.keys(labels).length > 0) {
          metadata.labels = labels
        }
      }
      if (Object.keys(metadata).length > 0) {
        this.metadata = metadata
      }
    }

    if (k8sDeployment.spec) {
      let spec = {}
      if (k8sDeployment.spec.replicas) {
        spec.replicas = k8sDeployment.spec.replicas
      }
      if (k8sDeployment.spec.selector) {
        spec.selector = k8sDeployment.spec.selector
      }
      if (k8sDeployment.spec.template) {
        let template = {}
        if (k8sDeployment.spec.template.metadata) {
          let metadata = {}
          for (let key in k8sDeployment.spec.template.metadata) {
            //Remove 'creationTimestamp' tag
            if (key != 'creationTimestamp') {
              metadata[key] = k8sDeployment.spec.template.metadata[key]
            }
          }

          if (k8sDeployment.spec.template.metadata.labels) {
            let labels = {}
            for (let key in k8sDeployment.spec.template.metadata.labels) {
              //Remove tenxcloud added labels
              if (key.indexOf(TENXCLOUD_PREFIX) != 0) {
                labels[key] = k8sDeployment.spec.template.metadata.labels[key]
              }
            }
            if (Object.keys(labels).length > 0) {
              metadata.labels = labels
            }
          }
          if (Object.keys(metadata).length > 0) {
            template.metadata = metadata
          }
        }

        if (k8sDeployment.spec.template.spec) {
          let spec = {}
          if (k8sDeployment.spec.template.spec.volumes) {
            let volumes = []
            for (let vol of k8sDeployment.spec.template.spec.volumes) {
              let volume = vol
              if (vol.rbd && vol.rbd.image) {
                let strs = vol.rbd.image.split('.')
                volume.rbd = { image: strs[strs.length - 1] }
              }
              volumes.push(volume)
            }
            if (Object.keys(volumes).length > 0) {
              spec.volumes = volumes
            }
          }

          if (k8sDeployment.spec.template.spec.containers) {
            let containers = []

            for (let ct of k8sDeployment.spec.template.spec.containers) {
              let container = {}
              if (ct.name) {
                container.name = ct.name
              }
              if (ct.image) {
                container.image = ct.image
              }
              if (ct.ports) {
                container.ports = ct.ports
              }
              if (ct.env) {
                container.env = ct.env
              }
              if (ct.command) {
                container.command = ct.command
              }
              if (ct.args) {
                container.args = ct.args
              }
              if (ct.volumeMounts) {
                container.volumeMounts = ct.volumeMounts
              }
              if (ct.resources) {
                let resources = {}
                if (ct.resources.limits) {
                  let limits = {}
                  if (ct.resources.limits.memory) {
                    limits.memory = ct.resources.limits.memory
                  }
                  if (Object.keys(limits).length > 0) {
                    resources.limits = limits
                  }
                }
                if (ct.resources.requests) {
                  let requests = {}
                  // Handle cpu allocation in api-server side
                  /*if (ct.resources.requests.cpu) {
                    requests.cpu = ct.resources.requests.cpu
                  }*/
                  if (ct.resources.requests.memory) {
                    requests.memory = ct.resources.requests.memory
                  }
                  if (Object.keys(requests).length > 0) {
                    resources.requests = requests
                  }
                }
                if (Object.keys(resources).length > 0) {
                  container.resources = resources
                }
              }
              if (Object.keys(container).length > 0) {
                containers.push(container)
              }
            }
            if (containers.length > 0) {
              spec.containers = containers
            }
          }

          if (Object.keys(spec).length > 0) {
            template.spec = spec
          }
        }

        if (Object.keys(template).length > 0) {
          spec.template = template
        }
      }
      if (Object.keys(spec).length > 0) {
        this.spec = spec
      }
    }
  }

  setReplicas(replicas) {
    replicas = parseInt(replicas)
    if (isNaN(replicas)) {
      return
    }
    this.spec.replicas = replicas
  }

  addContainer(name, image,url) {
    const container = new Container(name, image,url)
    this.spec.template.spec.containers.push(container)
  }
  
  setContainerResources(containerName, memory, cpu) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      container.resources = utils.getResources(memory, cpu)
    })
  }

  // ~ containerPort = targetPort(Service)
  addContainerPort(containerName, containerPort, protocol) {
    protocol = (protocol === 'UDP' ? 'UDP' : 'TCP')
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      container.ports.push({
        containerPort,
        protocol
      })
    })
  }

  addContainerEnv(containerName, name, value) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      container.env.push({
        name,
        value
      })
    })
  }

  addContainerArgs(containerName, args) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      if (!args) return
      if (args.length == 1 && !args[0]) return
      if (!container.args) {
        container.args = []
      }
      if (Array.isArray(args)) {
        container.args = container.args.concat(args)
      } else {
        let argArray = args.split(' ')
        argArray.forEach(function (arg) {
          if (arg != "") {
            container.args.push(arg)
          }
        })
      }
    })
  }

  addContainerCommand(containerName, command) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      if (!container.command) {
        container.command = []
      }
      if (Array.isArray(command)) {
        container.command = container.command.concat(command)
      } else {
        let cmdArray = command.split(' ')
        cmdArray.forEach(function (cmd) {
          if (cmd != "") {
            container.command.push(cmd)
          }
        })
      }
    })
  }

  // ~ Image pull policy. One of Always, Never, IfNotPresent. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise.
  setContainerImagePullPolicy(containerName, imagePullPolicy) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      container.imagePullPolicy = imagePullPolicy || 'IfNotPresent'
    })
  }

  // ~ volume={name, diskType, fsType, image}}
  addContainerVolume(containerName, volume, volumeMounts, isWholeDir) {
    // console.log(containerName,111 ,volume,222,volumeMounts,333,isWholeDir,'-zhan1111111g')
    // console.log(TENX_LOCAL_TIME_VOLUME,'121212121211111111111112121212121212')
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      if (!container.volumeMounts) {
        container.volumeMounts = []
      }
      if (!this.spec.template.spec.volumes) {
        this.spec.template.spec.volumes = []
      }
      volumeMounts.forEach(item => {
        if (!isWholeDir) {
          const body = {
            name: volume.name,
            mountPath: item.mountPath,
            readOnly: item.readOnly || false
          }
          if(item.subPath) {
            body.subPath = item.subPath
          }
          container.volumeMounts.push(body)
        } else {
          container.volumeMounts.push({
            name: volume.name,
            mountPath: item.mountPath,
            readOnly: item.readOnly || false
          })
        }
      })
      if (volume.hostPath) {
        this.spec.template.spec.volumes.push({
          name: volume.name,
          hostPath: {
            path: volume.hostPath.path
          }
        })
        return
      }
      if (volume.configMap) {
        let configMap = {}
        if (isWholeDir) {
          configMap = {
            name: volume.configMap.name
          }
        } else {
          configMap = {
            name: volume.configMap.name,
            items: volume.configMap.items.map((item) => {
              return {
                // TODO: fix this later, be compatible with previous version
                key: item.key, // .toLowerCase(),
                path: item.path
              }
            })
          }
        }
        this.spec.template.spec.volumes.push({
          name: volume.name,
          configMap
        })
        return
      }
      if(volume.emptyDir){
        this.spec.template.spec.volumes.push({
          name: volume.name,
          emptyDir: {},
        })
        return
      }
      if (!volume.diskType) {
        volume.diskType = DEFAULT_DISKTYPE
      }
      this.spec.template.metadata.labels.diskType = volume.diskType
      if(volume.isOld=="true"||volume.isOld=="null"){
        this.spec.template.spec.volumes.push({
          name: volume.name,
          [volume.diskType]: {
            fsType: volume.fsType,
            image: volume.claimName,
            diskType: volume.diskType
          }
        })
      }else{
        this.spec.template.spec.volumes.push({
          name: volume.name,
          ["persistentVolumeClaim"]: {
            diskType: volume.diskType,
            claimName: volume.claimName
          }
        })
      }
    })
  }

  syncTimeZoneWithNode(containerName) {
    const volumeMounts = {
      
      name: TENX_LOCAL_TIME_VOLUME.name,
      mountPath: TENX_LOCAL_TIME_VOLUME.hostPath.path,
      readOnly: true
    }
    // console.log(TENX_LOCAL_TIME_VOLUME)
    this.addContainerVolume.apply(this, [containerName, TENX_LOCAL_TIME_VOLUME, [volumeMounts]])
  }

  // ~ probe={port, path, initialDelaySeconds, timeoutSeconds, periodSeconds}
  setLivenessProbe(containerName, protocol, probe) {
    this.spec.template.spec.containers.map((container) => {
      if (container.name !== containerName) {
        return
      }
      const livenessProbe = {}
      if (protocol === 'HTTP') {
        livenessProbe.httpGet = {
          port: probe.port,
          path: probe.path
        }
      }
      if (protocol === 'TCP') {
        livenessProbe.tcpSocket = {
          port: probe.port
        }
      }
      livenessProbe.initialDelaySeconds = probe.initialDelaySeconds
      livenessProbe.timeoutSeconds = probe.timeoutSeconds
      livenessProbe.periodSeconds = probe.periodSeconds
      container.livenessProbe = livenessProbe
    })
  }

  setNodeSelector(hostname) {
    this.spec.template.spec.nodeSelector = {
      [K8S_NODE_SELECTOR_KEY]: hostname
    }
  }

  setLabelSelector(labels) {
     if (labels && labels.length && labels.length > 0) {
      this.spec.template.metadata.annotations = this.spec.template.metadata.annotations || {}
      this.spec.template.metadata.annotations["scheduler.alpha.kubernetes.io/affinity"] = this.makeNodeAffinity(labels)
    }
  }

  setCollectLog(serviceName, item) {
    this.spec.template.metadata.annotations = this.spec.template.metadata.annotations || {}
    let annotations = this.spec.template.metadata.annotations
    let volume = {
      name: item.name,
      emptyDir: {}
    }
    let volumeMounts = [{
      mountPath: item.path,
      name: item.name,
    }]
    // this.addContainerVolume(serviceName, volume, volumeMounts)
    if(!annotations["applogs"]){
     annotations["applogs"] = []
    } else {
      annotations["applogs"] = JSON.parse(annotations["applogs"] = [])
    }
    annotations["applogs"].push(item)
    annotations["applogs"] = JSON.stringify(annotations["applogs"])
  }

  makeNodeAffinity(labels) {
    const multiMap = {}
    labels.forEach(label => this.mergeLabelsToMultiMap(multiMap, label))
    return JSON.stringify({
      nodeAffinity: {
        requiredDuringSchedulingIgnoredDuringExecution: {
          nodeSelectorTerms: [
            {
              matchExpressions: Array.from(Object.getOwnPropertyNames(multiMap).map(
                key => this.multiMapEntryToMatchExpression(key, multiMap[key])))
            }
          ]
        }
      }
    })
  }

  mergeLabelsToMultiMap(multiMap, label) {
    const key = label.key
    const value = label.value
    if (multiMap.hasOwnProperty(key)) {
      multiMap[key].push(value)
    } else {
      multiMap[key] = [value]
    }
  }

  multiMapEntryToMatchExpression(key, values) {
    return {
      key,
      operator: "In",
      values,
    }
  }
}

module.exports = Deployment
