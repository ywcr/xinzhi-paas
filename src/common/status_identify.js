/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Status identify tools
 * v0.1 - 2016-11-21
 * @author Zhangpc
 */
import { TENX_MARK } from '../constants'
const CONTAINER_MAX_RESTART_COUNT = 5
/**
 * Get container status
 * return one of [Pending, Running, Terminating, Failed, Unknown, Abnormal]
 */
export function getContainerStatus(container) {
  const { status, metadata } = container
  const { deletionTimestamp } = metadata
  if (deletionTimestamp) {
    status.phase = 'Terminating'
  }
  const { conditions, containerStatuses } = status
  let restartCount = 0
  let phase = status.phase
  if (conditions) {
    conditions.every(condition => {
      if (condition.type !== 'Ready' && condition.status !== 'True') {
        phase = 'Pending'
        return false
      }
      return true
    })
  }
  if (containerStatuses) {
    containerStatuses.map(containerStatus => {
      // const { ready } = containerStatus
      const containerRestartCount = containerStatus.restartCount
      if (containerRestartCount > restartCount) {
        restartCount = containerRestartCount
        if (!containerStatus.state || !containerStatus.state.running) {
          // state 不存在或 state 不为 running
          phase = 'Abnormal'
        }
      }
    })
    if (restartCount >= CONTAINER_MAX_RESTART_COUNT) {
      status.phase = phase
      status.restartCount = restartCount
    }
  }
  return status
}

/**
 * Get service status
 * return one of [Pending, Running, Deploying, Stopped]
 */
export function getServiceStatus(service) {
  const { status, metadata } = service
  const specReplicas = service.spec.replicas
  let replicas = specReplicas
  if (replicas === undefined) {
    replicas = metadata.annotations[`${TENX_MARK}/replicas`]
  }
  let availableReplicas = 0
  if (!status) {
    return {
      phase: 'Stopped',
      availableReplicas: 0,
      replicas
    }
  }
  availableReplicas = status.availableReplicas || 0
  status.availableReplicas = availableReplicas
  let {
    phase,
    updatedReplicas,
    unavailableReplicas,
    observedGeneration,
  } = status
  if (!metadata.annotations) {
    metadata.annotations = {}
  }
  status.replicas = replicas
  if (phase && phase !== 'Running') {
    return status
  }
  if (unavailableReplicas > 0 && (!availableReplicas || availableReplicas < replicas)) {
    status.phase = 'Pending'
  } else if (observedGeneration >= metadata.generation && replicas === updatedReplicas && replicas > 0) {
    status.availableReplicas = updatedReplicas
    status.phase = 'Running'
  } else if (updatedReplicas && unavailableReplicas) {
    status.phase = 'Deploying'
    status.progress = { status: false }
  } else if (availableReplicas < 1) {
    status.phase = 'Stopped'
  } else {
    status.phase = 'Running'
  }
  // For issue #CRYSTAL-2478
  // Add spec.replicas analyzing conditions
  if (specReplicas === 0 && availableReplicas > 0) {
    status.phase = 'Stopping'
  } else if (specReplicas > 0 && availableReplicas < 1) {
    status.unavailableReplicas = specReplicas
    status.phase = 'Pending'
  }
  return status
}

/**
 * Get service status by containers
 * return one of [Pending, Running, Deploying, Stopped]
 */
export function getServiceStatusByContainers(service, containers) {
  if (!containers || containers.length <= 0) {
    return getServiceStatus(service)
  }
  let availableReplicas = 0
  containers.map(container => {
    let { phase } = getContainerStatus(container)
    if (phase === 'Running') {
      availableReplicas++
    }
  })
  if (!service.status) {
    service.status = {}
  } else {
    delete service.status.phase
  }
  service.status.availableReplicas = availableReplicas
  return getServiceStatus(service)
}

/**
 * Get app status by services list
 * return one of [Running, Pending, Stopped, Unknown]
 */
export function getAppStatus(services) {
  const appStatus = {
    replicas: services.length,
    availableReplicas: 0,
    unavailableReplicas: 0,
  }
  services.map(service => {
    let serviceStatus = getServiceStatus(service)
    let { availableReplicas, unavailableReplicas } = serviceStatus
    if (availableReplicas > 0) {
      appStatus.availableReplicas++
    }
    if (unavailableReplicas > 0) {
      appStatus.unavailableReplicas++
    }
  })
  let { availableReplicas, unavailableReplicas } = appStatus
  if (availableReplicas === 0 && unavailableReplicas > 0) {
    appStatus.phase = 'Pending'
  } else if (availableReplicas === 0) {
    appStatus.phase = 'Stopped'
  } else if (availableReplicas > 0) {
    appStatus.phase = 'Running'
  } else {
    appStatus.phase = 'Unknown'
  }
  return appStatus
}