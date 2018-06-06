'use strict'

const should = require('should')
const assert = require('assert')
const Deployment = require('../../../kubernetes/objects/deployment') 

describe('deployment test', function () {
  this.timeout(1 * 1000)
  let deployment
  beforeEach(function() {
    deployment = new Deployment('test')
  })
  it('should complete a deployment', function (done) {
    deployment.setReplicas(2)
    deployment.addContainer('test', 'zhangpc/hello:latest')
    deployment.setContainerResources('test', '512Mi')
    deployment.addContainerPort('test', 5000, 'HTTP')
    deployment.addContainerEnv('test', 'NODE_ENV', 'production')
    deployment.addContainerArgs('test', '/run.sh')
    deployment.addContainerCommand('test', 'node')
    deployment.setContainerImagePullPolicy('test')
    deployment.syncTimeZoneWithNode('test')
    deployment.addContainerVolume('test', {
      name: 'volume-normal',
      fsType: 'ext4',
      image: 'test-volume'
    }, {
      mountPath: '/test/mount',
      readOnly:true
    })
    deployment.addContainerVolume(
      'test', 
      {
        name: 'volume-configMap',
        configMap: {
          items: [
            {
              "key": "hosts",
              "path": "hosts"
            },
            {
              "key": "hosts2",
              "path": "hosts2"
            }
          ]
        }
      }, 
      {
        mountPath: '/test/mount',
        readOnly:true
      }
    )
    deployment.setLivenessProbe('test', 'HTTP', {
      port: 3000,
      path: '/health',
      initialDelaySeconds: 2,
      timeoutSeconds: 3,
      periodSeconds: 5
    })
    done()
  })
})