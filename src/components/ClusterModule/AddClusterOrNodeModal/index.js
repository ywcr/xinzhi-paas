/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * Add Cluster Or Node Modal
 *
 * v0.1 - 2017-03-07
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { Modal, Tooltip, Icon, Spin } from 'antd'
import Content from './Content'
import './style/AddClusterOrNodeModal.less'

class AddClusterOrNodeModal extends Component {
  constructor(props) {
    super(props)
    this.copyCMD = this.copyCMD.bind(this)
    this.state = {
      copyCMDSuccess: false,
    }
  }

  copyCMD() {
    //this function for user click the copy btn and copy the download code
    const code = document.getElementById('addClusterOrNodeCMDInput')
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyCMDSuccess: true,
    })
  }

  render() {
    const { title, visible, closeModal, CMD, bottomContent } = this.props
    const { copyCMDSuccess } = this.state
    return (
      <Modal
        title={title}
        className='AddClusterOrNodeModal'
        visible={visible}
        onOk={closeModal}
        onCancel={closeModal}>
        <Content CMD={CMD} bottomContent={bottomContent}/>
      </Modal>
    )
  }
}

AddClusterOrNodeModal.propTypes = {
  title: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  CMD: PropTypes.string,
  bottomContent: PropTypes.element,
}

AddClusterOrNodeModal.defaultProps = {
  //
}

export default AddClusterOrNodeModal