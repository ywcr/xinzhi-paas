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

export default class Storage extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    storageResource: PropTypes.func.isRequired,
  }

  static defaultProps = {
    storageResource: {
      select: 0, // MB
      allocated: 0, // MB
      unallocated: 0, // MB
      total: 0 // MB
    }
  }

  constructor(props) {
    super(props)
  }

  getPercentage(allocated, total) {
    const percent = Math.ceil(allocated * 100 / total)
    if (isNaN(percent)) {
      return 0
    }
    return percent
  }

  render() {
    const {
      visible, closeModal, storageResource,
      closable
    } = this.props
    const { select, allocated, unallocated, total } = storageResource || {}
    const allocatedPercent = this.getPercentage(allocated, total)

    return (
      <Modal
        visible={visible}
        closable={closable}
        closeModal={closeModal}
        content={(
          <div>
            <Row className="row">
              <Col span={6}>存储</Col>
              <Col span={11} className="Progress">
                <Progress percent={allocatedPercent} status="active" showInfo={false} />
              </Col>
              <Col span={7}>
                {allocated}/{total}GB
                ({allocatedPercent}%)
              </Col>
            </Row>
            <Row className="textRow">
              <Col span={6}>当前已选择大小</Col>
              <Col span={18}>
                <span className={classNames({red: select > unallocated})}>
                  {select}GB
                </span>
              </Col>
            </Row>
            <Row className="textRow">
              <Col span={6}>剩余最大可选配置</Col>
              <Col span={18} className="restResources">
                {unallocated}GB
              </Col>
            </Row>
          </div>
        )}
      >
      </Modal>
    )
  }
}