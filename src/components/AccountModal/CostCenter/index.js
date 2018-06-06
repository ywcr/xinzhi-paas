/**
 * Licensed Materials - Property of paas.enncloud.cn
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  CostCenter
 *
 * v0.1 - 2016/11/30
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { Tabs, } from 'antd'
import CostRecord from './CostRecord'
import RechargeRecord from './RechargeRecord'
const mode = require('../../../../configs/model').mode
const standard = require('../../../../configs/constants').STANDARD_MODE
import Title from '../../Title'

const TabPane = Tabs.TabPane
const DEFAULT_TAB = '#consumptions'

class CostCenter extends Component {
  constructor(props) {
    super(props)
    this.onTabClick = this.onTabClick.bind(this)
    this.state = {
      activeTabKey: props.hash || DEFAULT_TAB,
    }
  }

  onTabClick(activeTabKey) {
    if (activeTabKey === this.state.activeTabKey) {
      return
    }
    const { pathname } = this.props
    this.setState({
      activeTabKey
    })
    /*if (activeTabKey === DEFAULT_TAB) {
      activeTabKey = ''
    }*/
    browserHistory.push({
      pathname,
      hash: activeTabKey
    })
  }

  // For tab select
  componentWillReceiveProps(nextProps) {
    let { hash } = nextProps
    if (hash === this.props.hash) {
      return
    }
    if (!hash) {
      hash = DEFAULT_TAB
    }
    this.setState({
      activeTabKey: hash
    })
  }

  render() {
    const { activeTabKey } = this.state
    return (
      <div id='CostCenter'>
        <Title title="费用中心" />
        <Tabs
          defaultActiveKey={DEFAULT_TAB}
          onTabClick={this.onTabClick}
          activeKey={activeTabKey}
          >
          <TabPane tab="消费记录" key="#consumptions">
            <CostRecord standard={mode === standard} />
          </TabPane>
          <TabPane tab="充值记录" key="#payments">
            <RechargeRecord standard={mode === standard} />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { hash, pathname } = props.location
  return {
    hash,
    pathname,
  }
}

export default connect(mapStateToProps, {
  //
})(CostCenter)