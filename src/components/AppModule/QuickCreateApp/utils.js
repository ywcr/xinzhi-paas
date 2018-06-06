/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Utilities functions for quick create app
 *
 * v0.1 - 2017-05-05
 * @author Zhangpc
 */

import Deployment from '../../../../kubernetes/objects/deployment'
import Service from '../../../../kubernetes/objects/service'
import { getResourceByMemory } from '../../../common/tools'
import {
  RESOURCES_DIY,
  SYSTEM_DEFAULT_SCHEDULE,
 } from '../../../constants'

export function getFieldsValues(fields) {
  const values = {}
  for (let key in fields) {
    if (fields.hasOwnProperty(key)) {
      values[key] = fields[key].value
    }
  }
  return values
}
export function genRandomString2(mytoken, len){
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
export function buildJson(fields, cluster, loginUser, imageConfigs) {
  const fieldsValues = getFieldsValues(fields)
  // 获取各字段值
  const {
    appName,
    serviceName, // 服务名称
    imageUrl, // 镜像地址
    imageTag, // 镜像版本
    bindNode, // 绑定节点
    bindNodeType,//绑定节点类型
    bindLabel,//主机标签绑定
    resourceType, // 容器配置
    isOld,//rbd||ping
    DIYMemory, // 自定义配置-内存
    DIYCPU, // 自定义配置-CPU
    serviceType, // 服务类型(有状态, 无状态)
    storageType, // 存储类型(rbd, hostPath)
    storageKeys, // 存储的 keys(数组)
    replicas, // 实例数量
    mountPaths, // 配置路径
    accessMethod, //访问方式
    publicNetwork, //公网出口
    internaletwork, //内网出口
    portsKeys, // 端口的 keys(数组)
    argsType,
    mountPathkey,
    hostPathkey,
    volumekey,
    command, // 进入点
    argsKeys, // 启动命令的 keys(数组)
    imagePullPolicy, // 重新部署时拉取镜像的方式(Always, IfNotPresent)
    timeZone, // 时区设置
    sourceType, // 日志采集-来源类型
    name, // 日志采集
    path, // 日志采集-日志目录
    inregex, // 日志采集-采集规则
    exregex, // 日志采集-排除规则
    livenessProtocol, // 高可用-协议类型
    livenessPort, // 高可用-端口
    livenessInitialDelaySeconds, // 高可用-首次检查延时
    livenessTimeoutSeconds, // 高可用-检查超时
    livenessPeriodSeconds, // 高可用-检查间隔
    livenessPath, // 高可用-Path 路径
    envKeys, // 环境变量的 keys(数组)
    configMapKeys, // 配置目录的 keys(数组)
  } = fieldsValues
  const MOUNT_PATH = 'mountPath' // 容器目录
  const VOLUME = 'volume' // 存储卷(rbd)
  const READ_ONLY = 'readOnly' // 只读(rbd)
  const HOST_PATH = 'hostPath' // 本地目录(hostPath)
  const PORT = 'port' // 端口
  const PORT_PROTOCOL = 'portProtocol' // 端口协议(HTTP, TCP)
  const MAPPING_PORTTYPE = 'mappingPortType' // 映射服务端口类型(auto, special)
  const MAPPING_PORT = 'mappingPort' // 映射服务端口
  const deployment = new Deployment(serviceName,)
  // 设置镜像地址
  deployment.addContainer(serviceName, `${imageUrl}:${imageTag}`, mountPaths?mountPaths:'')
  // 设置绑定节点
  if (bindNodeType == 'hostname') {
    if (bindNode !== SYSTEM_DEFAULT_SCHEDULE) {
      deployment.setNodeSelector(bindNode)
    }
  } else if (bindNodeType == 'hostlabel') {
    // 设置主机标签绑定节点
    deployment.setLabelSelector(bindLabel)
  }
  // 设置资源
  const { cpu, memory } = getResourceByMemory(resourceType, DIYMemory, DIYCPU)
  deployment.setContainerResources(serviceName, memory, cpu)
  // 服务类型&存储
  if (serviceType) {
    storageKeys.forEach(key => {
      // volume
      const volume = {
        name: `volume-${key}`
      }
      console.log(storageType,'------------storageType')
      let volumeInfo = fieldsValues[`${VOLUME}${key}`]
      if (storageType == 'rbd') {
        volumeInfo = volumeInfo.split('/')
        volume.claimName = volumeInfo[0]
        volume.fsType = volumeInfo[1]
        volume.size = volumeInfo[2]
        volume.isOld = volumeInfo[3]
        volume.diskType = volumeInfo[4]
      } else if (storageType == 'hostPath') {
        const hostPath = fieldsValues[`${HOST_PATH}${key}`]
        volume.hostPath = {
          path: hostPath,
        }
        volume.diskType = volumeInfo[4]
      }
      // volumeMounts
      const mountPath = fieldsValues[`${MOUNT_PATH}${key}`]
      const readOnly = fieldsValues[`${READ_ONLY}${key}`]
      const volumeMounts = [{
        mountPath,
        readOnly,
      }]
      deployment.addContainerVolume(serviceName, volume, volumeMounts)
    })
  }
  // 设置实例数量
  deployment.setReplicas(replicas)
  // 设置端口
  const service = new Service(serviceName, cluster)
  const { proxyType } = loginUser

  let groupID = publicNetwork || internaletwork || "none"
  service.addLBGroupAnnotation(groupID)
  portsKeys && portsKeys.forEach(key => {
    if (key.deleted) {
      return
    }
    const keyValue = key.value
    const name = `${serviceName}-${keyValue}`
    const port = fieldsValues[`${PORT}${keyValue}`]
    const portProtocol = fieldsValues[`${PORT_PROTOCOL}${keyValue}`]
    const mappingPort = fieldsValues[`${MAPPING_PORT}${keyValue}`]
    const mappingPortType = fieldsValues[`${MAPPING_PORTTYPE}${keyValue}`]
    service.addPort(proxyType, name, portProtocol, port, port, mappingPort)
    if (groupID !== 'none') {
      // No need to expose ports if network mode is 'none'
      if (mappingPortType === 'special') {
        service.addPortAnnotation(name, portProtocol, mappingPort)
      } else {
        service.addPortAnnotation(name, portProtocol)
      }
    }
    deployment.addContainerPort(serviceName, port, portProtocol)
  })
  // 设置进入点
  let {
    entrypoint,
  } = imageConfigs
  entrypoint = entrypoint && entrypoint.join(' ')
  if (command && command !== entrypoint) {
    deployment.addContainerCommand(serviceName, command)
  }
  // 设置启动命令
  if ((argsType && argsType !== 'default') && argsKeys) {
    const args = []
    argsKeys.forEach(key => {
      if (!key.deleted) {
        args.push(fieldsValues[`args${key.value}`])
      }
    })
    deployment.addContainerArgs(serviceName, args)
  }

  // 设置重新部署
  deployment.setContainerImagePullPolicy(serviceName, imagePullPolicy)
  // 设置时区
  if (timeZone) {
    deployment.syncTimeZoneWithNode(serviceName)
  }
  // 设置日志采集
  if (sourceType === 'directory') {
    let str = path
    if(path.substring(path.length-1,path.length) == '/'){
      str = path.substring(0,path.length-1)
    }
    let item = {
      path: str,
      inregex,
      exregex
    }
    if (name) {
      item.name = name
    } else {
      let name = 'volumename' + (Math.random() * 10000).toFixed(0)
      item.name = name
    }
    deployment.setCollectLog(serviceName, item)
  }
  // 设置高可用
  if (livenessProtocol === 'HTTP' || livenessProtocol === 'TCP') {
    deployment.setLivenessProbe(serviceName, livenessProtocol, {
      port: parseInt(livenessPort),
      path: livenessPath,
      initialDelaySeconds: parseInt(livenessInitialDelaySeconds),
      timeoutSeconds: parseInt(livenessTimeoutSeconds),
      periodSeconds: parseInt(livenessPeriodSeconds),
    })
  }
  // 设置环境变量
  if (envKeys) {
    envKeys.forEach(key => {
      if (!key.deleted) {
        const keyValue = key.value
        const envName = fieldsValues[`envName${keyValue}`]
        const envValue = fieldsValues[`envValue${keyValue}`]
        if (envName) {
          deployment.addContainerEnv(serviceName, envName, envValue)
        }
      }
    })
    deployment.addContainerEnv(serviceName, "APP_NAME", appName)
    deployment.addContainerEnv(serviceName, "SERVICE_NAME",serviceName)
  }

  // 设置配置目录
  if (configMapKeys) {
    configMapKeys.forEach(key => {
      if (!key.deleted) {
        const keyValue = key.value
        const configMapMountPath = fieldsValues[`configMapMountPath${keyValue}`]
        const configMapIsWholeDir = fieldsValues[`configMapIsWholeDir${keyValue}`]
        const configGroupName = fieldsValues[`configGroupName${keyValue}`]
        const configMapSubPathValues = fieldsValues[`configMapSubPathValues${keyValue}`]
        const volume = {
          name: `configmap-volume-${keyValue}`,
          configMap: {
            name: configGroupName,
            items: configMapSubPathValues.map(value => {
              return {
                key: value,
                path: value,
              }
            })
          }
        }
        let volumeMounts = []
        if (configMapIsWholeDir) {
          volumeMounts.push({
            mountPath: configMapMountPath,
          })
        } else {
          configMapSubPathValues.map(value => {
            volumeMounts.push({
              name: `configmap-volume-${keyValue}`,
              mountPath: configMapMountPath + '/' + value,
              subPath: value,
            })
          })
        }
        deployment.addContainerVolume(serviceName, volume, volumeMounts, configMapIsWholeDir)
      }
    })
  }

  return { deployment, service }
}