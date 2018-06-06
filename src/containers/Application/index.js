/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppContainer component
 *
 * v0.1 - 2016-09-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import SecondSider from '../../components/SecondSider'
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/Application.less'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
let menuList = []

const menuList_standard  = [
  {
    url: '/app_manage',
    name: '应用'
  },
  {
    url: '/app_manage/service',
    name: '服务'
  },
  {
    url: '/app_manage/container',
    name: '容器'
  },
  {
    url: '/app_manage/storage',
    name: '存储'
  },
  {
    url: '/app_manage/configs',
    name: '服务配置'
  }
]

const menuList_enterprise = [
  {
    url: '/app_manage',
    name: '应用'
  },
  {
    url: '/app_manage/service',
    name: '服务'
  },
  {
    url: '/app_manage/container',
    name: '容器'
  },
  {
    url: '/app_manage/storage',
    name: '存储'
  },
  {
    url: '/app_manage/snapshot',
    name: '快照'
  },
  {
    url: '/app_manage/configs',
    name: '服务配置'
  },
  {
    url: '/app_manage/network_isolation',
    name: '网络隔离'
  },
]

export default class Application extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSiderStyle: 'normal'
    }
  }
  render() {
    const { children } = this.props
    const scope = this
    let menuList = menuList_standard
    if(mode != standard){
      menuList = menuList_enterprise
    }
    return (
      <div id="Application">
        <QueueAnim
          className="appSiderAnimate"
          key="appSiderAnimate"
          type="left"
          >
          <div className={ this.state.containerSiderStyle == 'normal' ? 'appMenu CommonSecondMenu' : 'hiddenMenu appMenu CommonSecondMenu'} key="appSider">
            <SecondSider menuList={menuList} scope={scope} />
          </div>
        </QueueAnim>
        <div className={ this.state.containerSiderStyle == 'normal' ? 'appContent CommonSecondContent' : 'hiddenContent appContent CommonSecondContent' } >
          {children}
        </div>
      </div>
    )
  }
}

Application.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}