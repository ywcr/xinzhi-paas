/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/2
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Icon, } from 'antd'
import './style/API.less'
import { connect } from 'react-redux'
import { loadApiInfo } from '../../../actions/open_api'
import Title from '../../Title'

class API extends Component{
  constructor(props){
    super(props)
    this.handleHidToken = this.handleHidToken.bind(this)
    this.state = {
      hidToken: 'password'
    }
  }
  handleHidToken(){
    const { hidToken } = this.state
    if(hidToken === 'password'){
      this.setState({
        hidToken: 'text'
      })
    } else {
      this.setState({
        hidToken: 'password'
      })
    }
  }
  componentDidMount() {
    this.props.loadApiInfo()
  }
  render(){
    const {username, token} = this.props
    const { hidToken } = this.state
    return (
      <div id='API'>
        <Title title="开放 API" />
        <Row className="APITitle">新智云开放 API</Row>
        <Row className="APIInfo">以下是用于访问 EnnCloud 开放 API 的 token 信息及相关文档</Row>
        <table className="APITable">
          <tbody>
            <tr>
              <td className="tableTitle">用户名</td>
              <td>{username}</td>
            </tr>
            <tr>
              <td className="tableTitle">
                <span style={{marginRight: 10}}>Token</span>
              </td>
              <td>
                <input type={hidToken} value={token} className="tokenInt" disabled/>
                <Icon type="eye" onClick={this.handleHidToken}
                      className={hidToken === 'text'? 'hidToken' : ''}/>
              </td>
            </tr>
            <tr>
              <td className="tableTitle">API 文档</td>
              <td>
                <a href="http://docs.paas.enncloud.cn/api" target="_blank">打开帮助文档</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

function mapStateToProp(state) {
  const result = state.openApi.result || {
    username: "",
    token: "",
  }
  return result
}

export default connect(mapStateToProp, {
  loadApiInfo,
})(API)