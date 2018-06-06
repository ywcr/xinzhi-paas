/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/31
 * @author ZhaoXueYu
 */
import React, { Component, PropTypes } from 'react'
import { Breadcrumb } from 'antd'
import SecondSider from '../../components/SecondSider'
import QueueAnim from 'rc-queue-anim'
import './style/setting.less'
import { ROLE_USER, ROLE_SYS_ADMIN } from '../../../constants'
import { connect } from 'react-redux'

const menuList_normal = [
  {
    url: '/setting/version',
    name: '平台版本'
  },
//{
//  url: '/setting/API',
//  name: '开放 API'
//},
]

const menuList_sysAdmin = [
  {
    url: '/setting/version',
    name: '平台版本'
  },
  // {
  //   url: '/setting/license',
  //   name: '授权管理'
  // },
//{
//  url: '/setting/API',
//  name: '开放 API'
//},
  {
    url: '/setting/globalConfig',
    name: '全局配置'
  },{
    url: '/setting/advancedSetting',
    name: '高级设置'
  },{
    url:'/setting/personalized',
    name:'个性外观'
  }
]

class Setting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSiderStyle: 'normal'
    }
  }

  render() {
    const { children, role } = this.props
    const scope = this
    const menuList = (role == ROLE_SYS_ADMIN ? menuList_sysAdmin : menuList_normal)
    return (
      <div id="Setting">
        <QueueAnim
          className="settingAnimate"
          key="settingAnimate"
          type="left"
        >
          <div className={this.state.containerSiderStyle == 'normal' ? 'settingMenu CommonSecondMenu' : 'hiddenMenu settingMenu CommonSecondMenu'} key='settingSider'>
            <SecondSider menuList={menuList} scope={scope} />
          </div>
        </QueueAnim>
        <div className={this.state.containerSiderStyle == 'normal' ? 'settingContent CommonSecondContent' : 'hiddenContent settingContent CommonSecondContent'} >
          {children}
        </div>
      </div>
    )
  }
}

Setting.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}

function mapStateToProp(state) {
  let role = ROLE_USER
  const { entities } = state
  if (entities && entities.loginUser && entities.loginUser.info && entities.loginUser.info) {
    role = entities.loginUser.info.role
  }
  return {
    role
  }
}

export default connect(mapStateToProp, {
})(Setting)