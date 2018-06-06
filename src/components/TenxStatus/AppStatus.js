/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * App status
 *
 * v0.1 - 2016-11-10
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import TenxStatus from './'
import { injectIntl, defineMessages } from 'react-intl'
import { getAppStatus } from '../../common/status_identify'

const messages = defineMessages({
  AppReplicasMsg: {
    id: 'TenxStatus.AppReplicasMsg',
    defaultMessage: '共{total}个服务',
  }
})

class AppStatus extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { app, smart, intl } = this.props
    let { status, services } = app
    const { formatMessage } = intl
    if (!status) {
      status = getAppStatus(services)
    }
    status.text = `${formatMessage(messages.AppReplicasMsg, { total: services.length + '' })}`
    return (
      <TenxStatus
        phase={status.phase}
        status={status}
        smart={smart} />
    )
  }
}

AppStatus.propTypes = {
  app: PropTypes.object.isRequired,
  smart: PropTypes.bool,
}

export default injectIntl(AppStatus, {
  withRef: true,
})