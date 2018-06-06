/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */
/**
 * Wechat QRCode Ticket - Standard
 * 微信登录 / 绑定微信账号
 *
 * v0.1 - 2017-01-12
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Popover, Spin, } from 'antd'
import './style/WechatQRCodeTicket.less'
import QRCodeContent from './QRCodeContent'

class WechatQRCodeTicket extends Component {
  constructor(props) {
    super(props)
    this.onVisibleChange = this.onVisibleChange.bind(this)
    this.state = {
      visible: false,
    }
  }

  onVisibleChange(visible) {
    this.setState({
      visible,
    })
  }
  render() {
    const { triggerElement, getTooltipContainer, message, onScanChange, style } = this.props
    const { visible } = this.state
    const wechatPopContent = (
      <QRCodeContent
        visible={visible}
        onVisibleChange={this.onVisibleChange}
        onScanChange={onScanChange}
        message={message}
        style={style} />
    )
    return (
      <Popover
        overlayClassName="wechatPop"
        placement="top"
        title={null}
        content={wechatPopContent}
        getTooltipContainer={getTooltipContainer}
        visible={visible}
        onVisibleChange={this.onVisibleChange}
        trigger="click">
        {triggerElement}
      </Popover>
    )
  }
}

WechatQRCodeTicket.propTypes = {
  QRCodeSize: PropTypes.number,
  triggerElement: PropTypes.element.isRequired,
  onScanChange: PropTypes.func.isRequired, // when user scan return ture
  getStatusDelay: PropTypes.number,
  getStatusMaxTimes: PropTypes.number,
  style: PropTypes.object,
  message: PropTypes.string,
  getTooltipContainer: PropTypes.func,
}

export default WechatQRCodeTicket
