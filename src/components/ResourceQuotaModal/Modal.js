/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Resource quota modal
 *
 * v0.1 - 2017-03-15
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Modal, Button, Icon } from 'antd'
import classNames from 'classnames'
import './style/index.less'

export default class ResourceQuotaModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    content: PropTypes.element.isRequired,
    // usedResource: PropTypes.object.isRequired,
    closable: PropTypes.bool,
  }

  static defaultProps = {
    visible: true,
    closable: true,
  }

  constructor(props) {
    super(props)
    // this.useRestResource = this.useRestResource.bind(this)
  }

  /*useRestResource(cpu, memory) {
    const { closeModal, useRestResource } = this.props
    closeModal()
    useRestResource({cpu, memory})
  }*/

  render() {
    const {
      visible, closeModal, closable,
      content
    } = this.props
    return (
      <Modal
        title="资源不足提醒"
        visible={visible}
        closable={closable}
        footer={[
          <Button key="back" type="primary" size="large" onClick={closeModal}>
            确定
          </Button>
        ]}
        wrapClassName="wrapResourceQuotaModal"
        className="ResourceQuotaModal"
        onCancel={closeModal}
        maskClosable={false}>
        <div className="tips">
          <Icon type="exclamation-circle-o" className="exclamationIcon" />
          注意：当前集群内资源不足
        </div>
        {content}
      </Modal>
    )
  }
}