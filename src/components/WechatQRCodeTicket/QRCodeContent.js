/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * QRCode content
 *
 * v0.1 - 2017-02-07
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import QRCode from 'qrcode.react'
import { getWechatAuthQrCode, getWechatAuthQrCodeStatus } from '../../actions/user_3rd_account'
import { Popover, Spin, } from 'antd'
import './style/QRCodeContent.less'

class QRCodeContent extends Component {
  constructor(props) {
    super(props)
    this.clearAllTimeout = this.clearAllTimeout.bind(this)
    this.clearGetAuthQrCodeStatusTimeout = this.clearGetAuthQrCodeStatusTimeout.bind(this)
    this.setTimeOutGetAuthQrCode = this.setTimeOutGetAuthQrCode.bind(this)
    this.setTimeOutGetAuthQrCodeStatus = this.setTimeOutGetAuthQrCodeStatus.bind(this)
    this.state = {
      wechat_auth_url: '',
    }
  }

  clearAllTimeout() {
    clearTimeout(this.getAuthQrCodeTimeout)
    this.clearGetAuthQrCodeStatusTimeout()
  }

  clearGetAuthQrCodeStatusTimeout() {
    clearTimeout(this.getAuthQrCodeStatusTimeout)
    this.getStatusTimes = 0
  }

  componentWillMount() {
    this.setTimeOutGetAuthQrCode()
  }

  componentWillReceiveProps(nextProps) {
    const { wechat_auth_url } = this.state
    const { visible } = nextProps
    if (visible !== this.props.visible) {
      if(!visible) {
        this.clearAllTimeout()
        return
      }
      this.setTimeOutGetAuthQrCode()
    }
  }

  componentWillUnmount() {
    this.clearAllTimeout()
  }

  setTimeOutGetAuthQrCode() {
    const { getWechatAuthQrCode } = this.props
    getWechatAuthQrCode().then(({ response, type }) => {
      this.clearGetAuthQrCodeStatusTimeout()
      const { expireSeconds, url } = response.result
      this.setState({
        wechat_auth_url: url,
      })
      // Get wechat auth status
      this.setTimeOutGetAuthQrCodeStatus()
      // When url expired load again
      const timeout = expireSeconds * 1000
      this.getAuthQrCodeTimeout = setTimeout(this.setTimeOutGetAuthQrCode, timeout)
      // When url expired set url in state to empty
      setTimeout(() => {
        this.setState({
          wechat_auth_url: '',
        })
      }, timeout)
    }).catch(err => {
      // Must catch err here, response may be null
      clearTimeout(this.getAuthQrCodeTimeout)
    })
  }

  setTimeOutGetAuthQrCodeStatus() {
    const {
      onVisibleChange,
      getWechatAuthQrCodeStatus,
      getStatusDelay,
      onScanChange,
      getStatusMaxTimes,
      action,
    } = this.props
    if (this.getStatusTimes >= getStatusMaxTimes) {
      onVisibleChange(false)
      this.setState({
        wechat_auth_url: '',
      })
      this.clearAllTimeout()
      return
    }
    this.getStatusTimes ++
    getWechatAuthQrCodeStatus({action}).then(({ response, type }) => {
      const { status, message } = response.result
      if (message === 'scan' || message === 'subscribe') {
        onScanChange(true, response.result)
        onVisibleChange(false)
        this.setState({
          wechat_auth_url: '',
        })
        this.clearAllTimeout()
        return
      }
      this.getAuthQrCodeStatusTimeout = setTimeout(this.setTimeOutGetAuthQrCodeStatus, getStatusDelay)
    }).catch(err => {
      // Must catch err here, response may be null
      this.clearGetAuthQrCodeStatusTimeout()
    })
  }

  render() {
    const { message, QRCodeSize, style } = this.props
    const { wechat_auth_url } = this.state
    return (
      <div className="wechatPopContent" style={style}>
      {
        wechat_auth_url
        ? <div>
            <div className="qrCode">
              <QRCode value={wechat_auth_url} size={QRCodeSize} />
            </div>
            <div className="desc">{message}</div>
          </div>
        : <div className="qrCodeLoading"><Spin /></div>
      }
      </div>
    )
  }
}

QRCodeContent.propTypes = {
  visible: PropTypes.bool.isRequired,
  QRCodeSize: PropTypes.number.isRequired,
  onVisibleChange: PropTypes.func,
  onScanChange: PropTypes.func.isRequired, // when user scan return ture
  getStatusDelay: PropTypes.number.isRequired,
  getStatusMaxTimes: PropTypes.number.isRequired,
  action: PropTypes.string.isRequired, // 'login' || 'signup'
  style: PropTypes.object,
  message: PropTypes.string,
}

QRCodeContent.defaultProps = {
  QRCodeSize: 110,
  getStatusDelay: 1500,
  getStatusMaxTimes: 60,
  style: {
    height: '160px'
  },
  action: 'login',
}

function mapStateToProps(state, props) {
  return {
    //
  }
}

export default connect(mapStateToProps, {
  getWechatAuthQrCode,
  getWechatAuthQrCodeStatus,
})(QRCodeContent)