/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Container class for k8s
 *
 * v0.1 - 2016-10-11
 * @author Zhangpc
 */
'use strict'

class Container {
  constructor(name, image,mountPath,stackDetail,storageSize,type) {
    this.name = type?name+type:name
    this.image = image
    this.ports = []
    this.env = []
    if(stackDetail&&type==1){
      this.volumeMounts = [{
        mountPath: stackDetail.volumePath.indexOf('=')=='-1'?stackDetail.volumePath:stackDetail.volumePath.split('=')[0],
        name: 'datadir'
      },{
        mountPath: stackDetail.mountPath,
        name: name      
      }]
      this.command = stackDetail.command?JSON.parse(stackDetail.command):'' //["sh","-c",`/usr/local/bin/etcd --config-file ${stackDetail.mountPath.charAt(stackDetail.mountPath.length - 1)=='/'?stackDetail.mountPath+stackDetail.configName:stackDetail.mountPath+'/'+stackDetail.configName}`]
      this.resources = {
        limits: {
          memory: "256Mi"
        },
        requests: {
          memory: "256Mi"
        }
      }
      this.env.push({
        name: 'CPU_LIMIT',
        valueFrom:{
          resourceFieldRef:{
            containerName: type?name+type:name,
            resource: 'limits.cpu'
          }
        }
      },{
        name: 'MEM_LIMIT',
        valueFrom:{
          resourceFieldRef:{
            containerName: type?name+type:name ,
            resource: 'limits.memory'
          }
        }
      })
    }else if(stackDetail&&type==0){
      this.env.push({
        name: 'CONFIG_FILE_PATH',
        value: stackDetail.mountPath.charAt(stackDetail.mountPath.length - 1)=='/'?stackDetail.mountPath+stackDetail.configName:stackDetail.mountPath+'/'+stackDetail.configName
      },{
        name: 'CONFIG_FILE_PATH_TMP',//-----
        value: "/tmp/"+stackDetail.configName
      },{
        name: 'CPU_LIMIT',
        valueFrom:{
          resourceFieldRef:{
            containerName: type?name+type:name,
            resource: 'limits.cpu'
          }
        }
      },{
        name: 'MEM_LIMIT',
        valueFrom:{
          resourceFieldRef:{
            containerName: type?name+type:name ,
            resource: 'limits.memory'
          }
        }
      })
      this.ports = [
        {
          containerPort: 8888,
          name: "server-conf",
          protocol: "TCP"
        }
      ]
      this.volumeMounts = [{
        mountPath: '/tmp/',
        name: name+"-configtmp"
      },{
        mountPath: stackDetail.mountPath,
        name: name
      }]
    }else{
      mountPath?this.mountPath = mountPath:''
      this.resources = {
        limits: {
          memory: "256Mi"
        },
        requests: {
          memory: "256Mi"
        }
      }
      this.env.push({
        name: 'CPU_LIMIT',
        valueFrom:{
          resourceFieldRef:{
            containerName: type?name+type:name,
            resource: 'limits.cpu'
          }
        }
      },{
        name: 'MEM_LIMIT',
        valueFrom:{
          resourceFieldRef:{
            containerName: type?name+type:name ,
            resource: 'limits.memory'
          }
        }
      })
    }
    
    
  }
}

module.exports = Container