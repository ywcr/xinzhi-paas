/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Resource quota modal(cpu, memory)
 *
 * v0.1 - 2017-03-15
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Button, Icon, Row, Col, Progress } from 'antd'
import classNames from 'classnames'
import Modal from './Modal'
import './style/index.less'

export default class ResourceQuotaModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    useRestResource: PropTypes.func.isRequired,
    selectResource: PropTypes.object.isRequired,
    totalResource: PropTypes.object.isRequired,
  }

  static defaultProps = {
    selectResource: {
      cpu: 0,
      memory: 0,
    },
    usedResource: {
      cpu: 0,
      memory: 0,
    },
    totalResource: {
      cpu: 0,
      memory: 0,
    },
  }

  constructor(props) {
    super(props)
  }

  getPercentage(used, total) {
    const percent = Math.ceil(used / total * 100)
    if (isNaN(percent)) {
      return 0
    }
    return percent
  }

  render() {
    const {
      visible, closeModal, selectResource,
      usedResource, totalResource, closable
    } = this.props
    const usedCpu = usedResource.cpu
    const usedMemory = usedResource.memory
    const totalCpu = totalResource.cpu
    const totalMemory = totalResource.memory
    const usedCpuPercent = this.getPercentage(usedCpu, totalCpu)
    const usedMemoryPercent = this.getPercentage(usedMemory, totalMemory)
    const restCpu = Math.ceil((totalCpu - usedCpu) * 10) / 10
    const restMemory = Math.ceil((totalMemory - usedMemory) * 10) / 10
    return (
      <Modal
        visible={visible}
        closable={closable}
        closeModal={closeModal}
        content={(
          <div>
            <Row className="row">
              <Col span={6}>cpu</Col>
              <Col span={11} className="Progress">
                <Progress percent={usedCpuPercent} status="active" showInfo={false} />
              </Col>
              <Col span={7}>
                {usedCpu}/{totalCpu}核
                ({usedCpuPercent}%)
              </Col>
            </Row>
            <Row className="row">
              <Col span={6}>内存</Col>
              <Col span={11} className="Progress">
                <Progress percent={usedMemoryPercent} status="active" showInfo={false} />
              </Col>
              <Col span={7}>
                {usedMemory}/{totalMemory}GB
                ({usedMemoryPercent}%)
              </Col>
            </Row>
            <Row className="textRow">
              <Col span={6}>当前已选配置</Col>
              <Col span={18}>
                <span className={classNames({red: selectResource.cpu > restCpu})}>
                  {selectResource.cpu}核
                </span>
                &nbsp;|&nbsp;
                <span className={classNames({red: selectResource.memory > restMemory})}>
                  {selectResource.memory}GB
                </span>
              </Col>
            </Row>
            <Row className="textRow">
              <Col span={6}>剩余最大可选配置</Col>
              <Col span={18} className="restResources">
                {restCpu}核 | {restMemory}GB
              </Col>
            </Row>
          </div>
        )}
      >
      </Modal>
    )
  }
}