/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux main app file - Standard
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Sider from '../../../components/Sider/Standard'
import App from '../'
import UpgradeModal from '../../../components/AccountModal/Version/UpgradeModal'

class StandardApp extends Component {
  constructor(props) {
    super(props)
    this.changeSiderStyle = this.changeSiderStyle.bind(this)
    this.state = {
      siderStyle: 'mini'
    }
  }
  changeSiderStyle() {
    //this function for user change the sider style to 'mini' or 'bigger'
    const { siderStyle } = this.state
    if (siderStyle == 'mini') {
      this.setState({
        siderStyle: 'bigger'
      })
    } else {
      this.setState({
        siderStyle: 'mini'
      })
    }
  }
  render() {
    return (
      <App
       siderStyle={this.state.siderStyle}
       Sider={Sider}
       changeSiderStyle={this.changeSiderStyle}
       UpgradeModal={UpgradeModal}
       {...this.props} />
    )
  }
}

// For transfer redux props to App component
function mapStateToProps(state, props) {
  return props
}

export default connect(mapStateToProps, {
  //
})(StandardApp)
