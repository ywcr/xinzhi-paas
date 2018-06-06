/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Manage and Monitor component
 *
 * v0.1 - 2016-11-01
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Breadcrumb } from 'antd'
import SecondSider from '../../components/SecondSider'
import IntlExp from '../../components/IntlExp'
import QueueAnim from 'rc-queue-anim'
import './style/ManageMonitor.less'

const menuList = [
  {
    url: '/manange_monitor',
    name: '操作审计'
  },
  {
    url: '/manange_monitor/query_log',
    name: '日志查询'
  },
  {
    url: '/manange_monitor/alarm_setting',
    name:'告警设置'
  },
  {
    url: '/manange_monitor/alarm_record',
    name: '告警记录'
  },
   {
    url: '/manange_monitor/alarm_group',
    name: '告警通知组'
  },
]

export default class ManageMonitor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerSiderStyle: 'normal'
    }
  }

  render() {
    const { children } = this.props
    const scope = this
    return (
      <div id="ManageMonitor">
        <QueueAnim
          className="ManageMonitorSiderAnimate"
          key="ManageMonitorSiderAnimate"
          type="left"
          >
          <div className={ this.state.containerSiderStyle == 'normal' ? 'ManageMonitorMenu CommonSecondMenu' : 'hiddenMenu ManageMonitorMenu CommonSecondMenu'} key='ManageMonitorSider'>
            <SecondSider menuList={menuList} scope={scope} />
          </div>
        </QueueAnim>
        <div className={ this.state.containerSiderStyle == 'normal' ? 'ManageMonitorContent CommonSecondContent' : 'hiddenContent ManageMonitorContent CommonSecondContent' } >
          {children}
        </div>
      </div>
    )
  }
}

ManageMonitor.propTypes = {
  // Injected by React Router
  children: PropTypes.node
}