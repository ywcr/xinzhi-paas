/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Index status
 *
 * v0.1 - 2016-11-08
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Progress, Icon, Tooltip } from 'antd'
import moment from 'moment'
import './style/TenxStatus.less'
import { FormattedMessage, defineMessages } from 'react-intl'
import isEqual from 'lodash/isEqual'

const PROGRESS_PHASES = [
  'Pending',
  'Terminating', 'Starting', 'Stopping',
  'Scaling', 'Restarting', 'Redeploying',
  'Rebuilding',
]
const locale = window.appLocale.locale
if (locale === 'zh') {
  moment.locale('zh-cn')
} else {
  moment.locale('en', {
    relativeTime: {
      future: "in %s",
      past: "%s ago",
      s: "%d s",
      m: "a min",
      mm: "%d min",
      h: "1 h",
      hh: "%d h",
      d: "a day",
      dd: "%d days",
      M: "a month",
      MM: "%d months",
      y: "a year",
      yy: "%d years"
    }
  })
}

const messages = defineMessages({
  Starting: {
    id: 'TenxStatus.Starting',
    defaultMessage: '正在启动',
  },
  Pending: {
    id: 'TenxStatus.Pending',
    defaultMessage: '正在启动',
  },
  Deploying: {
    id: 'TenxStatus.Deploying',
    defaultMessage: '正在启动',
  },
  Stopping: {
    id: 'TenxStatus.Stopping',
    defaultMessage: '正在停止',
  },
  Terminating: {
    id: 'TenxStatus.Terminating',
    defaultMessage: '正在删除',
  },
  Scaling: {
    id: 'TenxStatus.Scaling',
    defaultMessage: '正在水平扩展',
  },
  Restarting: {
    id: 'TenxStatus.Restarting',
    defaultMessage: '全部重启中',
  },
  Redeploying: {
    id: 'TenxStatus.Redeploying',
    defaultMessage: '正在重新部署',
  },
  Rebuilding: {
    id: 'TenxStatus.Rebuilding',
    defaultMessage: '正在重建',
  },
  Unknown: {
    id: 'TenxStatus.Unknown',
    defaultMessage: '状态不明',
  },
  Succeeded: {
    id: 'TenxStatus.Succeeded',
    defaultMessage: '已完成',
  },
  Stopped: {
    id: 'TenxStatus.Stopped',
    defaultMessage: '已停止',
  },
  Running: {
    id: 'TenxStatus.Running',
    defaultMessage: '运行中',
  },
  Abnormal: {
    id: 'TenxStatus.Abnormal',
    defaultMessage: '异常',
  },
  Failed: {
    id: 'TenxStatus.Failed',
    defaultMessage: '启动失败',
  },
  RunningMsg: {
    id: 'TenxStatus.RunningMsg',
    defaultMessage: '已运行',
  },
  SectionRunningMsg: {
    id: 'TenxStatus.SectionRunningMsg',
    defaultMessage: '部分运行',
  },
  AllRunningMsg: {
    id: 'TenxStatus.AllRunningMsg',
    defaultMessage: '全部运行',
  },
  StoppedMsg: {
    id: 'TenxStatus.StoppedMsg',
    defaultMessage: '全部停止',
  },
})

const exclamationIcon = (
  <Icon type="exclamation-circle-o" style={{ marginLeft: 5, color: 'orange' }} />
)

class TenxStatus extends Component {
  constructor(props) {
    super(props)
    this.setProgressPercent = this.setProgressPercent.bind(this)
    let percent = props.progress && props.progress.percent
      ? props.progress.percent
      : 5
    this.state = {
      percent
    }
  }

  componentWillReceiveProps(nextProps) {
    const { progress } = nextProps
    if (progress && progress.percent) {
      this.setState({
        percent: progress.percent
      })
    } else if (!isEqual(nextProps, this.props)) {
      this.setState({
        percent: 5
      })
    }
  }

  componentWillUnmount() {
    clearInterval(this.progressInterval)
    delete this.progressInterval
  }

  isProcess(props) {
    const {
      phase,
      progress,
    } = props
    if (progress && progress.status === false) {
      return false
    }
    if (progress || PROGRESS_PHASES.indexOf(phase) > -1) {
      return true
    }
    return false
  }

  setProgressPercent(percent) {
    this.progressInterval = setInterval(() => {
      if (percent >= 90) {
        clearInterval(this.progressInterval)
        delete this.progressInterval
        return
      }
      percent += 5
      this.setState({
        percent
      })
    }, 100)
  }

  getReplicasElement() {
    const { phase, status } = this.props
    if (!status || status.disableReplicasElement || this.isProcess(this.props)) {
      return
    }
    let replicasText
    const { availableReplicas, replicas, text } = status
    if (text) {
      replicasText = text
      if (availableReplicas < replicas) {
        replicasText = (
          <span>
            {text}{exclamationIcon}
          </span>
        )
      }
    } else if (availableReplicas === 0) {
      replicasText = (
        <span><FormattedMessage {...messages.StoppedMsg} /></span>
      )
    } else if (availableReplicas < replicas) {
      replicasText = (
        <span>
          <FormattedMessage {...messages.SectionRunningMsg} />
          {exclamationIcon}
        </span>
      )
    } else {
      replicasText = (
        <span><FormattedMessage {...messages.AllRunningMsg} /></span>
      )
    }
    return (
      <div>
        {`${availableReplicas}/${replicas} `}
        {replicasText}
      </div>
    )
  }

  getCreationTimestampElement() {
    const { phase, status, creationTimestamp } = this.props
    if (!creationTimestamp) {
      return
    }
    const date = new Date(creationTimestamp)
    if (phase === 'Succeeded') {
      return (
        <div>
          <FormattedMessage {...messages.Succeeded} /> {moment(date).fromNow()}
        </div>
      )
    }
    if (phase === 'Running') {
      return (
        <div>
          <FormattedMessage {...messages.RunningMsg} /> {moment().from(date, true)}
        </div>
      )
    }
    if (phase === 'Running') {
      return (
        <div>
          <FormattedMessage {...messages.RunningMsg} /> {moment().from(date, true)}
        </div>
      )
    }
    if (phase === 'Abnormal') {
      return (
        <div>
          {status.abnormalText}{exclamationIcon}
        </div>
      )
    }
    if (phase === 'Failed') {
      return (
        <div>
          {status.reason}<Tooltip title={status.message}>{exclamationIcon}</Tooltip>
        </div>
      )
    }
    return
  }

  render() {
    const {
      phase,
      progress,
      smart,
      deletionTimestamp,
    } = this.props
    const {
      percent
    } = this.state
    if (smart) {
      return (
        <span className="TenxStatus">
          <span className={phase}>
            <i className="fa fa-circle" /> <FormattedMessage {...messages[phase]} />
          </span>
        </span>
      )
    }
    let phaseElement = (
      <div>
        <i className="fa fa-circle" /> <FormattedMessage {...messages[phase]} />
      </div>
    )
    let progressElement
    if (this.isProcess(this.props)) {
      phaseElement = (
        <div>
          <FormattedMessage {...messages[phase]} />
        </div>
      )
      progressElement = (
        <Progress
          strokeWidth={8}
          showInfo={false}
          status="active"
          percent={percent} />
      )
      if (!this.progressInterval) {
        this.setProgressPercent(percent)
      }
    }
    return (
      <div className="TenxStatus">
        <div className={phase}>
          {phaseElement}
          {progressElement}
        </div>
        <div className="text">
          {this.getReplicasElement()}
          {this.getCreationTimestampElement()}
        </div>
      </div>
    )
  }
}

TenxStatus.propTypes = {
  smart: PropTypes.bool,
  phase: PropTypes.oneOf([
    'Starting', 'Pending', 'Deploying',
    'Stopping',
    'Terminating',
    'Scaling',
    'Restarting',
    'Redeploying', 'Rebuilding',
    'Unknown', 'Succeeded',
    'Stopped',
    'Running',
    'Abnormal',
  ]).isRequired,
  progress: PropTypes.shape({
    status: PropTypes.bool,
    percent: PropTypes.number,
  }),
  status: PropTypes.shape({
    replicas: PropTypes.number,
    availableReplicas: PropTypes.number,
    text: PropTypes.string,
  }),
  creationTimestamp: PropTypes.string,
}

TenxStatus.defaultProps = {
  //
};

export default TenxStatus