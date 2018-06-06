/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Container status
 *
 * v0.1 - 2016-11-08
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import TenxStatus from './'
import { getContainerStatus } from '../../common/status_identify'
import { injectIntl, defineMessages } from 'react-intl'

const messages = defineMessages({
  ContainerAbnormalMsg: {
    id: 'TenxStatus.ContainerAbnormalMsg',
    defaultMessage: '已重启 {restartCount} 次',
  }
})

class ContainerStatus extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { container, smart, intl } = this.props
    const { formatMessage } = intl
    const { metadata } = container
    const { creationTimestamp } = metadata
    const status = getContainerStatus(container)
    let { phase, progress, restartCount } = getContainerStatus(container)
    if (phase === 'Abnormal') {
      status.abnormalText = `${formatMessage(messages.ContainerAbnormalMsg, { restartCount })}`
    }
    status.disableReplicasElement = true
    return (
      <TenxStatus
        phase={phase}
        progress={progress}
        status={status}
        creationTimestamp={creationTimestamp}
        smart={smart} />
    )
  }
}

ContainerStatus.propTypes = {
  container: PropTypes.object.isRequired,
  smart: PropTypes.bool,
}

export default injectIntl(ContainerStatus, {
  withRef: true,
})