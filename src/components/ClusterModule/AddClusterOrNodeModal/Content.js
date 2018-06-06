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
import { Tooltip, Icon, Spin } from 'antd'
import { genRandomString } from '../../../common/tools'
import './style/Content.less'

class AddClusterOrNodeModalContent extends Component {
  constructor(props) {
    super(props)
    this.copyCMD = this.copyCMD.bind(this)
    this.state = {
      copyCMDSuccess: false,
      inputId: `addClusterOrNodeCMDInput${genRandomString('0123456789', 4)}`
    }
  }

  copyCMD() {
    //this function for user click the copy btn and copy the download code
    const code = document.getElementById(this.state.inputId)
    code.select()
    document.execCommand('Copy', false)
    this.setState({
      copyCMDSuccess: true,
    })
  }

  render() {
    const { CMD, bottomContent } = this.props
    const { copyCMDSuccess } = this.state
    return (
      <div id="AddClusterOrNodeModalContent">
        <div style={{paddingBottom: '15px'}}>
          1. 先根据您的操作系统安装最新版本 Docker
          （<a target="_blank" href="https://docs.docker.com/engine/installation/linux/">如何在Linux安装Docker</a>）
        </div>
        <div>
          2. 请在安装好 Docker 的主机上执行以下命令：
          <pre>
            {CMD ? CMD : <div className="loadingBox"><Spin /></div>}&nbsp;&nbsp;
            {
              CMD &&
              [<Tooltip title={copyCMDSuccess ? '复制成功' : '点击复制'}>
                <a className={copyCMDSuccess ? "actions copyBtn" : "copyBtn"}
                  onClick={this.copyCMD}
                  onMouseLeave={() => setTimeout(() => this.setState({copyCMDSuccess: false}), 500) }>
                  <Icon type="copy" />
                </a>
              </Tooltip>,
              <input id={this.state.inputId} style={{ position: "absolute", opacity: "0", top:'0'}} value={CMD} />]
            }
          </pre>
        </div>
        {bottomContent}
      </div>
    )
  }
}

AddClusterOrNodeModalContent.propTypes = {
  CMD: PropTypes.string,
  bottomContent: PropTypes.element,
}

AddClusterOrNodeModalContent.defaultProps = {
  //
}

export default AddClusterOrNodeModalContent