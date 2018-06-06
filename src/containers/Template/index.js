/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/* Login page for enterprise
 *
 * v0.1 - 2016-11-16
 * @author Zhangpc
 */
import React, { Component } from 'react'
import { Spin, Icon } from 'antd'
import Top from '../../components/Top'
import { connect } from 'react-redux'
import { STANDARD_MODE } from '../../../configs/constants'
import { mode } from '../../../configs/model'
import './style/Template.less'
import { invitations } from '../../actions/alert'
import imgSuccess from '../../assets/img/wancheng.png'

let divId = 'LoginBg'

if (mode == STANDARD_MODE) {
  // standard mode
  divId = 'LoginBgStd'
}


class Template extends Component {
  constructor(props) {
    super(props)
    this.state = {
      error: false
    }
  }
  componentWillMount() {
    const search = location.search.slice(1)
    let body = search.split('code=')[1]
    if (search == '', !body) return
    this.props.invitations(search, {
      success: {
        func: (ret) => {
          if (ret.statusCode != 200 || ret.code != 200) {
            this.setState({ error: true })
          }
        }
      },
      failed: {
        func: (ret) => {
          this.setState({ error: true })
        }
      }
    })
  }
  render() {
    const { isFetching } = this.props
    if (isFetching) {
      return (
        <div id={divId} className="joincode">
          <Top />
          <div className='loadingBox' style={{color:'#eee'}}><Spin size='large'/> </div>
        </div>
      )
    }
    return (
      <div id={divId} className="joincode">
        <Top />
        {this.state.error ?
          <div className='status'>
            <div className="icon failed">
              <Icon type="cross-circle-o" className='failedIcon'/>
            </div>
            <div className="text">
              <div>邮箱验证失败</div>
              <div>请稍后<span onClick={() => window.location.reload()} className='retry'>重试</span></div>
            </div>
          </div>
          :
          <div className='status'>
            <div className="icon success">
              <img src={imgSuccess} />
            </div>
            <div className="text">
              <div>邮箱验证成功</div>
              <div>此邮箱已加入告警通知组</div>
            </div>
          </div>
        }
      </div>
    )
  }
}

function mapStateToProps(state, props) {

  if (Object.keys(state.alert).length == 0) {
    return props
  }
  const { invitations } = state.alert
  const { isFetching } = invitations
  return {
    isFetching,
  }
}

export default connect(mapStateToProps, {
  invitations
})(Template)
